'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Eye,
  X,
  Sparkles,
  Gift,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/utils';

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const month = currentDate.getMonth() + 1; // 1-12
  const year = currentDate.getFullYear();

  useEffect(() => {
    async function loadCalendar() {
      try {
        setLoading(true);
        const res = await api.get(`/admin/calendar?month=${month}&year=${year}`);
        if (res.success && res.data) {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data.bookings)
            ? res.data.bookings
            : [];
          setBookings(list);
        }
      } catch (err) {
        console.error('Failed to load calendar bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCalendar();
  }, [month, year]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Compute days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday

  // Map bookings by date string (YYYY-MM-DD)
  const bookingsByDate: Record<string, any[]> = {};
  if (Array.isArray(bookings)) {
    bookings.forEach((b) => {
      const key = new Date(b.deliveryDate || b.eventDate).toISOString().split('T')[0];
      if (!bookingsByDate[key]) bookingsByDate[key] = [];
      bookingsByDate[key].push(b);
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-amber-600" />
            Advance Event Booking Calendar
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Interactive schedule for grand weddings, celebration deliveries, and kitchen production deadlines.
          </p>
        </div>

        {/* View Switcher & Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-stone-200/80 p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'agenda' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Agenda List
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif font-bold text-xs sm:text-sm text-stone-900 px-2 min-w-[120px] text-center">
              {monthName} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center text-stone-400 text-xs animate-pulse">
          Loading event calendar...
        </div>
      ) : viewMode === 'month' ? (
        /* Calendar Grid View */
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-stone-50 border-b border-stone-200 text-center py-2.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-100 min-h-[500px]">
            {/* Blank offset cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`offset-${i}`} className="bg-stone-50/40 p-2 min-h-[90px]"></div>
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(
                2,
                '0'
              )}`;
              const dayBookings = bookingsByDate[dateStr] || [];
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() + 1 === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={dateStr}
                  className={`p-2 min-h-[90px] flex flex-col justify-between hover:bg-amber-50/20 transition-colors ${
                    isToday ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center'
                          : 'text-stone-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  {/* Day Booking Pills */}
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayBookings.map((b) => (
                      <button
                        key={b._id}
                        onClick={() => setSelectedBooking(b)}
                        className="w-full text-left p-1 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200/80 transition-colors block text-[10px] truncate"
                      >
                        <span className="font-bold text-purple-900 block truncate">
                          {b.eventName}
                        </span>
                        <span className="text-purple-600 truncate block">
                          {b.eventType} • {formatPrice(b.totalAmount)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="space-y-3">
          {(!bookings || bookings.length === 0) ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <CalendarIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="font-serif font-bold text-stone-800 text-base">No bookings scheduled in {monthName}</p>
            </div>
          ) : (
            (Array.isArray(bookings) ? bookings : []).map((b) => (
              <div
                key={b._id}
                onClick={() => setSelectedBooking(b)}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:border-purple-300 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex flex-col items-center justify-center font-bold shrink-0 border border-purple-200">
                    <span className="text-sm leading-none">
                      {new Date(b.eventDate).getDate()}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider">
                      {new Date(b.eventDate).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-stone-400 block">{b.bookingNumber}</span>
                    <h3 className="font-serif font-bold text-stone-900 text-base">{b.eventName}</h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {b.eventType} • {b.guestCount} Guests • Customer: {b.customerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="font-bold text-stone-900 text-sm block">
                      {formatPrice(b.totalAmount)}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      Paid: {formatPrice(b.advanceAmountPaid)}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.bookingStatus === 'Fulfilled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.bookingStatus === 'In Production'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {b.bookingStatus}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-stone-100 pb-4 mb-4">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                {selectedBooking.bookingNumber}
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                {selectedBooking.eventName}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {selectedBooking.eventType} on {formatDate(selectedBooking.eventDate)} ({selectedBooking.guestCount} Guests)
              </p>
            </div>

            <div className="space-y-3 text-xs text-stone-700 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Host: <strong>{selectedBooking.customerName}</strong> ({selectedBooking.customerPhone})</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>Venue: {selectedBooking.deliveryAddress?.street}, {selectedBooking.deliveryAddress?.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Slot: {selectedBooking.deliverySlot?.name || 'Standard 10am - 1pm'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 mb-6 flex justify-between items-center text-xs">
              <div>
                <span className="text-stone-500 block">Total Contract</span>
                <span className="font-bold text-stone-900 text-base">{formatPrice(selectedBooking.totalAmount)}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 font-semibold block">Deposit: {formatPrice(selectedBooking.advanceAmountPaid)}</span>
                <span className="text-amber-800 font-semibold block">Balance: {formatPrice(selectedBooking.balanceAmountDue)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
            >
              Close Calendar Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
