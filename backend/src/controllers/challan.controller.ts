import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { ChallanStatus, MovementType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const challanItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const createChallanSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(challanItemSchema).min(1),
});

export const getChallans = async (req: Request, res: Response) => {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        customer: { select: { name: true, businessName: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(challans);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getChallan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    return res.status(200).json(challan);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items } = createChallanSchema.parse(req.body);

    // Fetch product details for snapshot and validate stock
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      return res.status(400).json({ message: 'One or more products not found' });
    }

    let totalQty = 0;
    const challanItemsData = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
      totalQty += item.quantity;
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: item.quantity,
      };
    });

    // Generate unique challan number (e.g., CH-20231010-001)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.challan.count();
    const challanNo = `CH-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const challan = await prisma.challan.create({
      data: {
        challanNo,
        customerId,
        status: ChallanStatus.DRAFT,
        userId: req.user!.id,
        totalQty,
        items: {
          create: challanItemsData,
        },
      },
      include: { items: true },
    });

    return res.status(201).json(challan);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    if (error.message && error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    if (challan.status !== ChallanStatus.DRAFT) {
      return res.status(400).json({ message: 'Only draft challans can be confirmed' });
    }

    // Execute in transaction: Update challan, deduct stock, create stock logs
    await prisma.$transaction(async (tx) => {
      // 1. Confirm Challan
      await tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CONFIRMED },
      });

      // 2. Deduct stock and create logs
      for (const item of challan.items) {
        // Find product to check stock again (to prevent race conditions)
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.productName}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: MovementType.OUT,
            reason: `Sales Challan Confirmation: ${challan.challanNo}`,
            userId: req.user!.id,
          },
        });
      }
    });

    return res.status(200).json({ message: 'Challan confirmed successfully' });
  } catch (error: any) {
    if (error.message && error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
