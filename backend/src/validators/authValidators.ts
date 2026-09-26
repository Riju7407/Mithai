import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phone: z.string().min(10, 'Valid phone number is required (at least 10 digits)'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    recipientName: z.string().min(2, 'Recipient name is required'),
    phone: z.string().min(10, 'Valid 10-digit phone number is required'),
    alternatePhone: z.string().optional(),
    houseOrFlat: z.string().min(1, 'House/Flat number is required'),
    street: z.string().min(1, 'Street/Area is required'),
    landmark: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    addressType: z.enum(['Home', 'Work', 'Other']).default('Home'),
    isDefault: z.boolean().default(false),
  }),
});
