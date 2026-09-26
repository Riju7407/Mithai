import { Router } from 'express';
import {
  createInstantOrder,
  getOrders,
  getOrderByIdOrNumber,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import { createInstantOrderSchema, updateOrderStatusSchema } from '../validators/orderValidators';

const router = Router();

router.post('/', authenticateJWT, validateRequest(createInstantOrderSchema), createInstantOrder);
router.get('/', authenticateJWT, getOrders);
router.get('/:idOrNumber', authenticateJWT, getOrderByIdOrNumber);
router.post('/:id/cancel', authenticateJWT, cancelOrder);

// Admin status updates
router.patch(
  '/:id/status',
  authenticateJWT,
  requireAdmin,
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
