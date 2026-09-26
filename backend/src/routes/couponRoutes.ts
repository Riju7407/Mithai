import { Router } from 'express';
import {
  applyCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

router.post('/apply', applyCoupon);
router.get('/', authenticateJWT, requireAdmin, getCoupons);
router.post('/', authenticateJWT, requireAdmin, createCoupon);
router.put('/:id', authenticateJWT, requireAdmin, updateCoupon);
router.delete('/:id', authenticateJWT, requireAdmin, deleteCoupon);

export default router;
