import { Router } from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer } from '../controllers/customer.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', requireRole(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', requireRole(['ADMIN', 'SALES']), updateCustomer);

export default router;
