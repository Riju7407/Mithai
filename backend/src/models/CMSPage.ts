import mongoose, { Schema, Document } from 'mongoose';

export interface ICMSPage extends Document {
  slug: string;
  title: string;
  content: string; // Markdown or HTML content
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CMSPageSchema = new Schema<ICMSPage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CMSPage = mongoose.model<ICMSPage>('CMSPage', CMSPageSchema);
