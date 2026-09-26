import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl: string;
  publicId?: string;
  buttonText?: string;
  link?: string;
  bannerType: 'HERO' | 'PROMO' | 'FESTIVAL' | 'EVENT';
  displayOrder: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String },
    buttonText: { type: String, default: 'Explore Now' },
    link: { type: String, default: '/shop' },
    bannerType: {
      type: String,
      enum: ['HERO', 'PROMO', 'FESTIVAL', 'EVENT'],
      default: 'HERO',
      index: true,
    },
    displayOrder: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);
