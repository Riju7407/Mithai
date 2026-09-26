'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Check,
  Sparkles,
  Flame,
  Clock,
  Users,
  Star,
  Info,
  ChevronDown,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../store/cartStore';

export interface RestaurantFoodItem {
  _id: string;
  productName: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  category?: { name: string; slug: string };
  foodCategory?: string;
  productImages: { url: string; isPrimary?: boolean }[];
  basePrice: number;
  discountPercentage?: number;
  finalPrice: number;
  weightUnit?: string;
  variants?: { name: string; price: number; discountedPrice?: number; unit: string; isDefault?: boolean }[];
  dietary?: 'VEG' | 'NON_VEG';
  spiceLevel?: 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy' | 'None';
  preparationTime?: string;
  servingSize?: string;
  isChefSpecial?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  availableForInstant?: boolean;
  availableForAdvance?: boolean;
  stockQuantity?: number;
  averageRating?: number;
  totalReviews?: number;
  ingredients?: string[];
  shelfLife?: string;
}

interface RestaurantFoodCardProps {
  food: RestaurantFoodItem;
  compact?: boolean;
}

export default function RestaurantFoodCard({ food, compact = false }: RestaurantFoodCardProps) {
  const { addItem, items, updateQuantity } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState(
    food.variants && food.variants.length > 0 ? food.variants[0].name : undefined
  );
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const activeVariantObj = food.variants?.find((v) => v.name === selectedVariant);
  const displayPrice = activeVariantObj
    ? activeVariantObj.discountedPrice || activeVariantObj.price
    : food.finalPrice;
  const originalPrice = activeVariantObj ? activeVariantObj.price : food.basePrice;
  const hasDiscount = originalPrice > displayPrice;

  const primaryImage =
    food.productImages?.find((img) => img.isPrimary)?.url ||
    food.productImages?.[0]?.url ||
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80';

  // Check if item is already in cart
  const cartItem = items.find(
    (i) => i.productId === food._id && i.variantName === selectedVariant
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        productId: food._id,
        slug: food.slug,
        productName: food.productName,
        variantName: selectedVariant,
        unit: activeVariantObj?.unit || food.weightUnit || 'portion',
        unitPrice: displayPrice,
        imageUrl: primaryImage,
        dietary: food.dietary || 'VEG',
        availableForInstant: food.availableForInstant !== false,
        availableForAdvance: food.availableForAdvance !== false,
        stockQuantity: food.stockQuantity || 100,
      },
      1
    );

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const getSpiceBadge = (spice?: string) => {
    switch (spice) {
      case 'Extra Spicy':
        return { label: 'Extra Hot', bg: 'bg-red-700 text-white', iconCount: 3 };
      case 'Spicy':
        return { label: 'Spicy', bg: 'bg-red-600 text-white', iconCount: 2 };
      case 'Medium':
        return { label: 'Medium', bg: 'bg-amber-600 text-white', iconCount: 1 };
      case 'Mild':
        return { label: 'Mild Spice', bg: 'bg-emerald-600 text-white', iconCount: 1 };
      default:
        return null;
    }
  };

  const spiceInfo = getSpiceBadge(food.spiceLevel);

  return (
    <>
      <div
        className={`group relative bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-gold-300 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full ${
          compact ? 'p-0' : 'p-0'
        }`}
      >
        {/* Top Media Section */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full bg-stone-100 overflow-hidden shrink-0">
          <img
            src={primaryImage}
            alt={food.productName}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            loading="lazy"
          />

          {/* Dark gradient overlay for bottom text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/30 pointer-events-none" />

          {/* Top Left Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {/* Veg / Non-Veg Indicator */}
            <div
              className="w-4 h-4 bg-white/95 rounded flex items-center justify-center border border-emerald-600 shadow-sm"
              title={food.dietary === 'NON_VEG' ? 'Non-Vegetarian' : '100% Pure Vegetarian'}
            >
              {food.dietary === 'NON_VEG' ? (
                <span className="w-2 h-2 rounded-full bg-rose-600 block" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-600 block" />
              )}
            </div>

            {/* Chef's Special Badge */}
            {food.isChefSpecial && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase gold-gradient text-royal-950 shadow-md flex items-center gap-1 border border-gold-300/40">
                <Sparkles className="w-3 h-3 text-royal-950" />
                <span>Chef&apos;s Signature</span>
              </span>
            )}

            {/* Spice Badge */}
            {spiceInfo && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm flex items-center gap-0.5 ${spiceInfo.bg}`}
              >
                <Flame className="w-3 h-3" />
                <span>{spiceInfo.label}</span>
              </span>
            )}
          </div>

          {/* Top Right Badges */}
          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
            {hasDiscount && (
              <div className="text-[10px] px-2 py-0.5 bg-burgundy-600 text-white font-extrabold rounded-full shadow">
                {food.discountPercentage ? `${food.discountPercentage}% OFF` : 'SPECIAL'}
              </div>
            )}

            <button
              onClick={() => setInfoModalOpen(true)}
              className="w-7 h-7 rounded-full bg-royal-950/70 hover:bg-gold-500 hover:text-royal-950 text-white backdrop-blur-sm flex items-center justify-center transition-all shadow"
              title="View Ingredients & Chef's Notes"
              aria-label="View Dish Details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Overlay Info (Prep Time & Servings) */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white/95 font-medium z-10">
            <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
              <Clock className="w-3 h-3 text-gold-400" />
              <span>{food.preparationTime || '15-20 mins'}</span>
            </span>

            {food.servingSize && (
              <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                <Users className="w-3 h-3 text-gold-400" />
                <span>{food.servingSize}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Food Course Category & Rating */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold text-gold-700 uppercase tracking-wider block truncate">
                {food.foodCategory || food.category?.name || 'Royal Delicacy'}
              </span>

              <div className="flex items-center gap-1 text-[11px] font-bold text-stone-700 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{food.averageRating ? food.averageRating.toFixed(1) : '5.0'}</span>
                <span className="text-stone-400 text-[10px]">
                  ({food.totalReviews || 24})
                </span>
              </div>
            </div>

            {/* Dish Title */}
            <h3
              title={food.productName}
              className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-gold-700 transition-colors line-clamp-1 leading-snug"
            >
              {food.productName}
            </h3>

            {/* Short culinary description */}
            <p className="text-[11px] sm:text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {food.shortDescription || food.description || 'Prepared fresh with pure A2 Desi Cow Ghee and royal herbs.'}
            </p>

            {/* Variants Selector */}
            {food.variants && food.variants.length > 1 ? (
              <div className="mt-2.5">
                <div className="relative">
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-medium py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer pr-7 appearance-none truncate"
                  >
                    {food.variants.map((v) => (
                      <option key={v.name} value={v.name} className="bg-white text-stone-900">
                        {v.name} — {formatPrice(v.discountedPrice || v.price)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="mt-2 h-6 flex items-center">
                <span className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
                  {food.servingSize || 'Freshly made to order'}
                </span>
              </div>
            )}
          </div>

          {/* Pricing & Order CTA */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-base sm:text-lg font-bold text-royal-950">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-stone-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 block -mt-0.5">
                {activeVariantObj?.name || 'Taxes included'}
              </span>
            </div>

            {/* Order / Add to Cart CTA */}
            {cartItem ? (
              <div className="flex items-center gap-1.5 bg-royal-950 text-white rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    updateQuantity(food._id, selectedVariant, -1);
                  }}
                  className="w-6 h-6 rounded-lg bg-royal-800 hover:bg-royal-700 flex items-center justify-center text-white transition-colors"
                  aria-label="Decrease Quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold px-1.5 min-w-[16px] text-center text-gold-300">
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    updateQuantity(food._id, selectedVariant, 1);
                  }}
                  className="w-6 h-6 rounded-lg gold-gradient text-royal-950 flex items-center justify-center transition-transform hover:scale-105"
                  aria-label="Increase Quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={food.availableForInstant === false}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                  food.availableForInstant === false
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'gold-gradient text-royal-950 hover:shadow-gold-md hover:scale-102 active:scale-98'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : food.availableForInstant === false ? (
                  <span>Sold Out</span>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Order</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info & Ingredients Modal */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            {/* Header with image */}
            <div className="relative h-48 w-full bg-stone-100">
              <img
                src={primaryImage}
                alt={food.productName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <button
                onClick={() => setInfoModalOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-300 block mb-0.5">
                  {food.foodCategory || 'Royal Recipe'}
                </span>
                <h3 className="font-serif text-xl font-bold leading-tight drop-shadow-sm">
                  {food.productName}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Highlight specs */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-50 rounded-xl border border-stone-200/70 text-center">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block font-semibold">Prep Time</span>
                  <span className="text-xs font-bold text-stone-800">{food.preparationTime || '15-20m'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block font-semibold">Portion</span>
                  <span className="text-xs font-bold text-stone-800">{food.servingSize || 'Serves 1-2'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block font-semibold">Spice</span>
                  <span className="text-xs font-bold text-stone-800">{food.spiceLevel || 'Medium'}</span>
                </div>
              </div>

              {/* Culinary Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 mb-1">
                  Master Chef Tasting Note
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {food.description || food.shortDescription || 'Prepared using royal heritage recipes passed down from Rajasthani and Awadhi courts.'}
                </p>
              </div>

              {/* Ingredients List */}
              {food.ingredients && food.ingredients.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 mb-1.5">
                    Authentic Ingredients
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {food.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-900 border border-amber-200/80 font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shelf life & Serving recommendation */}
              <div className="p-3 rounded-xl bg-gold-50/60 border border-gold-200 text-xs text-stone-700">
                <span className="font-bold text-gold-800 block mb-0.5">Dining Recommendation:</span>
                {food.shelfLife || 'Best consumed piping hot upon arrival for peak flavor.'}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 block">Price</span>
                <span className="font-serif text-lg font-bold text-royal-950">
                  {formatPrice(displayPrice)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInfoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleAddToCart(e);
                    setInfoModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold gold-gradient text-royal-950 shadow-gold-sm hover:scale-105 transition-all flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
