import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { MovementType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unitPrice: z.number().min(0),
  currentStock: z.number().int().min(0).optional(),
  minStockAlert: z.number().int().min(0),
  location: z.string().min(1)
});

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const data = productSchema.parse(req.body);
    
    // Check if sku exists
    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const product = await prisma.product.create({ data });

    // If initial stock is greater than 0, create a stock movement
    if (product.currentStock > 0 && req.user) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: product.currentStock,
          type: MovementType.IN,
          reason: 'Initial Stock Entry',
          userId: req.user.id
        }
      });
    }

    return res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = productSchema.partial().parse(req.body);
    
    const product = await prisma.product.update({
      where: { id },
      data
    });
    return res.status(200).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      quantity: z.number().int().positive(),
      reason: z.string().min(1)
    });
    
    const { quantity, reason } = schema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: { currentStock: { increment: quantity } }
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity,
          type: MovementType.IN,
          reason,
          userId: req.user!.id
        }
      });

      return { product, movement };
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStockLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = await prisma.stockMovement.findMany({
      where: { productId: id },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { timestamp: 'desc' }
    });

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
