import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  text: string;
  link?: string;
  linkText?: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    text: { type: String, required: true, trim: true },
    link: { type: String },
    linkText: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
