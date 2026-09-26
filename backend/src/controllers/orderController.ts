import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { Setting } from '../models/Setting';
import { DeliverySlot } from '../models/DeliverySlot';
import { AuthenticatedRequest } from '../middlewares/auth';
import { generateOrderNumber } from '../utils/idGenerator';
import { resolveProductUnitPrice, calculateOrderTotals, ICalculatedItem } from '../utils/pricingCalculator';
import { AdminAuditLog } from '../models/AdminAuditLog';
import { computeSlotCutoff } from '../utils/deliveryCutoff';

export const createInstantOrder = async (
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

  const commitAndEnd = async () => {
    if (session && hasTransaction) {
      try {
        await session.commitTransaction();
      } catch (e) {}
      session.endSession();
    }
  };

  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryMethod,
      deliveryDate,
      deliverySlot,
      shippingAddress,
      couponCode,
      paymentMethod = 'ONLINE',
      notes,
      items,
    } = req.body;

    const userId = req.user ? req.user._id : null;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Please log in to place an order.' });
      return;
    }

    // 1. Fetch settings
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    // 2. Validate Delivery Slot Capacity & 1-Hour Advance Cutoff for date
    const slotDoc = await DeliverySlot.findOne({ title: deliverySlot, active: true });
    if (slotDoc) {
      const startOfDay = new Date(deliveryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(deliveryDate);
      endOfDay.setHours(23, 59, 59, 999);

      const now = new Date();
      const isToday =
        startOfDay.getFullYear() === now.getFullYear() &&
        startOfDay.getMonth() === now.getMonth() &&
        startOfDay.getDate() === now.getDate();

      // Enforce: If today's date, delivery slot must be booked before the dynamic cutoff buffer
      if (isToday && slotDoc.startTime) {
        const slotCutoffConfig = {
          cutoffValue: slotDoc.customCutoffValue != null ? slotDoc.customCutoffValue : settings.sameDaySlotCutoffValue,
          cutoffUnit: slotDoc.customCutoffUnit || settings.sameDaySlotCutoffUnit,
        };
        const cutoffResult = computeSlotCutoff(slotDoc.startTime, slotCutoffConfig, now);

        if (cutoffResult.isPastCutoff) {
          await abortAndEnd();
          res.status(400).json({
            success: false,
            message: cutoffResult.getRejectionMessage(deliverySlot),
          });
          return;
        }
      }

      const existingOrdersInSlot = await Order.countDocuments({
        deliveryDate: { $gte: startOfDay, $lte: endOfDay },
        deliverySlot: slotDoc.title,
        orderStatus: { $ne: 'Cancelled' },
      });

      if (existingOrdersInSlot >= slotDoc.maxCapacity) {
        await abortAndEnd();
        res.status(400).json({
          success: false,
          message: `The selected delivery slot '${deliverySlot}' is fully booked for this date. Please choose another slot.`,
        });
        return;
      }
    }

    // 3. Validate products, inventory and calculate authoritative item subtotals
    const calculatedItems: ICalculatedItem[] = [];

    for (const item of items) {
      const product = session && hasTransaction
        ? await Product.findById(item.productId).session(session)
        : await Product.findById(item.productId);

      if (!product || !product.isActive) {
        await abortAndEnd();
        res.status(400).json({
          success: false,
          message: `Product not found or inactive.`,
        });
        return;
      }

      if (!product.availableForInstant) {
        await abortAndEnd();
        res.status(400).json({
          success: false,
          message: `${product.productName} is only available for advance event bookings.`,
        });
        return;
      }

      // Check available stock
      const availableStock = product.stockQuantity - (product.reservedStock || 0);
      if (availableStock < item.quantity) {
        await abortAndEnd();
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.productName}. Only ${availableStock} units available.`,
        });
        return;
      }

      // Decrement stock atomically
      product.stockQuantity -= item.quantity;
      if (session && hasTransaction) {
        await product.save({ session });
      } else {
        await product.save();
      }

      // Calculate unit price authoritatively
      const resolved = resolveProductUnitPrice(product, item.variantName, item.quantity);
      const itemSubtotal = resolved.unitPrice * item.quantity;

      calculatedItems.push({
        product: product._id.toString(),
        productName: product.productName,
        variantName: resolved.matchedVariantName,
        unit: resolved.unit,
        quantity: item.quantity,
        unitPrice: resolved.unitPrice,
        subtotal: itemSubtotal,
        imageUrl: product.productImages[0]?.url || '',
      });
    }

    // 4. Validate Coupon if provided
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        coupon.usedCount += 1;
        if (session && hasTransaction) {
          await coupon.save({ session });
        } else {
          await coupon.save();
        }
      }
    }

    // 5. Authoritatively calculate grand totals, taxes, discounts, delivery fee
    const totals = calculateOrderTotals(
      calculatedItems,
      settings,
      coupon,
      deliveryMethod,
      0, // no packaging extra for instant orders
      false
    );

    if (paymentMethod === 'COD' && !settings.enableCashOnDelivery) {
      await abortAndEnd();
      res.status(400).json({
        success: false,
        message: 'Cash Home Delivery is currently unavailable. Please choose online payment.',
      });
      return;
    }

    const isCOD = paymentMethod === 'COD';
    const initialOrderStatus = isCOD ? 'Confirmed' : 'Pending';
    const initialNote = isCOD ? 'Order placed via Cash Home Delivery (COD).' : 'Order placed by customer (Pending Online Payment).';

    const orderNumber = generateOrderNumber();

    const newOrder = new Order({
      orderNumber,
      user: userId,
      customerName,
      customerEmail,
      customerPhone,
      orderType: 'INSTANT',
      items: calculatedItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      couponCode: totals.couponCode,
      deliveryFee: totals.deliveryFee,
      tax: totals.tax,
      grandTotal: totals.grandTotal,
      paymentStatus: 'Pending',
      paymentMethod: isCOD ? 'COD' : 'ONLINE',
      orderStatus: initialOrderStatus,
      deliveryMethod: deliveryMethod || 'DELIVERY',
      deliveryDate: new Date(deliveryDate),
      deliverySlot,
      shippingAddress,
      notes,
      statusHistory: [
        {
          status: initialOrderStatus,
          timestamp: new Date(),
          note: initialNote,
          updatedBy: 'Customer',
        },
      ],
    });

    if (session && hasTransaction) {
      await newOrder.save({ session });
    } else {
      await newOrder.save();
    }

    await commitAndEnd();

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: newOrder,
    });
  } catch (error) {
    await abortAndEnd();
    next(error);
  }
};

export const getOrders = async (
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
      search,
      startDate,
      endDate,
    } = req.query;

    const query: any = {};

    // If regular customer, show only their own orders
    if (req.user!.role !== 'ADMIN') {
      query.user = req.user!._id;
    } else {
      // If admin and search query provided
      if (search && typeof search === 'string') {
        query.$or = [
          { orderNumber: { $regex: search.trim(), $options: 'i' } },
          { customerName: { $regex: search.trim(), $options: 'i' } },
          { customerEmail: { $regex: search.trim(), $options: 'i' } },
          { customerPhone: { $regex: search.trim(), $options: 'i' } },
        ];
      }
    }

    if (status && typeof status === 'string') {
      query.orderStatus = status;
    }

    if (paymentStatus && typeof paymentStatus === 'string') {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email phone'),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully.',
      data: orders,
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

export const getOrderByIdOrNumber = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrNumber } = req.params;

    let query: any = { orderNumber: idOrNumber };
    if (mongoose.Types.ObjectId.isValid(idOrNumber)) {
      query = { $or: [{ _id: idOrNumber }, { orderNumber: idOrNumber }] };
    }

    const order = await Order.findOne(query).populate('user', 'name email phone');
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // Check ownership if not admin
    if (req.user!.role !== 'ADMIN' && order.user._id.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update order status (with state transition rules)
export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { orderStatus, note, internalNotes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    if (internalNotes) order.internalNotes = internalNotes;

    order.statusHistory.push({
      status: orderStatus,
      timestamp: new Date(),
      note: note || `Status updated from ${previousStatus} to ${orderStatus}`,
      updatedBy: req.user!.name || 'Administrator',
    });

    await order.save();

    await AdminAuditLog.create({
      admin: req.user!._id,
      adminEmail: req.user!.email,
      action: 'UPDATE_ORDER_STATUS',
      resource: 'ORDER',
      resourceId: order._id.toString(),
      details: { previousStatus, newStatus: orderStatus, note },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to '${orderStatus}'.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Order (by Customer or Admin)
export const cancelOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && order.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    if (['Delivered', 'Completed', 'Cancelled'].includes(order.orderStatus)) {
      res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.orderStatus}.`,
      });
      return;
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: reason || 'Order cancelled',
      updatedBy: req.user!.name,
    });

    // Restore inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
