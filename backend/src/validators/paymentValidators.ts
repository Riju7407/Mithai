import { z } from 'zod';

export const createRazorpayOrderSchema = z.object({
  body: z.object({
    orderId: z.string().optional(),
    bookingId: z.string().optional(),
    paymentType: z.enum(['FULL', 'DEPOSIT', 'BALANCE']).default('FULL'),
  }).refine((data) => data.orderId || data.bookingId, {
    message: 'Either orderId or bookingId must be provided',
    path: ['orderId'],
  }),
});

export const verifyRazorpayPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().optional(),
    bookingId: z.string().optional(),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
    paymentType: z.enum(['FULL', 'DEPOSIT', 'BALANCE']).default('FULL'),
  }).refine((data) => data.orderId || data.bookingId, {
    message: 'Either orderId or bookingId must be provided',
    path: ['orderId'],
  }),
});
