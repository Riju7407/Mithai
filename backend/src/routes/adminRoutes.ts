import { Router } from 'express';
import {
  getDashboardKPIs,
  getRevenueAnalytics,
  getBookingCalendar,
  getBookingKanban,
  getCustomers,
  toggleCustomerStatus,
  getAuditLogs,
} from '../controllers/analyticsController';
import { authenticateJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

// All admin analytics and dashboard routes are protected
router.use(authenticateJWT, requireAdmin);

router.get('/dashboard', getDashboardKPIs);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/calendar', getBookingCalendar);
router.get('/kanban', getBookingKanban);
router.get('/customers', getCustomers);
router.patch('/customers/:id/toggle-status', toggleCustomerStatus);
router.get('/audit-logs', getAuditLogs);

export default router;
