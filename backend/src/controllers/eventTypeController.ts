import { Request, Response, NextFunction } from 'express';
import { EventType } from '../models/EventType';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getEventTypes = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const types = await EventType.find({ active: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: 'Event types retrieved successfully.',
      data: types,
    });
  } catch (error) {
    next(error);
  }
};

export const createEventType = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventType = await EventType.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Event type created successfully.',
      data: eventType,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEventType = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const eventType = await EventType.findByIdAndUpdate(id, req.body, { new: true });
    if (!eventType) {
      res.status(404).json({ success: false, message: 'Event type not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Event type updated successfully.',
      data: eventType,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEventType = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await EventType.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Event type deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
