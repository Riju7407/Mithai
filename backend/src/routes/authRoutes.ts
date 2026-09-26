import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/authController';
import { authenticateJWT } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
} from '../validators/authValidators';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.get('/me', authenticateJWT, getMe);
router.put('/profile', authenticateJWT, validateRequest(updateProfileSchema), updateProfile);
router.put('/password', authenticateJWT, validateRequest(changePasswordSchema), changePassword);

// Addresses
router.get('/addresses', authenticateJWT, getAddresses);
router.post('/addresses', authenticateJWT, validateRequest(addressSchema), createAddress);
router.put('/addresses/:id', authenticateJWT, validateRequest(addressSchema), updateAddress);
router.delete('/addresses/:id', authenticateJWT, deleteAddress);

export default router;
