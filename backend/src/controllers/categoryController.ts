import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AdminAuditLog } from '../models/AdminAuditLog';

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .populate('parentCategory', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully.',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true }).populate(
      'parentCategory',
      'name slug'
    );

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, image, parentCategory, displayOrder, isActive } = req.body;

    const slug = req.body.slug
      ? req.body.slug
      : name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentCategory: parentCategory || null,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await AdminAuditLog.create({
      admin: req.user!._id,
      adminEmail: req.user!.email,
      action: 'CREATE_CATEGORY',
      resource: 'CATEGORY',
      resourceId: category._id.toString(),
      details: { name: category.name },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, { ...req.body }, { new: true });

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    await AdminAuditLog.create({
      admin: req.user!._id,
      adminEmail: req.user!.email,
      action: 'UPDATE_CATEGORY',
      resource: 'CATEGORY',
      resourceId: category._id.toString(),
      details: req.body,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    await AdminAuditLog.create({
      admin: req.user!._id,
      adminEmail: req.user!.email,
      action: 'DELETE_CATEGORY',
      resource: 'CATEGORY',
      resourceId: id,
      details: { name: category.name },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
