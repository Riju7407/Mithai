import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  reviewerName: string;
  reviewerEmail?: string;
  reviewerLocation?: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  showInCenturiesOfTrust: boolean;
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    reviewerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    reviewerLocation: {
      type: String,
      default: 'Verified Connoisseur',
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    verifiedPurchase: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    showInCenturiesOfTrust: {
      type: Boolean,
      default: false,
      index: true,
    },
    adminReply: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
