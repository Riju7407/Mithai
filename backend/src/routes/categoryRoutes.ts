import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.post('/', authenticateJWT, requireAdmin, createCategory);
router.put('/:id', authenticateJWT, requireAdmin, updateCategory);
router.delete('/:id', authenticateJWT, requireAdmin, deleteCategory);

export default router;
