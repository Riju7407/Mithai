import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItemDoc {
  product: mongoose.Types.ObjectId;
  productName: string;
  variantName?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string;
}

export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: 'INSTANT';
  items: IOrderItemDoc[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Failed' | 'Refunded';
  paymentMethod: 'ONLINE' | 'COD';
  orderStatus:
    | 'Pending'
    | 'Confirmed'
    | 'Preparing'
    | 'Ready'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Completed'
    | 'Cancelled';
  deliveryMethod: 'DELIVERY' | 'TAKEAWAY';
  deliveryDate: Date;
  deliverySlot: string;
  shippingAddress: {
    recipientName: string;
    phone: string;
    houseOrFlat: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  notes?: string;
  internalNotes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  statusHistory: IOrderStatusHistory[];
  cancellationReason?: string;
  refundData?: {
    refundId?: string;
    amount?: number;
    status?: string;
    processedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItemDoc>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  variantName: { type: String },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  imageUrl: { type: String },
});

const StatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
  updatedBy: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    orderType: { type: String, default: 'INSTANT' },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['ONLINE', 'COD'],
      default: 'ONLINE',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Preparing',
        'Ready',
        'Out for Delivery',
        'Delivered',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
      index: true,
    },
    deliveryMethod: { type: String, enum: ['DELIVERY', 'TAKEAWAY'], default: 'DELIVERY' },
    deliveryDate: { type: Date, required: true, index: true },
    deliverySlot: { type: String, required: true },
    shippingAddress: {
      recipientName: { type: String },
      phone: { type: String },
      houseOrFlat: { type: String },
      street: { type: String },
      landmark: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    notes: { type: String },
    internalNotes: { type: String },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    statusHistory: [StatusHistorySchema],
    cancellationReason: { type: String },
    refundData: {
      refundId: { type: String },
      amount: { type: Number },
      status: { type: String },
      processedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
