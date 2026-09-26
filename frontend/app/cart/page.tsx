'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../lib/utils';
import { api } from '../../lib/api';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  const subtotal = getSubtotal();
  const freeThreshold = settings?.freeDeliveryThreshold || 799;
  const standardFee = settings?.standardDeliveryFee || 50;
  const deliveryFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : standardFee;
  const gstRate = settings?.gstRate || 5;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round((taxableAmount * gstRate) / 100);
  const grandTotal = taxableAmount + deliveryFee + tax;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await api.post('/coupons/apply', {
        code: couponInput.trim(),
        orderAmount: subtotal,
      });

      applyCoupon(res.data.code, res.data.discount);
      setCouponSuccess(`Coupon '${res.data.code}' applied! You saved ${formatPrice(res.data.discount)}.`);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-cream-100 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-stone-400" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-royal-950">Your Cart is Empty</h1>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          Explore our artisanal sweet catalog, Kaju Katlis, Motichoor Ladoos, and pure ghee savories.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow hover:opacity-95"
        >
          <span>Explore Sweet Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="border-b border-stone-200 pb-4 flex items-baseline justify-between">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-royal-950">
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm divide-y divide-stone-100 overflow-hidden">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantName}`} className="p-4 sm:p-6 flex gap-4">
                <img
                  src={
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={item.productName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-stone-200 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 truncate">
                        {item.productName}
                      </h3>
                      {item.variantName && (
                        <span className="text-xs font-semibold text-gold-700 block mt-0.5">
                          {item.variantName}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.variantName)}
                      className="text-stone-400 hover:text-red-600 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantName, -1)}
                        className="px-3 py-1.5 hover:bg-stone-200 text-stone-700 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-stone-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantName, 1)}
                        className="px-3 py-1.5 hover:bg-stone-200 text-stone-700 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-stone-400 block font-normal">
                        {formatPrice(item.unitPrice)} each
                      </span>
                      <span className="font-serif text-base sm:text-lg font-bold text-royal-950">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick coupon info callout */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-gold-600" />
              Use coupon <strong>ROYAL10</strong> for 10% off or <strong>FESTIVAL20</strong> for ₹200 off above ₹1500!
            </span>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-5">
          {/* Coupon Form */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm space-y-3">
            <label htmlFor="coupon-code" className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gold-600" />
              <span>Apply Offer / Coupon Code</span>
            </label>

            {couponCode ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <div>
                  <span className="font-bold">{couponCode}</span> applied ({formatPrice(couponDiscount)} off)
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  id="coupon-code"
                  type="text"
                  placeholder="e.g. ROYAL10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl gold-gradient text-royal-950 font-bold text-xs uppercase shrink-0 shadow-sm"
                >
                  Apply
                </button>
              </form>
            )}

            {couponSuccess && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {couponSuccess}
              </p>
            )}

            {couponError && (
              <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {couponError}
              </p>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900 pb-2 border-b border-stone-100">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({couponCode}):</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Delivery Fee:</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(deliveryFee)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST Tax ({gstRate}%):</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between font-serif font-bold text-lg text-royal-950">
                <span>Grand Total:</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Link
              href={isAuthenticated ? "/checkout" : "/login"}
              className="w-full py-3.5 px-4 rounded-xl gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase text-center block shadow-gold-sm hover:scale-[1.02] transition-transform"
            >
              {isAuthenticated ? "Proceed to Checkout" : "Sign In to Buy Items"}
            </Link>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Secure Razorpay Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
