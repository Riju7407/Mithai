import { Request, Response, NextFunction } from 'express';
import { Banner } from '../models/Banner';
import { Announcement } from '../models/Announcement';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getBanners = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type } = req.query;
    const query: any = { isActive: true };
    if (type && typeof type === 'string') {
      query.bannerType = type;
    }

    const banners = await Banner.find(query).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Banners retrieved successfully.',
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncement = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const announcement = await Announcement.findOne({ isActive: true }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Active announcement retrieved.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Banner created successfully.',
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    if (!banner) {
      res.status(404).json({ success: false, message: 'Banner not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Banner updated successfully.',
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let announcement = await Announcement.findOne();
    if (!announcement) {
      announcement = await Announcement.create(req.body);
    } else {
      announcement.set(req.body);
      await announcement.save();
    }

    res.status(200).json({
      success: true,
      message: 'Announcement bar updated successfully.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};
