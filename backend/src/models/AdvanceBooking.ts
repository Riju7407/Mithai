import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingItemDoc {
  product: mongoose.Types.ObjectId;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string;
}

export interface IBookingStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export interface IAdvanceBooking extends Document {
  bookingNumber: string;
  user: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  eventName: string;
  eventDate: Date;
  numberOfGuests: number;
  deliveryDate: Date;
  deliverySlot: string;
  deliveryAddress: {
    recipientName: string;
    phone: string;
    houseOrFlat: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  contactNumber: string;
  items: IBookingItemDoc[];
  packaging: {
    optionName: string;
    extraPrice: number;
    packagingRef?: mongoose.Types.ObjectId;
  };
  customRequirements?: string;
  specialInstructions?: string;
  customMessage?: string;
  paymentPreference: 'FULL' | 'DEPOSIT';
  totalAmount: number;
  advanceDepositRequired: number;
  advanceAmountPaid: number;
  balanceAmountDue: number;
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Failed' | 'Refunded';
  bookingStatus:
    | 'Received'
    | 'Advance Confirmed'
    | 'Scheduled'
    | 'In Production'
    | 'Dispatched'
    | 'Fulfilled'
    | 'Cancelled';
  razorpayDepositOrderId?: string;
  razorpayDepositPaymentId?: string;
  razorpayBalanceOrderId?: string;
  razorpayBalancePaymentId?: string;
  statusHistory: IBookingStatusHistory[];
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingItemSchema = new Schema<IBookingItemDoc>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  imageUrl: { type: String },
});

const BookingStatusHistorySchema = new Schema<IBookingStatusHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
  updatedBy: { type: String },
});

const AdvanceBookingSchema = new Schema<IAdvanceBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    eventType: { type: String, required: true, index: true },
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true, index: true },
    numberOfGuests: { type: Number, required: true, min: 1 },
    deliveryDate: { type: Date, required: true, index: true },
    deliverySlot: { type: String, required: true },
    deliveryAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      houseOrFlat: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    contactNumber: { type: String, required: true },
    items: [BookingItemSchema],
    packaging: {
      optionName: { type: String, default: 'Standard Box' },
      extraPrice: { type: Number, default: 0 },
      packagingRef: { type: Schema.Types.ObjectId, ref: 'PackagingOption' },
    },
    customRequirements: { type: String },
    specialInstructions: { type: String },
    customMessage: { type: String },
    paymentPreference: { type: String, enum: ['FULL', 'DEPOSIT'], default: 'DEPOSIT' },
    totalAmount: { type: Number, required: true, min: 0 },
    advanceDepositRequired: { type: Number, required: true, min: 0 },
    advanceAmountPaid: { type: Number, default: 0, min: 0 },
    balanceAmountDue: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    bookingStatus: {
      type: String,
      enum: [
        'Received',
        'Advance Confirmed',
        'Scheduled',
        'In Production',
        'Dispatched',
        'Fulfilled',
        'Cancelled',
      ],
      default: 'Received',
      index: true,
    },
    razorpayDepositOrderId: { type: String, index: true },
    razorpayDepositPaymentId: { type: String, index: true },
    razorpayBalanceOrderId: { type: String, index: true },
    razorpayBalancePaymentId: { type: String, index: true },
    statusHistory: [BookingStatusHistorySchema],
    internalNotes: { type: String },
  },
  { timestamps: true }
);

export const AdvanceBooking = mongoose.model<IAdvanceBooking>(
  'AdvanceBooking',
  AdvanceBookingSchema
);
