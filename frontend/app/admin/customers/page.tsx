'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/admin/customers?page=${page}&limit=12`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;

      const res = await api.get(query);
      if (res.success) {
        setCustomers(Array.isArray(res.data) ? res.data : []);
        if (res.meta?.totalPages) setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleStatus = async (id: string) => {
    try {
      setTogglingId(id);
      const res = await api.patch(`/admin/customers/${id}/toggle-status`, {});
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (err) {
      console.error('Failed to toggle customer status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-600" />
            Customer Accounts & Patronage
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            View registered patrons, track cumulative confectionery lifetime spend, and manage account statuses.
          </p>
        </div>

        <button
          onClick={() => fetchCustomers()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 self-start sm:self-auto transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          Refresh Customers
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email address, or phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
            Loading patron records...
          </div>
        ) : (!customers || customers.length === 0) ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No patrons found</h3>
            <p className="text-stone-500 text-xs mt-1">Try modifying your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Patron Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Orders & Bookings</th>
                  <th className="px-6 py-4">Lifetime Spend</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-900 text-xs shrink-0">
                        {c.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block">{c.name}</span>
                        <span className="text-[11px] text-stone-400">Patron #{c._id.slice(-6)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <span className="text-stone-700 flex items-center gap-1.5 text-xs">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        {c.email}
                      </span>
                      {c.phone && (
                        <span className="text-stone-500 flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          {c.phone}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-800 block">
                        {c.totalOrdersCount || 0} Instant Orders
                      </span>
                      <span className="text-[11px] text-purple-700 block">
                        {c.totalBookingsCount || 0} Advance Event Bookings
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-stone-900 text-sm">
                        {formatPrice(c.totalSpend || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        disabled={togglingId === c._id}
                        onClick={() => handleToggleStatus(c._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          c.isActive !== false
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {c.isActive !== false ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Activate
                          </>
                        )}
                      </button>
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
