import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { AdvanceBooking } from '../models/AdvanceBooking';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Payment } from '../models/Payment';
import { AdminAuditLog } from '../models/AdminAuditLog';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getDashboardKPIs = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // 1. Orders and Bookings today
    const [
      todayInstantOrders,
      monthInstantOrders,
      todayBookings,
      monthBookings,
      pendingOrdersCount,
      pendingBookingsCount,
      upcomingEventsCount,
      lowStockProducts,
    ] = await Promise.all([
      Order.find({ createdAt: { $gte: todayStart }, orderStatus: { $ne: 'Cancelled' } }),
      Order.find({ createdAt: { $gte: monthStart }, orderStatus: { $ne: 'Cancelled' } }),
      AdvanceBooking.find({ createdAt: { $gte: todayStart }, bookingStatus: { $ne: 'Cancelled' } }),
      AdvanceBooking.find({ createdAt: { $gte: monthStart }, bookingStatus: { $ne: 'Cancelled' } }),
      Order.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed', 'Preparing'] } }),
      AdvanceBooking.countDocuments({ bookingStatus: { $in: ['Received', 'Advance Confirmed', 'Scheduled', 'In Production'] } }),
      AdvanceBooking.countDocuments({
        eventDate: { $gte: todayStart },
        bookingStatus: { $nin: ['Fulfilled', 'Cancelled'] },
      }),
      Product.find({
        $expr: {
          $lte: [
            { $subtract: ['$stockQuantity', { $ifNull: ['$reservedStock', 0] }] },
            '$lowStockThreshold',
          ],
        },
        isActive: true,
      })
        .select('productName stockQuantity reservedStock lowStockThreshold finalPrice weightUnit')
        .limit(10),
    ]);

    const todayInstantRevenue = todayInstantOrders
      .filter((o) => o.paymentStatus === 'Paid')
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const todayBookingRevenue = todayBookings.reduce(
      (acc, b) => acc + (b.advanceAmountPaid || 0),
      0
    );

    const monthInstantRevenue = monthInstantOrders
      .filter((o) => o.paymentStatus === 'Paid')
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const monthBookingRevenue = monthBookings.reduce(
      (acc, b) => acc + (b.advanceAmountPaid || 0),
      0
    );

    // Pending balance across all active bookings
    const activeBookings = await AdvanceBooking.find({
      bookingStatus: { $nin: ['Fulfilled', 'Cancelled'] },
    });
    const pendingBalanceTotal = activeBookings.reduce(
      (acc, b) => acc + (b.balanceAmountDue || 0),
      0
    );

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Upcoming bookings
    const upcomingBookings = await AdvanceBooking.find({
      deliveryDate: { $gte: todayStart },
      bookingStatus: { $ne: 'Cancelled' },
    })
      .sort({ deliveryDate: 1 })
      .limit(5)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Dashboard KPIs calculated successfully.',
      data: {
        todayRevenue: todayInstantRevenue + todayBookingRevenue,
        monthlyRevenue: monthInstantRevenue + monthBookingRevenue,
        todayOrdersCount: todayInstantOrders.length + todayBookings.length,
        pendingOrdersCount,
        pendingBookingsCount,
        upcomingEventsCount,
        pendingBalanceTotal,
        lowStockCount: lowStockProducts.length,
        lowStockAlerts: lowStockProducts,
        recentOrders,
        upcomingBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const days = parseInt((req.query.days as string) || '14', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [orders, bookings] = await Promise.all([
      Order.find({
        createdAt: { $gte: startDate },
        paymentStatus: 'Paid',
      }),
      AdvanceBooking.find({
        createdAt: { $gte: startDate },
      }),
    ]);

    // Group by date (YYYY-MM-DD)
    const revenueMap: Record<string, { instant: number; advance: number; total: number }> = {};

    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      revenueMap[key] = { instant: 0, advance: 0, total: 0 };
    }

    orders.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().split('T')[0];
      if (revenueMap[key]) {
        revenueMap[key].instant += o.grandTotal;
        revenueMap[key].total += o.grandTotal;
      }
    });

    bookings.forEach((b) => {
      const key = new Date(b.createdAt).toISOString().split('T')[0];
      if (revenueMap[key]) {
        const paid = b.advanceAmountPaid || 0;
        revenueMap[key].advance += paid;
        revenueMap[key].total += paid;
      }
    });

    const series = Object.entries(revenueMap).map(([date, val]) => ({
      date,
      ...val,
    }));

    res.status(200).json({
      success: true,
      message: 'Revenue analytics aggregated.',
      data: series,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingCalendar = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month as string, 10) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year as string, 10) : now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const bookings = await AdvanceBooking.find({
      deliveryDate: { $gte: startOfMonth, $lte: endOfMonth },
      bookingStatus: { $ne: 'Cancelled' },
    }).populate('user', 'name email phone');

    const orders = await Order.find({
      deliveryDate: { $gte: startOfMonth, $lte: endOfMonth },
      orderStatus: { $ne: 'Cancelled' },
    }).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Calendar items retrieved.',
      data: {
        bookings,
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingKanban = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const columns = [
      'Received',
      'Advance Confirmed',
      'Scheduled',
      'In Production',
      'Dispatched',
      'Fulfilled',
    ];

    const bookings = await AdvanceBooking.find({
      bookingStatus: { $ne: 'Cancelled' },
    })
      .sort({ deliveryDate: 1 })
      .populate('user', 'name email phone');

    const kanbanData: Record<string, any[]> = {};
    columns.forEach((col) => {
      kanbanData[col] = bookings.filter((b) => b.bookingStatus === col);
    });

    res.status(200).json({
      success: true,
      message: 'Kanban columns retrieved.',
      data: kanbanData,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const query: any = { role: 'CUSTOMER' };

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).select('-passwordHash'),
      User.countDocuments(query),
    ]);

    // Augment with spend and order counts
    const augmentedUsers = await Promise.all(
      users.map(async (u) => {
        const [orders, bookings] = await Promise.all([
          Order.find({ user: u._id, paymentStatus: 'Paid' }),
          AdvanceBooking.find({ user: u._id }),
        ]);

        const instantSpend = orders.reduce((acc, o) => acc + o.grandTotal, 0);
        const bookingSpend = bookings.reduce((acc, b) => acc + (b.advanceAmountPaid || 0), 0);

        return {
          ...u.toObject(),
          totalOrdersCount: orders.length,
          totalBookingsCount: bookings.length,
          totalSpend: instantSpend + bookingSpend,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully.',
      data: augmentedUsers,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCustomerStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    await AdminAuditLog.create({
      admin: req.user!._id,
      adminEmail: req.user!.email,
      action: user.isActive ? 'ACTIVATE_CUSTOMER' : 'DEACTIVATE_CUSTOMER',
      resource: 'USER',
      resourceId: user._id.toString(),
      details: { email: user.email, isActive: user.isActive },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = '1', limit = '20', resource } = req.query;
    const query: any = {};
    if (resource && typeof resource === 'string') {
      query.resource = resource;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AdminAuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AdminAuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved.',
      data: logs,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};
