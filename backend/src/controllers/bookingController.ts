import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AdvanceBooking, IAdvanceBooking } from '../models/AdvanceBooking';
import { Product } from '../models/Product';
import { Setting } from '../models/Setting';
import { PackagingOption } from '../models/PackagingOption';
import { DeliverySlot } from '../models/DeliverySlot';
import { AuthenticatedRequest } from '../middlewares/auth';
import { generateBookingNumber } from '../utils/idGenerator';
import { resolveProductUnitPrice, calculateOrderTotals, ICalculatedItem } from '../utils/pricingCalculator';
import { AdminAuditLog } from '../models/AdminAuditLog';

export const createAdvanceBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | null = null;
  let hasTransaction = false;

  const topologyType = (mongoose.connection as any).client?.topology?.description?.type;
  const supportsTransactions = topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';

  if (supportsTransactions) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      hasTransaction = true;
    } catch {
      session = null;
      hasTransaction = false;
    }
  }

  const abortAndEnd = async () => {
    if (session && hasTransaction) {
      try {
        await session.abortTransaction();
      } catch (e) {}
      session.endSession();
    }
  };

  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      eventType,
      eventName,
      eventDate,
      numberOfGuests,
      deliveryDate,
      deliverySlot,
      deliveryAddress,
      contactNumber,
      packagingOptionId,
      customRequirements,
      specialInstructions,
      customMessage,
      paymentPreference,
      items,
    } = req.body;

    const userId = req.user ? req.user._id : null;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Please log in to book an event.' });
      return;
    }

    // 1. Fetch settings
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    // 2. Validate Booking Date Constraints (Min / Max Advance Days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDeliveryDate = new Date(deliveryDate);
    targetDeliveryDate.setHours(0, 0, 0, 0);

    const diffTime = targetDeliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const minDays = settings.minAdvanceBookingDays || 3;
    const maxDays = settings.maxAdvanceBookingDays || 90;

    if (diffDays < minDays) {
      await abortAndEnd();
      res.status(400).json({
        success: false,
        message: `Advance bookings must be scheduled at least ${minDays} days in advance.`,
      });
      return;
    }

    if (diffDays > maxDays) {
      await abortAndEnd();
      res.status(400).json({
        success: false,
        message: `Bookings can only be scheduled up to ${maxDays} days in advance.`,
      });
      return;
    }

    // 3. Packaging Extra Price
    let packagingInfo = {
      optionName: 'Standard Packaging',
      extraPrice: 0,
      packagingRef: undefined as any,
    };

    if (packagingOptionId && mongoose.Types.ObjectId.isValid(packagingOptionId)) {
      const pkg = await PackagingOption.findById(packagingOptionId);
      if (pkg && pkg.active) {
        packagingInfo = {
          optionName: pkg.name,
          extraPrice: pkg.extraPrice,
          packagingRef: pkg._id,
        };
      }
    }

    // 4. Validate Items and Reserve Inventory
    const calculatedItems: ICalculatedItem[] = [];

    for (const item of items) {
      const product = session && hasTransaction
        ? await Product.findById(item.productId).session(session)
        : await Product.findById(item.productId);

      if (!product || !product.isActive) {
        await abortAndEnd();
        res.status(400).json({
          success: false,
          message: 'One or more selected products are inactive or invalid.',
        });
        return;
      }

      if (!product.availableForAdvance) {
        await abortAndEnd();
        res.status(400).json({
          success: false,
          message: `${product.productName} is not available for advance event booking.`,
        });
        return;
      }

      // Check min advance days specifically required for this product if any
      if (product.minAdvanceBookingDays && diffDays < product.minAdvanceBookingDays) {
        await abortAndEnd();
        res.status(400).json({
          success: false,
          message: `${product.productName} requires at least ${product.minAdvanceBookingDays} days advance notice.`,
        });
        return;
      }

      // Reserve stock for the event
      product.reservedStock = (product.reservedStock || 0) + item.quantity;
      if (session && hasTransaction) {
        await product.save({ session });
      } else {
        await product.save();
      }

      const resolved = resolveProductUnitPrice(product, undefined, item.quantity);
      const subtotal = resolved.unitPrice * item.quantity;

      calculatedItems.push({
        product: product._id.toString(),
        productName: product.productName,
        unit: item.unit || resolved.unit,
        quantity: item.quantity,
        unitPrice: resolved.unitPrice,
        subtotal,
        imageUrl: product.productImages[0]?.url || '',
      });
    }

    // 5. Authoritative Totals & Deposit Split
    const totals = calculateOrderTotals(
      calculatedItems,
      settings,
      null, // coupons for bulk events if applicable or none
      'DELIVERY',
      packagingInfo.extraPrice,
      true // isAdvanceBooking
    );

    const bookingNumber = generateBookingNumber();

    const advanceBooking = new AdvanceBooking({
      bookingNumber,
      user: userId,
      customerName,
      customerEmail,
      customerPhone,
      eventType,
      eventName,
      eventDate: new Date(eventDate),
      numberOfGuests,
      deliveryDate: targetDeliveryDate,
      deliverySlot,
      deliveryAddress,
      contactNumber,
      items: calculatedItems,
      packaging: packagingInfo,
      customRequirements,
      specialInstructions,
      customMessage,
      paymentPreference: paymentPreference || 'DEPOSIT',
      totalAmount: totals.grandTotal,
      advanceDepositRequired: totals.advanceDepositRequired || Math.round(totals.grandTotal * 0.3),
      advanceAmountPaid: 0,
      balanceAmountDue: totals.grandTotal,
      paymentStatus: 'Pending',
      bookingStatus: 'Received',
      statusHistory: [
        {
          status: 'Received',
          timestamp: new Date(),
          note: 'Event booking request submitted.',
          updatedBy: 'Customer',
        },
      ],
    });

    if (session && hasTransaction) {
      await advanceBooking.save({ session });
      await session.commitTransaction();
      session.endSession();
    } else {
      await advanceBooking.save();
    }

    res.status(201).json({
      success: true,
      message: 'Advance event booking created successfully.',
      data: advanceBooking,
    });
  } catch (error) {
    if (session && hasTransaction) {
      try {
        await session.abortTransaction();
      } catch (e) {}
      session.endSession();
    }
    next(error);
  }
};

