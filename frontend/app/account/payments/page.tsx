'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice, formatDateTime } from '../../../lib/utils';
import { useAuthStore } from '../../../store/authStore';

export default function CustomerPaymentsPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/payments')
      .then((res) => setPayments(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 bg-stone-200/60 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Sign in to view payment history</h2>
        <Link
          href="/login?redirect=/account/payments"
          className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-950">
          Payment & Transaction History
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete ledger of Razorpay digital payments for instant orders and advance event deposits.
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
          <CreditCard className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-stone-900">No payment records found</h3>
          <p className="text-xs text-stone-500">Payments made via Razorpay will be itemized here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Payment ID</th>
                  <th className="py-3.5 px-4 font-semibold">Reference</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Razorpay ID</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-royal-900">
                      {p.paymentNumber}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {p.orderId?.orderNumber || p.bookingId?.bookingNumber || 'Direct'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-stone-900">
                      {formatPrice(p.amount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                      {p.razorpayPaymentId || 'Pending Gateway'}
                    </td>
                    <td className="py-3 px-4 text-stone-400">
                      {formatDateTime(p.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
