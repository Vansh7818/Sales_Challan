import { Router } from 'express';
import { getProducts, createProduct, updateProduct, addStock, getStockLogs } from '../controllers/product.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);
router.post('/', requireRole([Role.ADMIN, Role.WAREHOUSE]), createProduct);
router.put('/:id', requireRole([Role.ADMIN, Role.WAREHOUSE]), updateProduct);
router.post('/:id/stock', requireRole([Role.ADMIN, Role.WAREHOUSE]), addStock);
router.get('/:id/stock-logs', getStockLogs);

export default router;
