import { Request, Response, NextFunction } from 'express';
import { PackagingOption } from '../models/PackagingOption';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getPackagingOptions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const options = await PackagingOption.find({ active: true }).sort({ extraPrice: 1 });
    res.status(200).json({
      success: true,
      message: 'Packaging options retrieved successfully.',
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

export const createPackagingOption = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const option = await PackagingOption.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Packaging option created successfully.',
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePackagingOption = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const option = await PackagingOption.findByIdAndUpdate(id, req.body, { new: true });
    if (!option) {
      res.status(404).json({ success: false, message: 'Packaging option not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Packaging option updated successfully.',
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePackagingOption = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await PackagingOption.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Packaging option deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
