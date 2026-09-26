import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Address } from '../models/Address';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AdminAuditLog } from '../models/AdminAuditLog';
import { ENV } from '../config/env';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role: 'CUSTOMER',
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    const isEnvAdminEmail = normalizedEmail === (ENV.ADMIN_EMAIL || '').trim().toLowerCase();
    const isEnvAdminPassword = password === ENV.ADMIN_PASSWORD;

    let user = await User.findOne({ email: normalizedEmail });

    // Auto-provision admin if matching .env credentials and not yet created
    if (!user && isEnvAdminEmail && isEnvAdminPassword) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      user = await User.create({
        name: 'Rana Vikram Singh (Admin)',
        email: normalizedEmail,
        passwordHash,
        phone: '+91 98765 00001',
        role: 'ADMIN',
        isActive: true,
      });
      console.log(`[Auth] Auto-provisioned admin account on login: ${normalizedEmail}`);
    }

    if (!user || user.isActive === false) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    let isMatch = await user.comparePassword(password);

    // If password didn't match old DB hash but matches current .env ADMIN_PASSWORD, sync it
    if (!isMatch && isEnvAdminEmail && isEnvAdminPassword) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
      user.role = 'ADMIN';
      user.isActive = true;
      await user.save();
      isMatch = true;
      console.log(`[Auth] Re-synchronized admin password hash to match .env for: ${normalizedEmail}`);
    }

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Record login in audit log if admin
    if (user.role === 'ADMIN') {
      await AdminAuditLog.create({
        admin: user._id,
        adminEmail: user.email,
        action: 'ADMIN_LOGIN',
        resource: 'AUTH',
        ip: req.ip,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('-passwordHash');
    const addresses = await Address.find({ user: user!._id });

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: {
        user,
        addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password does not match our records.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Address Management
export const getAddresses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const addresses = await Address.find({ user: req.user!._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Addresses retrieved successfully.',
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user!._id }, { isDefault: false });
    }

    // If first address, make it default automatically
    const count = await Address.countDocuments({ user: req.user!._id });
    const shouldBeDefault = count === 0 ? true : !!isDefault;

    const address = await Address.create({
      ...req.body,
      user: req.user!._id,
      isDefault: shouldBeDefault,
    });

    await User.findByIdAndUpdate(req.user!._id, {
      $addToSet: { addresses: address._id },
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user!._id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user!._id },
      { ...req.body },
      { new: true }
    );

    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, user: req.user!._id });
    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }

    await User.findByIdAndUpdate(req.user!._id, {
      $pull: { addresses: address._id },
    });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
