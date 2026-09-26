import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getBestSellerHampers,
  getSearchSuggestions,
  getProductBySlugOrId,
  getRestaurantFoods,
  seedRestaurantFoods,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../controllers/productController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import { createProductSchema, updateProductSchema } from '../validators/productValidators';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', getProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/featured', getFeaturedProducts);
router.get('/best-sellers', getBestSellerHampers);
router.get('/restaurant-food', getRestaurantFoods);
router.post('/seed-restaurant', authenticateJWT, requireAdmin, seedRestaurantFoods);
router.get('/:slugOrId', getProductBySlugOrId);

// Admin routes
router.post(
  '/',
  authenticateJWT,
  requireAdmin,
  validateRequest(createProductSchema),
  createProduct
);
router.put(
  '/:id',
  authenticateJWT,
  requireAdmin,
  validateRequest(updateProductSchema),
  updateProduct
);
router.delete('/:id', authenticateJWT, requireAdmin, deleteProduct);
router.post(
  '/upload-image',
  authenticateJWT,
  requireAdmin,
  upload.single('image'),
  uploadProductImage
);
router.post(
  '/:id/upload-image',
  authenticateJWT,
  requireAdmin,
  upload.single('image'),
  uploadProductImage
);

export default router;
