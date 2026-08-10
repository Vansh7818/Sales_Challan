import { Router } from 'express';
import { getChallans, getChallan, createChallan, confirmChallan } from '../controllers/challan.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', getChallans);
router.get('/:id', getChallan);
router.post('/', requireRole([Role.ADMIN, Role.SALES]), createChallan);
router.post('/:id/confirm', requireRole([Role.ADMIN, Role.SALES, Role.WAREHOUSE]), confirmChallan);

export default router;
