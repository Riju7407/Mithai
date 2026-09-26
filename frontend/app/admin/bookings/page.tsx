'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays,
  Search,
  Eye,
  Calendar,
  Gift,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  User,
  Sparkles,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/utils';
import { generateBookingInvoicePDF } from '../../../lib/invoiceGenerator';

const BOOKING_STATUSES = [
  'Received',
  'Advance Confirmed',
  'Scheduled',
  'In Production',
  'Dispatched',
  'Fulfilled',
  'Cancelled',
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/bookings?page=${page}&limit=12`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (selectedStatus) query += `&status=${encodeURIComponent(selectedStatus)}`;

      const res = await api.get(query);
      if (res.success) {
        setBookings(Array.isArray(res.data) ? res.data : []);
        if (res.meta?.totalPages) setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch advance bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      const res = await api.put(`/bookings/${bookingId}/status`, {
        bookingStatus: newStatus,
        note: `Status updated to ${newStatus} via Admin Bookings Console.`,
      });

      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, bookingStatus: newStatus } : b))
        );
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, bookingStatus: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-purple-600" />
            Advance Event Bookings
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Oversee bespoke wholesale orders for weddings, celebrations, and corporate gifting with deposit tracking.
          </p>
        </div>

        <button
          onClick={() => fetchBookings()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 self-start sm:self-auto transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          Refresh Pipeline
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Booking #, customer name, email, or event title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          >
            <option value="">All Pipeline Stages</option>
            {BOOKING_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
            Loading advance event bookings...
          </div>
        ) : (!bookings || bookings.length === 0) ? (
          <div className="p-12 text-center">
            <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No advance bookings found</h3>
            <p className="text-stone-500 text-xs mt-1">Try modifying your search or stage filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Event & Guests</th>
                  <th className="px-6 py-4">Event Date</th>
                  <th className="px-6 py-4">Financials</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Pipeline Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-stone-900 block">{b.bookingNumber}</span>
                      <span className="text-[11px] text-stone-500">{b.customerName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-800 block">{b.eventName}</span>
                      <span className="text-[11px] text-purple-700 font-medium">
                        {b.eventType} • {b.guestCount} Guests
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-stone-900 block">{formatDate(b.eventDate)}</span>
                      <span className="text-[11px] text-stone-400">
                        Dispatch: {formatDate(b.deliveryDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-stone-900 block">{formatPrice(b.totalAmount)}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        Adv: {formatPrice(b.advanceAmountPaid)}
                      </span>
                      {b.balanceAmountDue > 0 && (
                        <span className="text-[10px] text-amber-700 block">
                          Bal: {formatPrice(b.balanceAmountDue)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {b.paymentStatus === 'Partial' ? 'Deposit Paid (30%)' : b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={b.bookingStatus}
                        disabled={updatingId === b._id}
                        onChange={(e) => handleStatusChange(b._id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-purple-200 bg-purple-50 text-purple-900 focus:outline-none"
                      >
                        {BOOKING_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 hover:text-purple-800 transition-colors"
                        title="View Full Booking Details"
                      >
                        <Eye className="w-4 h-4" />
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-stone-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                  Advance Event Contract
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {selectedBooking.bookingNumber} • {selectedBooking.eventName}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {selectedBooking.eventType} on {formatDate(selectedBooking.eventDate || selectedBooking.deliveryDate)} ({selectedBooking.guestCount || selectedBooking.numberOfGuests} expected guests)
                </p>
              </div>

              <div>
                <button
                  onClick={() => generateBookingInvoicePDF(selectedBooking, true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full gold-gradient text-royal-950 font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all"
                  title="Download Customer Event Bill (PDF)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Bill (PDF)</span>
                </button>
              </div>
            </div>

            {/* Customer & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 mb-6 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  {selectedBooking.customerName}
                </span>
                <p className="text-stone-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  {selectedBooking.contactNumber || selectedBooking.customerPhone}
                </p>
                <p className="text-stone-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {selectedBooking.customerEmail}
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-stone-200 sm:pl-4">
                <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  Event Venue / Destination
                </span>
                <p className="text-stone-600 leading-relaxed">
                  {selectedBooking.deliveryAddress?.street}, {selectedBooking.deliveryAddress?.city} -{' '}
                  {selectedBooking.deliveryAddress?.pincode}
                </p>
                <p className="text-[11px] text-purple-700 font-semibold mt-1">
                  Time Slot: {selectedBooking.deliverySlot?.name || '10:00 AM - 01:00 PM'}
                </p>
              </div>
            </div>

            {/* Packaging & Custom Instructions */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 mb-6 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-700" />
                <span className="font-bold text-purple-950">
                  Bespoke Packaging: {selectedBooking.packaging?.name || 'Royal Gift Box'}
                </span>
              </div>
              {selectedBooking.customMessage && (
                <p className="text-stone-700 italic bg-white/80 p-2.5 rounded-xl border border-purple-100">
                  &ldquo;{selectedBooking.customMessage}&rdquo;
                </p>
              )}
              {selectedBooking.specialInstructions && (
                <p className="text-stone-600 text-[11px]">
                  <strong>Special Kitchen Note:</strong> {selectedBooking.specialInstructions}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-3 mb-6">
              <h3 className="font-serif font-bold text-stone-900 text-sm">Bulk Confectionery List</h3>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                {selectedBooking.items?.map((it: any, i: number) => (
                  <div key={i} className="p-3.5 flex items-center justify-between text-xs bg-white">
                    <div>
                      <span className="font-semibold text-stone-900 block">{it.productName}</span>
                      <span className="text-[11px] text-stone-500">
                        {it.quantity} {it.unit} @ {formatPrice(it.unitPrice)}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900">{formatPrice(it.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Status */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs mb-6">
              <div className="flex justify-between text-stone-600">
                <span>Contract Total</span>
                <span className="font-bold text-stone-900">{formatPrice(selectedBooking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Advance Deposit Paid</span>
                <span className="font-bold">{formatPrice(selectedBooking.advanceAmountPaid)}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Remaining Balance Due</span>
                <span className="font-bold text-amber-800">{formatPrice(selectedBooking.balanceAmountDue)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-700">Pipeline Stage:</span>
                <select
                  value={selectedBooking.bookingStatus}
                  onChange={(e) => handleStatusChange(selectedBooking._id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-800"
                >
                  {BOOKING_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
              >
                Close Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
