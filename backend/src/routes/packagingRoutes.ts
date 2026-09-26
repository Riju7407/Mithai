import { Router } from 'express';
import {
  getPackagingOptions,
  createPackagingOption,
  updatePackagingOption,
  deletePackagingOption,
} from '../controllers/packagingController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getPackagingOptions);
router.post('/', authenticateJWT, requireAdmin, createPackagingOption);
router.put('/:id', authenticateJWT, requireAdmin, updatePackagingOption);
router.delete('/:id', authenticateJWT, requireAdmin, deletePackagingOption);

export default router;
