'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/utils';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/payments?page=${page}&limit=12`;
      if (selectedStatus) query += `&status=${encodeURIComponent(selectedStatus)}`;

      const res = await api.get(query);
      if (res.success) {
        setPayments(Array.isArray(res.data) ? res.data : []);
        if (res.meta?.totalPages) setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-amber-600" />
            Razorpay Payment Settlements & Audit
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Cryptographically verified transaction logs across instant orders, advance deposits, and balance settlements.
          </p>
        </div>

        <button
          onClick={() => fetchPayments()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 self-start sm:self-auto transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-semibold text-stone-700">RBI & Razorpay Signature Audited</span>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="">All Payment Statuses</option>
            <option value="Paid">Paid (Captured)</option>
            <option value="Pending">Pending / Created</option>
            <option value="Failed">Failed / Declined</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
            Loading cryptographic payment logs...
          </div>
        ) : (!payments || payments.length === 0) ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No payments found</h3>
            <p className="text-stone-500 text-xs mt-1">Payment transactions will appear here once orders are placed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Internal Ref</th>
                  <th className="px-6 py-4">Razorpay Identifiers</th>
                  <th className="px-6 py-4">Associated Entity</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Verification Status</th>
                  <th className="px-6 py-4">Settlement Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {payments.map((pay) => (
                  <tr key={pay._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-stone-900">
                      {pay.paymentNumber || pay._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-stone-600 space-y-0.5">
                      <span className="block text-stone-900 font-semibold truncate max-w-[170px]">
                        Order: {pay.razorpayOrderId}
                      </span>
                      {pay.razorpayPaymentId && (
                        <span className="block text-emerald-700 truncate max-w-[170px]">
                          PayId: {pay.razorpayPaymentId}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {pay.orderId ? (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          Instant Order
                        </span>
                      ) : pay.bookingId ? (
                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                          Advance Event Booking
                        </span>
                      ) : (
                        <span className="text-stone-400">Direct Payment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-900">
                      {formatPrice(pay.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-medium text-stone-600 uppercase">
                        {pay.paymentType || 'Full'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          pay.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pay.status === 'Failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pay.status === 'Paid' ? 'Captured ✓' : pay.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-xs">
                      {formatDate(pay.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
