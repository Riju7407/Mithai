import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon';
import { AuthenticatedRequest } from '../middlewares/auth';

export const applyCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required.' });
      return;
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
      return;
    }

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      res.status(400).json({ success: false, message: 'This coupon has expired.' });
      return;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'This coupon usage limit has been reached.' });
      return;
    }

    const subtotal = parseFloat(orderAmount) || 0;
    if (subtotal < coupon.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Coupon requires a minimum order value of ₹${coupon.minOrderValue}.`,
      });
      return;
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      const raw = (subtotal * coupon.discountValue) / 100;
      discount = coupon.maxDiscountAmount ? Math.min(raw, coupon.maxDiscountAmount) : raw;
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, subtotal);

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully.`,
      data: {
        code: coupon.code,
        discount,
        description: coupon.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Coupons retrieved successfully.',
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully.',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
