import { Request, Response, NextFunction } from 'express';
import { Setting } from '../models/Setting';
import { AuthenticatedRequest } from '../middlewares/auth';
import { DEFAULT_SETTINGS } from '../../../shared/constants';

export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(DEFAULT_SETTINGS);
    }
    res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully.',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({ ...DEFAULT_SETTINGS, ...req.body });
    } else {
      settings.set(req.body);
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
