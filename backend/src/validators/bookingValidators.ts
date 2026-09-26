import { z } from 'zod';

export const createAdvanceBookingSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Name is required'),
    customerEmail: z.string().email('Valid email is required'),
    customerPhone: z.string().min(10, 'Valid phone number is required'),
    eventType: z.string().min(1, 'Event type is required'),
    eventName: z.string().min(1, 'Event name is required'),
    eventDate: z.string().min(1, 'Event date is required'),
    numberOfGuests: z.number().int().positive('Number of guests must be positive'),
    deliveryDate: z.string().min(1, 'Delivery date is required'),
    deliverySlot: z.string().min(1, 'Delivery slot is required'),
    deliveryAddress: z.object({
      recipientName: z.string().min(1),
      phone: z.string().min(10),
      houseOrFlat: z.string().min(1),
      street: z.string().min(1),
      landmark: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      pincode: z.string().regex(/^\d{6}$/),
    }),
    contactNumber: z.string().min(10),
    packagingOptionId: z.string().optional(),
    customRequirements: z.string().optional(),
    specialInstructions: z.string().optional(),
    customMessage: z.string().optional(),
    paymentPreference: z.enum(['FULL', 'DEPOSIT']).default('DEPOSIT'),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          unit: z.string().default('kg'),
          quantity: z.number().positive(),
        })
      )
      .min(1, 'Advance booking must contain at least one item'),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    bookingStatus: z.enum([
      'Received',
      'Advance Confirmed',
      'Scheduled',
      'In Production',
      'Dispatched',
      'Fulfilled',
      'Cancelled',
    ]),
    note: z.string().optional(),
    internalNotes: z.string().optional(),
  }),
});
