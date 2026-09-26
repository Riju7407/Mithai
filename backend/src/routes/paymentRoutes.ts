import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getPayments,
} from '../controllers/paymentController';
import { authenticateJWT } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
} from '../validators/paymentValidators';

const router = Router();

router.post(
  '/razorpay/create-order',
  authenticateJWT,
  validateRequest(createRazorpayOrderSchema),
  createRazorpayOrder
);
router.post(
  '/razorpay/verify',
  authenticateJWT,
  validateRequest(verifyRazorpayPaymentSchema),
  verifyRazorpayPayment
);
router.post('/razorpay/webhook', handleRazorpayWebhook);
router.get('/', authenticateJWT, getPayments);

export default router;
