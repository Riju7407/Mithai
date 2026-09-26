import { Router } from 'express';
import {
  createAdvanceBooking,
  getAdvanceBookings,
  getAdvanceBookingByIdOrNumber,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import {
  createAdvanceBookingSchema,
  updateBookingStatusSchema,
} from '../validators/bookingValidators';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  validateRequest(createAdvanceBookingSchema),
  createAdvanceBooking
);
router.get('/', authenticateJWT, getAdvanceBookings);
router.get('/:idOrNumber', authenticateJWT, getAdvanceBookingByIdOrNumber);
router.post('/:id/cancel', authenticateJWT, cancelBooking);

// Admin status updates
router.patch(
  '/:id/status',
  authenticateJWT,
  requireAdmin,
  validateRequest(updateBookingStatusSchema),
  updateBookingStatus
);

export default router;
