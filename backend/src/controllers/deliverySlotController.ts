import { Request, Response, NextFunction } from 'express';
import { DeliverySlot } from '../models/DeliverySlot';
import { Order } from '../models/Order';
import { AdvanceBooking } from '../models/AdvanceBooking';
import { Setting } from '../models/Setting';
import { AuthenticatedRequest } from '../middlewares/auth';
import { computeSlotCutoff, formatNoticeText } from '../utils/deliveryCutoff';

export const getDeliverySlots = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date, orderType } = req.query;

    const query: any = { active: true };
    if (orderType && typeof orderType === 'string' && orderType !== 'ALL') {
      query.orderType = { $in: ['ALL', orderType] };
    }

    const [slots, settings] = await Promise.all([
      DeliverySlot.find(query).sort({ startTime: 1 }),
      Setting.findOne(),
    ]);

    const globalCutoffValue = settings?.sameDaySlotCutoffValue ?? 1;
    const globalCutoffUnit = settings?.sameDaySlotCutoffUnit ?? 'hours';
    const globalNoticeText = formatNoticeText(globalCutoffValue, globalCutoffUnit);

    // If date provided, calculate booked count for each slot
    if (date && typeof date === 'string') {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const now = new Date();
      const isToday =
        startOfDay.getFullYear() === now.getFullYear() &&
        startOfDay.getMonth() === now.getMonth() &&
        startOfDay.getDate() === now.getDate();

      const slotsWithCapacity = await Promise.all(
        slots.map(async (slot) => {
          const [orderCount, bookingCount] = await Promise.all([
            Order.countDocuments({
              deliveryDate: { $gte: startOfDay, $lte: endOfDay },
              deliverySlot: slot.title,
              orderStatus: { $ne: 'Cancelled' },
            }),
            AdvanceBooking.countDocuments({
              deliveryDate: { $gte: startOfDay, $lte: endOfDay },
              deliverySlot: slot.title,
              bookingStatus: { $ne: 'Cancelled' },
            }),
          ]);

          let isPastCutoff = false;
          let cutoffMessage: string | undefined = undefined;

          if (isToday && slot.startTime) {
            const slotCutoffConfig = {
              cutoffValue: slot.customCutoffValue != null ? slot.customCutoffValue : globalCutoffValue,
              cutoffUnit: slot.customCutoffUnit || globalCutoffUnit,
            };
            const cutoffResult = computeSlotCutoff(slot.startTime, slotCutoffConfig, now);
            isPastCutoff = cutoffResult.isPastCutoff;
            if (isPastCutoff) {
              cutoffMessage = cutoffResult.cutoffMessage;
            }
          }

          const bookedCount = orderCount + bookingCount;
          const availableCount = Math.max(0, slot.maxCapacity - bookedCount);
          const isFullyBooked = availableCount <= 0;
          const isAvailable = !isFullyBooked && !isPastCutoff;

          return {
            ...slot.toObject(),
            bookedCount,
            availableCount,
            isFullyBooked,
            isPastCutoff,
            isAvailable,
            cutoffMessage,
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Delivery slots retrieved with date capacity.',
        data: slotsWithCapacity,
        meta: {
          globalCutoffValue,
          globalCutoffUnit,
          globalNoticeText,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Delivery slots retrieved successfully.',
      data: slots,
      meta: {
        globalCutoffValue,
        globalCutoffUnit,
        globalNoticeText,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDeliverySlot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slot = await DeliverySlot.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Delivery slot created successfully.',
      data: slot,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeliverySlot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const slot = await DeliverySlot.findByIdAndUpdate(id, req.body, { new: true });
    if (!slot) {
      res.status(404).json({ success: false, message: 'Delivery slot not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Delivery slot updated successfully.',
      data: slot,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDeliverySlot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await DeliverySlot.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Delivery slot deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
