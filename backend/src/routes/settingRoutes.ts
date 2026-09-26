import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticateJWT, requireAdmin, updateSettings);

// Explicit Footer shortcuts
router.get('/footer', getSettings);
router.put('/footer', authenticateJWT, requireAdmin, updateSettings);

export default router;
