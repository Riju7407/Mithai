import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliverySlotDoc extends Document {
  title: string;
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "11:30"
  maxCapacity: number;
  active: boolean;
  orderType: 'ALL' | 'INSTANT' | 'ADVANCE_BOOKING';
  customCutoffValue?: number | null;
  customCutoffUnit?: 'hours' | 'minutes' | 'seconds' | null;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySlotSchema = new Schema<IDeliverySlotDoc>(
  {
    title: { type: String, required: true, trim: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    maxCapacity: { type: Number, required: true, default: 25 },
    active: { type: Boolean, default: true, index: true },
    orderType: {
      type: String,
      enum: ['ALL', 'INSTANT', 'ADVANCE_BOOKING'],
      default: 'ALL',
    },
    customCutoffValue: { type: Number, default: null },
    customCutoffUnit: {
      type: String,
      enum: ['hours', 'minutes', 'seconds', null],
      default: null,
    },
  },
  { timestamps: true }
);

export const DeliverySlot = mongoose.model<IDeliverySlotDoc>('DeliverySlot', DeliverySlotSchema);
