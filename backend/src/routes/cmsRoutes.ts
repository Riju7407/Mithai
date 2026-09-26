import { Router } from 'express';
import {
  getCMSPageBySlug,
  getAllCMSPages,
  upsertCMSPage,
} from '../controllers/cmsController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getAllCMSPages);
router.get('/:slug', getCMSPageBySlug);
router.put('/:slug', authenticateJWT, requireAdmin, upsertCMSPage);

export default router;
