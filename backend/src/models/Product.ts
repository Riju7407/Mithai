import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariantDoc {
  name: string;
  weightOrPieces: number;
  unit: string;
  price: number;
  discountedPrice?: number;
  isDefault?: boolean;
}

export interface IBulkPricingTierDoc {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
  unit: string;
}

export interface IProductImageDoc {
  publicId?: string;
  url: string;
  isPrimary?: boolean;
}

export interface IProduct extends Document {
  productName: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  productImages: IProductImageDoc[];
  basePrice: number;
  discountPercentage: number;
  finalPrice: number;
  weightUnit: string;
  variants: IProductVariantDoc[];
  bulkPricingTiers: IBulkPricingTierDoc[];
  ingredients: string[];
  shelfLife?: string;
  dietary: 'VEG' | 'NON_VEG';
  isSugarFree: boolean;
  stockQuantity: number;
  reservedStock: number;
  lowStockThreshold: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  availableForInstant: boolean;
  availableForAdvance: boolean;
  minAdvanceBookingDays: number;
  isFeatured: boolean;
  isBestSeller?: boolean;
  isActive: boolean;
  averageRating?: number;
  totalReviews?: number;

  // Restaurant Food extensions
  isRestaurantFood: boolean;
  foodCategory?: string;
  spiceLevel?: 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy' | 'None';
  preparationTime?: string;
  servingSize?: string;
  isChefSpecial?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariantDoc>({
  name: { type: String, required: true },
  weightOrPieces: { type: Number, required: true },
  unit: { type: String, required: true, default: 'kg' },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  isDefault: { type: Boolean, default: false },
});

const BulkPricingTierSchema = new Schema<IBulkPricingTierDoc>({
  minQty: { type: Number, required: true },
  maxQty: { type: Number },
  pricePerUnit: { type: Number, required: true },
  unit: { type: String, required: true, default: 'kg' },
});

const ProductImageSchema = new Schema<IProductImageDoc>({
  publicId: { type: String },
  url: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
});

const ProductSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    productImages: [ProductImageSchema],
    basePrice: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    finalPrice: { type: Number, required: true, min: 0 },
    weightUnit: { type: String, default: 'kg' },
    variants: [ProductVariantSchema],
    bulkPricingTiers: [BulkPricingTierSchema],
    ingredients: [{ type: String }],
    shelfLife: { type: String, default: '7-10 Days (Refrigerate if opened)' },
    dietary: { type: String, enum: ['VEG', 'NON_VEG'], default: 'VEG', index: true },
    isSugarFree: { type: Boolean, default: false, index: true },
    stockQuantity: { type: Number, required: true, default: 100, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 15, min: 0 },
    minOrderQuantity: { type: Number, default: 1, min: 1 },
    maxOrderQuantity: { type: Number, default: 500 },
    availableForInstant: { type: Boolean, default: true, index: true },
    availableForAdvance: { type: Boolean, default: true, index: true },
    minAdvanceBookingDays: { type: Number, default: 3 },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    averageRating: { type: Number, default: 5.0, min: 1, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },

    // Restaurant Food extensions
    isRestaurantFood: { type: Boolean, default: false, index: true },
    foodCategory: { type: String, trim: true, index: true },
    spiceLevel: {
      type: String,
      enum: ['Mild', 'Medium', 'Spicy', 'Extra Spicy', 'None'],
      default: 'Medium',
    },
    preparationTime: { type: String, default: '15-20 mins' },
    servingSize: { type: String, default: 'Serves 1-2' },
    isChefSpecial: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Pre-save recalculation of finalPrice if discount is present
ProductSchema.pre('save', function (next) {
  if (this.discountPercentage > 0) {
    this.finalPrice = Math.round(this.basePrice * (1 - this.discountPercentage / 100));
  } else {
    this.finalPrice = this.basePrice;
  }
  next();
});

// Full text search index
ProductSchema.index({
  productName: 'text',
  description: 'text',
  shortDescription: 'text',
  ingredients: 'text',
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
