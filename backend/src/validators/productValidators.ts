import { z } from 'zod';

export const productVariantSchema = z.object({
  name: z.string().min(1),
  weightOrPieces: z.number().positive(),
  unit: z.string().default('kg'),
  price: z.number().positive(),
  discountedPrice: z.number().optional(),
  isDefault: z.boolean().default(false),
});

export const bulkPricingTierSchema = z.object({
  minQty: z.number().positive(),
  maxQty: z.number().positive().optional(),
  pricePerUnit: z.number().positive(),
  unit: z.string().default('kg'),
});

export const createProductSchema = z.object({
  body: z.object({
    productName: z.string().min(2, 'Product name is required'),
    slug: z.string().min(2).optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    shortDescription: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    basePrice: z.number().positive('Base price must be positive'),
    discountPercentage: z.number().min(0).max(100).default(0),
    weightUnit: z.string().default('kg'),
    variants: z.array(productVariantSchema).default([]),
    bulkPricingTiers: z.array(bulkPricingTierSchema).default([]),
    ingredients: z.array(z.string()).default([]),
    shelfLife: z.string().optional(),
    dietary: z.enum(['VEG', 'NON_VEG']).default('VEG'),
    isSugarFree: z.boolean().default(false),
    stockQuantity: z.number().int().min(0).default(100),
    lowStockThreshold: z.number().int().min(0).default(15),
    minOrderQuantity: z.number().int().min(1).default(1),
    maxOrderQuantity: z.number().int().positive().default(500),
    availableForInstant: z.boolean().default(true),
    availableForAdvance: z.boolean().default(true),
    minAdvanceBookingDays: z.number().int().min(0).default(3),
    isFeatured: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isActive: z.boolean().default(true),
    isRestaurantFood: z.boolean().default(false).optional(),
    foodCategory: z.string().optional(),
    spiceLevel: z.enum(['Mild', 'Medium', 'Spicy', 'Extra Spicy', 'None']).default('Medium').optional(),
    preparationTime: z.string().default('15-20 mins').optional(),
    servingSize: z.string().default('Serves 1-2').optional(),
    isChefSpecial: z.boolean().default(false).optional(),
    productImages: z.array(z.object({
      publicId: z.string().optional(),
      url: z.string().url(),
      isPrimary: z.boolean().optional(),
    })).default([]),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
});
