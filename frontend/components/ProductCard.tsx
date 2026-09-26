'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Calendar, Check, Sparkles, Award, Star } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../store/cartStore';

export interface ProductCardProps {
  product: {
    _id: string;
    productName: string;
    slug: string;
    shortDescription?: string;
    category?: { name: string; slug: string };
    productImages: { url: string; isPrimary?: boolean }[];
    basePrice: number;
    discountPercentage?: number;
    finalPrice: number;
    weightUnit: string;
    variants?: { name: string; price: number; discountedPrice?: number; unit: string; isDefault?: boolean }[];
    dietary: 'VEG' | 'NON_VEG';
    isSugarFree?: boolean;
    availableForInstant: boolean;
    availableForAdvance: boolean;
    stockQuantity: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    averageRating?: number;
    totalReviews?: number;
  };
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0].name : undefined
  );
  const [isAdded, setIsAdded] = useState(false);

  const activeVariantObj = product.variants?.find((v) => v.name === selectedVariant);
  const displayPrice = activeVariantObj
    ? (activeVariantObj.discountedPrice || activeVariantObj.price)
    : product.finalPrice;

  const originalPrice = activeVariantObj ? activeVariantObj.price : product.basePrice;
  const hasDiscount = originalPrice > displayPrice;

  const primaryImage =
    product.productImages?.find((img) => img.isPrimary)?.url ||
    product.productImages?.[0]?.url ||
    'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        productId: product._id,
        slug: product.slug,
        productName: product.productName,
        variantName: selectedVariant,
        unit: activeVariantObj?.unit || product.weightUnit,
        unitPrice: displayPrice,
        imageUrl: primaryImage,
        dietary: product.dietary,
        isSugarFree: product.isSugarFree,
        availableForInstant: product.availableForInstant,
        availableForAdvance: product.availableForAdvance,
        stockQuantity: product.stockQuantity,
      },
      1
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-gold-md hover:border-gold-300 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full w-full ${
        compact ? 'hover:-translate-y-0.5' : ''
      }`}
    >
      {/* Top Media Section */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-[4/3] w-full bg-stone-100 overflow-hidden shrink-0"
      >
        <img
          src={primaryImage}
          alt={product.productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className={`absolute ${compact ? 'top-1.5 left-1.5 gap-1' : 'top-2.5 left-2.5 gap-1.5'} flex flex-col z-10`}>
          {/* Veg Indicator */}
          {product.dietary === 'VEG' && (
            <div className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} bg-white/95 rounded flex items-center justify-center border border-emerald-600 shadow-xs`} title="100% Pure Vegetarian">
              <span className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-emerald-600 block`}></span>
            </div>
          )}

          {/* Sugar-Free Badge */}
          {product.isSugarFree && (
            <span className={`${compact ? 'px-1.5 py-0.2 text-[9px]' : 'px-2 py-0.5 text-[10px]'} rounded-full font-bold tracking-wide uppercase bg-emerald-700 text-white shadow-xs`}>
              Sugar-Free
            </span>
          )}

          {/* Featured Ribbon */}
          {product.isFeatured && (
            <span className={`${compact ? 'px-1.5 py-0.2 text-[9px]' : 'px-2 py-0.5 text-[10px]'} rounded-full font-bold tracking-wide uppercase gold-gradient text-royal-950 shadow-xs flex items-center gap-0.5`}>
              <Sparkles className="w-2.5 h-2.5" />
              Special
            </span>
          )}

          {/* Best Seller Badge */}
          {product.isBestSeller && (
            <span className={`${compact ? 'px-1.5 py-0.2 text-[9px]' : 'px-2 py-0.5 text-[10px]'} rounded-full font-bold tracking-wide uppercase bg-amber-600 text-white shadow-xs flex items-center gap-0.5`}>
              <Award className="w-2.5 h-2.5" />
              Best Seller
            </span>
          )}
        </div>

        {/* Discount Tag */}
        {hasDiscount && (
          <div className={`absolute ${compact ? 'top-1.5 right-1.5 text-[9px] px-1.5 py-0.2' : 'top-2.5 right-2.5 text-[10px] px-2 py-0.5'} bg-burgundy-500 text-white font-extrabold rounded-full shadow`}>
            {product.discountPercentage ? `${product.discountPercentage}% OFF` : 'SAVING'}
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className={`${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'} flex-1 flex flex-col justify-between`}>
        <div className="flex-1 flex flex-col">
          {/* Category Slot - Consistent Height */}
          <div className="h-4 flex items-center overflow-hidden mb-0.5">
            {product.category?.name ? (
              <span className={`${compact ? 'text-[9px]' : 'text-[10px]'} font-semibold text-gold-600 uppercase tracking-wider block truncate`}>
                {product.category.name}
              </span>
            ) : (
              <span className={`${compact ? 'text-[9px]' : 'text-[10px]'} font-semibold text-stone-400 uppercase tracking-wider block truncate`}>
                Royal Mithai
              </span>
            )}
          </div>

          {/* Title - Fixed height so 1-line or 2-line titles never cause height divergence */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3
              title={product.productName}
              className={`font-serif font-bold ${compact ? 'text-xs sm:text-sm h-8 sm:h-9 leading-snug' : 'text-sm sm:text-base h-10 leading-snug'} text-stone-900 group-hover:text-gold-700 transition-colors line-clamp-2`}
            >
              {product.productName}
            </h3>
          </Link>

          {/* Rating Display - Consistent Height */}
          <div className="h-4 flex items-center gap-1 mt-0.5">
            <div className="flex items-center text-amber-500">
              <Star className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill-amber-400 text-amber-500`} />
            </div>
            <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-bold text-stone-700`}>
              {product.averageRating ? product.averageRating.toFixed(1) : '5.0'}
            </span>
            <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-stone-400`}>
              ({product.totalReviews || 18})
            </span>
          </div>

          {/* Short Description (hidden in compact mode for cleaner sleek look) */}
          {product.shortDescription && !compact && (
            <p className="text-[11px] sm:text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Variants Selector OR Packaging/Unit Tag Slot - Exactly same height (h-7) so all cards align perfectly */}
          <div className={`${compact ? 'h-7 mt-1.5' : 'h-8 mt-2'} flex items-center`}>
            {product.variants && product.variants.length > 1 ? (
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className={`w-full h-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 font-medium ${
                  compact ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-1'
                } rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer truncate`}
              >
                {product.variants.map((v) => (
                  <option key={v.name} value={v.name} className="text-stone-900 bg-white">
                    {v.name} — {formatPrice(v.discountedPrice || v.price)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full flex items-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-stone-600 bg-stone-50 border border-stone-200/80 ${compact ? 'text-[9px]' : 'text-[10px]'} font-medium truncate max-w-full`}>
                  {activeVariantObj?.name || `Pack: ${product.weightUnit || 'Standard'}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className={`${compact ? 'mt-2 pt-2' : 'mt-3 pt-2.5'} border-t border-stone-100 flex items-center justify-between gap-1.5 shrink-0`}>
          {/* Price */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className={`font-serif ${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-bold text-royal-950`}>
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} text-stone-400 line-through`}>
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <span className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-stone-400 block -mt-0.5 truncate`}>
              Per {activeVariantObj?.name || product.weightUnit}
            </span>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.availableForInstant}
            className={`${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} rounded-lg font-bold flex items-center gap-1 transition-all shadow-sm shrink-0 ${
              !product.availableForInstant
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'gold-gradient text-royal-950 hover:opacity-95'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3" />
                <span>Added</span>
              </>
            ) : !product.availableForInstant ? (
              <span className="text-[10px]">Advance</span>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
