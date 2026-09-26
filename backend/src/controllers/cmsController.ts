import { Request, Response, NextFunction } from 'express';
import { CMSPage } from '../models/CMSPage';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getCMSPageBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const page = await CMSPage.findOne({ slug, isActive: true });
    if (!page) {
      res.status(404).json({ success: false, message: 'Page content not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Page content retrieved.',
      data: page,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCMSPages = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pages = await CMSPage.find();
    res.status(200).json({
      success: true,
      message: 'CMS pages retrieved.',
      data: pages,
    });
  } catch (error) {
    next(error);
  }
};

export const upsertCMSPage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const { title, content, metaTitle, metaDescription, isActive } = req.body;

    const page = await CMSPage.findOneAndUpdate(
      { slug },
      { title, content, metaTitle, metaDescription, isActive },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'CMS page saved successfully.',
      data: page,
    });
  } catch (error) {
    next(error);
  }
};