export const getAdvanceBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      paymentStatus,
      eventType,
      search,
      startDate,
      endDate,
    } = req.query;

    const query: any = {};

    if (req.user!.role !== 'ADMIN') {
      query.user = req.user!._id;
    } else {
      if (search && typeof search === 'string') {
        query.$or = [
          { bookingNumber: { $regex: search.trim(), $options: 'i' } },
          { customerName: { $regex: search.trim(), $options: 'i' } },
          { customerEmail: { $regex: search.trim(), $options: 'i' } },
          { eventName: { $regex: search.trim(), $options: 'i' } },
        ];
      }
    }

    if (status && typeof status === 'string') {
      query.bookingStatus = status;
    }

    if (paymentStatus && typeof paymentStatus === 'string') {
      query.paymentStatus = paymentStatus;
    }

    if (eventType && typeof eventType === 'string') {
      query.eventType = eventType;
    }

    if (startDate || endDate) {
      query.deliveryDate = {};
      if (startDate) query.deliveryDate.$gte = new Date(startDate as string);
      if (endDate) query.deliveryDate.$lte = new Date(endDate as string);
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      AdvanceBooking.find(query)
        .sort({ deliveryDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email phone'),
      AdvanceBooking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Advance bookings retrieved successfully.',
      data: bookings,
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

export const getAdvanceBookingByIdOrNumber = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrNumber } = req.params;

    let query: any = { bookingNumber: idOrNumber };
    if (mongoose.Types.ObjectId.isValid(idOrNumber)) {
      query = { $or: [{ _id: idOrNumber }, { bookingNumber: idOrNumber }] };
    }

    const booking = await AdvanceBooking.findOne(query).populate('user', 'name email phone');
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && booking.user._id.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Booking details retrieved successfully.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Booking Status
export const updateBookingStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { bookingStatus, note, internalNotes } = req.body;

    const booking = await AdvanceBooking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const previousStatus = booking.bookingStatus;
    booking.bookingStatus = bookingStatus;
    if (internalNotes) booking.internalNotes = internalNotes;

    booking.statusHistory.push({
      status: bookingStatus,
      timestamp: new Date(),
      note: note || `Status updated from ${previousStatus} to ${bookingStatus}`,
      updatedBy: req.user!.name || 'Administrator',
    });

    await booking.save();

    await AdminAuditLog.create({
      admin: req.user!._id,
      adminEmail: req.user!.email,
      action: 'UPDATE_BOOKING_STATUS',
      resource: 'ADVANCE_BOOKING',
      resourceId: booking._id.toString(),
      details: { previousStatus, newStatus: bookingStatus, note },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${bookingStatus}'.`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Booking
export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await AdvanceBooking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && booking.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    if (['Dispatched', 'Fulfilled', 'Cancelled'].includes(booking.bookingStatus)) {
      res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled because it is ${booking.bookingStatus}.`,
      });
      return;
    }

    booking.bookingStatus = 'Cancelled';
    booking.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: reason || 'Booking cancelled',
      updatedBy: req.user!.name,
    });

    // Release reserved inventory
    for (const item of booking.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { reservedStock: -item.quantity },
      });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and reserved stock released.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
