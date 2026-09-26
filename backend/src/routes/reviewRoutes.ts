import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  getCenturiesOfTrustReviews,
  getPendingOrderReview,
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController';
import { authenticateJWT, optionalAuth, requireAdmin } from '../middlewares/auth';

const router = Router();

// Public / Customer routes
router.get('/testimonials', getCenturiesOfTrustReviews);
router.get('/product/:productId', getProductReviews);
router.get('/pending-order-review', authenticateJWT, getPendingOrderReview);
router.post('/', optionalAuth, createReview);

// Admin routes
router.get('/admin', authenticateJWT, requireAdmin, getAdminReviews);
router.put('/admin/:id/status', authenticateJWT, requireAdmin, updateReviewStatus);
router.delete('/admin/:id', authenticateJWT, requireAdmin, deleteReview);

export default router;
