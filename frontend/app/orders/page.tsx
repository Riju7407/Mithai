'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { formatPrice, formatDate } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

export default function CustomerOrdersPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-32 bg-stone-200/60 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Sign in to view orders</h2>
        <Link
          href="/login?redirect=/orders"
          className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-950">
            My Instant Orders
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track fresh sweet preparations, kitchen dispatch, and past order history.
          </p>
        </div>
        <Link
          href="/account/bookings"
          className="text-xs font-bold text-gold-700 hover:text-gold-900 underline"
        >
          View Event Bookings &rarr;
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream-100 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">No orders placed yet</h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            Order some freshly made Kaju Katli or Motichoor Ladoos to get started.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase shadow"
          >
            Explore Sweets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <Link
              key={ord._id}
              href={`/orders/${ord._id}`}
              className="block bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md hover:border-gold-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <span className="font-mono text-xs font-bold text-gold-700 block">
                    {ord.orderNumber}
                  </span>
                  <span className="text-xs text-stone-400">Placed on {formatDate(ord.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      ord.orderStatus === 'Delivered' || ord.orderStatus === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.orderStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gold-100 text-gold-900 animate-pulse'
                    }`}
                  >
                    {ord.orderStatus}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      ord.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {ord.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-stone-600 space-y-1">
                  <p className="font-bold text-stone-800">
                    {ord.items.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </p>
                  <p className="text-stone-400">
                    Slot: {ord.deliverySlot} &bull; Delivery on {formatDate(ord.deliveryDate)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-serif font-bold text-lg text-royal-950">
                    {formatPrice(ord.grandTotal)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-stone-600">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
