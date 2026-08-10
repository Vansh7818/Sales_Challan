import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

const customerSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(10),
  email: z.string().email(),
  businessName: z.string().min(1),
  gstNumber: z.string().optional(),
  type: z.enum([CustomerType.RETAIL, CustomerType.WHOLESALE, CustomerType.DISTRIBUTOR]),
  address: z.string().min(5),
  status: z.enum([CustomerStatus.LEAD, CustomerStatus.ACTIVE, CustomerStatus.INACTIVE]),
  notes: z.string().optional(),
  followUpDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
});

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { businessName: { contains: String(search), mode: 'insensitive' } },
        { mobile: { contains: String(search) } }
      ];
    }
    if (status) {
      where.status = status;
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(customers);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { challans: true }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json(customer);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const data = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({ data });
    return res.status(201).json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = customerSchema.partial().parse(req.body);
    
    const customer = await prisma.customer.update({
      where: { id },
      data
    });
    return res.status(200).json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
