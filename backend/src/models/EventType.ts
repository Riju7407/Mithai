import mongoose, { Schema, Document } from 'mongoose';

export interface IEventTypeDoc extends Document {
  name: string;
  description?: string;
  iconName?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventTypeSchema = new Schema<IEventTypeDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
    iconName: { type: String, default: 'Calendar' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const EventType = mongoose.model<IEventTypeDoc>('EventType', EventTypeSchema);
