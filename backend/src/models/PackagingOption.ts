import mongoose, { Schema, Document } from 'mongoose';

export interface IPackagingOptionDoc extends Document {
  name: string;
  description: string;
  extraPrice: number;
  imageUrl?: string;
  isDefault: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PackagingOptionSchema = new Schema<IPackagingOptionDoc>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    extraPrice: { type: Number, required: true, default: 0, min: 0 },
    imageUrl: { type: String },
    isDefault: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PackagingOption = mongoose.model<IPackagingOptionDoc>(
  'PackagingOption',
  PackagingOptionSchema
);
