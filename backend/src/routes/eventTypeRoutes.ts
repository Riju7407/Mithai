import { Router } from 'express';
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from '../controllers/eventTypeController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getEventTypes);
router.post('/', authenticateJWT, requireAdmin, createEventType);
router.put('/:id', authenticateJWT, requireAdmin, updateEventType);
router.delete('/:id', authenticateJWT, requireAdmin, deleteEventType);

export default router;
