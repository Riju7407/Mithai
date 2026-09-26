'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Sparkles, Copy, Check, Gift, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

export default function OffersPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // In public route, display known coupons or fetch
    setCoupons([
      {
        code: 'ROYAL10',
        description: 'Get 10% off up to ₹250 on orders above ₹500',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 500,
      },
      {
        code: 'FESTIVAL20',
        description: 'Flat ₹200 off on festive orders above ₹1,500',
        discountType: 'FIXED',
        discountValue: 200,
        minOrderValue: 1500,
      },
      {
        code: 'SWEET50',
        description: 'Instant ₹50 off on first order above ₹350',
        discountType: 'FIXED',
        discountValue: 50,
        minOrderValue: 350,
      },
    ]);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block">
          Exclusive Concessions
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-950">
          Offers, Coupons & Gift Hampers
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Apply these coupon codes at checkout to unlock savings on your handcrafted sweet orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.code}
            className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4 hover:shadow-gold-md hover:border-gold-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono tracking-wider text-royal-950 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                  {c.code}
                </span>
                <Tag className="w-4 h-4 text-gold-600" />
              </div>

              <h3 className="font-serif font-bold text-lg text-stone-900 pt-1">
                {c.discountType === 'PERCENTAGE'
                  ? `${c.discountValue}% Discount`
                  : `${formatPrice(c.discountValue)} Flat Off`}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">{c.description}</p>
              <p className="text-[11px] text-stone-400">Min. order: {formatPrice(c.minOrderValue)}</p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => handleCopy(c.code)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-700 hover:text-gold-900 transition-colors"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Code Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <Link
                href="/shop"
                className="text-xs font-bold text-royal-950 hover:underline flex items-center gap-1"
              >
                <span>Shop</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Royal Festive Hampers Callout */}
      <div className="rounded-3xl p-8 bg-royal-900 text-white border-2 border-gold-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Gift className="w-4 h-4" />
            <span>Corporate & Wedding Assortments</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Looking for Custom Bulk Event Packaging?
          </h2>
          <p className="text-xs sm:text-sm text-stone-300">
            For weddings and corporate gifting exceeding 25 kg, enjoy custom brass platters, velvet chests, and tailored volume discounts.
          </p>
        </div>

        <Link
          href="/event-booking"
          className="px-6 py-3 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm shrink-0 hover:scale-105 transition-transform"
        >
          Book Event Catering
        </Link>
      </div>
    </div>
  );
}
