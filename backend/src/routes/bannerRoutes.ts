import { Router } from 'express';
import {
  getBanners,
  getAnnouncement,
  createBanner,
  updateBanner,
  deleteBanner,
  updateAnnouncement,
} from '../controllers/bannerController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getBanners);
router.get('/announcements', getAnnouncement);
router.post('/', authenticateJWT, requireAdmin, createBanner);
router.put('/:id', authenticateJWT, requireAdmin, updateBanner);
router.delete('/:id', authenticateJWT, requireAdmin, deleteBanner);
router.put('/announcements/current', authenticateJWT, requireAdmin, updateAnnouncement);

export default router;
