'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart, orderType, setOrderType } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const freeThreshold = 799;
  const amountToFree = Math.max(0, freeThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-full max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-cream-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold-600" />
              <h2 className="font-serif font-bold text-lg text-stone-900">Your Sweet Cart</h2>
              <span className="text-xs bg-gold-200/80 text-gold-900 px-2 py-0.5 rounded-full font-semibold">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery threshold encouragement banner */}
          {items.length > 0 && (
            <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
              {amountToFree === 0 ? (
                <span className="font-semibold text-emerald-700">
                  🎉 Congratulations! Your instant order qualifies for FREE Express Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="font-bold">{formatPrice(amountToFree)}</strong> more to get{' '}
                  <strong className="text-emerald-700 font-bold">FREE Delivery</strong>
                </span>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Explore our handcrafted Kaju Katli, Desi Ghee Ladoos, and Royal Savories.
                </p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full gold-gradient text-white text-xs font-bold uppercase tracking-wider shadow hover:opacity-95 transition-opacity"
                >
                  Browse Sweets
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.variantName}`} className="py-4 flex gap-3.5">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0 relative border border-stone-200">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-xs">
                        Sweet
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-stone-900 truncate">
                        {item.productName}
                      </h4>
                      <button
                        onClick={() => removeItem(item.productId, item.variantName)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-0.5"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.variantName && (
                      <p className="text-xs text-gold-700 font-medium">{item.variantName}</p>
                    )}

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200 rounded-md bg-stone-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, -1)}
                          className="px-2 py-1 hover:bg-stone-200 text-stone-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, 1)}
                          className="px-2 py-1 hover:bg-stone-200 text-stone-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-stone-400 block font-normal">
                          {formatPrice(item.unitPrice)} each
                        </span>
                        <span className="text-sm font-bold text-royal-950">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-cream-50 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-medium">Subtotal</span>
                <span className="text-base font-bold text-royal-950 font-serif">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Taxes, delivery charges and discounts calculated at checkout.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full py-2.5 px-3 rounded-xl border border-stone-300 hover:border-gold-500 text-stone-800 font-semibold text-xs text-center transition-colors bg-white"
                >
                  View Full Cart
                </Link>

                <Link
                  href={isAuthenticated ? "/checkout" : "/login"}
                  onClick={onClose}
                  className="w-full py-2.5 px-3 rounded-xl gold-gradient text-royal-950 font-bold text-xs text-center shadow-gold-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <span>{isAuthenticated ? "Checkout" : "Sign In to Buy"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
