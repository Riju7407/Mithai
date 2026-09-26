import { Router } from 'express';
import {
  getDeliverySlots,
  createDeliverySlot,
  updateDeliverySlot,
  deleteDeliverySlot,
} from '../controllers/deliverySlotController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getDeliverySlots);
router.post('/', authenticateJWT, requireAdmin, createDeliverySlot);
router.put('/:id', authenticateJWT, requireAdmin, updateDeliverySlot);
router.delete('/:id', authenticateJWT, requireAdmin, deleteDeliverySlot);

export default router;
