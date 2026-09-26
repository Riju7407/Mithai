import { z } from 'zod';

export const createInstantOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Name is required'),
    customerEmail: z.string().email('Valid email is required'),
    customerPhone: z.string().min(10, 'Valid phone number is required'),
    deliveryMethod: z.enum(['DELIVERY', 'TAKEAWAY']).default('DELIVERY'),
    deliveryDate: z.string().min(1, 'Delivery date is required'),
    deliverySlot: z.string().min(1, 'Delivery slot is required'),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(['ONLINE', 'COD']).default('ONLINE').optional(),
    notes: z.string().optional(),
    shippingAddress: z.object({
      recipientName: z.string().min(1),
      phone: z.string().min(10),
      houseOrFlat: z.string().min(1),
      street: z.string().min(1),
      landmark: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      pincode: z.string().regex(/^\d{6}$/),
    }),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          variantName: z.string().optional(),
          quantity: z.number().int().positive(),
        })
      )
      .min(1, 'Order must contain at least one item'),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum([
      'Pending',
      'Confirmed',
      'Preparing',
      'Ready',
      'Out for Delivery',
      'Delivered',
      'Completed',
      'Cancelled',
    ]),
    note: z.string().optional(),
    internalNotes: z.string().optional(),
  }),
});
