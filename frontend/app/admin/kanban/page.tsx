'use client';

import React, { useEffect, useState } from 'react';
import {
  KanbanSquare,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  Sparkles,
  RefreshCw,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/utils';

const COLUMNS = [
  { id: 'Received', label: 'Received', color: 'bg-stone-100 text-stone-800 border-stone-300' },
  { id: 'Advance Confirmed', label: 'Advance Confirmed', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'Scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'In Production', label: 'In Production', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'Dispatched', label: 'Dispatched', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'Fulfilled', label: 'Fulfilled', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
];

export default function AdminKanbanPage() {
  const [kanbanData, setKanbanData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);

  const loadKanban = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/kanban');
      if (res.success) {
        setKanbanData(res.data);
      }
    } catch (err) {
      console.error('Failed to load kanban:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKanban();
  }, []);

  const moveBooking = async (booking: any, currentCol: string, targetCol: string) => {
    try {
      setMovingId(booking._id);
      // Optimistic update
      setKanbanData((prev) => {
        const next = { ...prev };
        next[currentCol] = (next[currentCol] || []).filter((b) => b._id !== booking._id);
        const updatedBooking = { ...booking, bookingStatus: targetCol };
        next[targetCol] = [...(next[targetCol] || []), updatedBooking];
        return next;
      });

      const res = await api.put(`/bookings/${booking._id}/status`, {
        bookingStatus: targetCol,
        note: `Moved on Kanban board from '${currentCol}' to '${targetCol}'.`,
      });

      if (!res.success) {
        // Rollback
        loadKanban();
      }
    } catch (err) {
      console.error('Failed to move booking on kanban:', err);
      loadKanban();
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <KanbanSquare className="w-7 h-7 text-purple-600" />
            Advance Booking Production Pipeline
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Drag, prioritize, and advance bespoke wedding and corporate orders through kitchen manufacturing and dispatch.
          </p>
        </div>

        <button
          onClick={loadKanban}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 self-start sm:self-auto transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          Refresh Pipeline
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center text-stone-400 text-xs animate-pulse">
          Loading kanban pipeline stages...
        </div>
      ) : (
        /* Kanban Board Horizontal Scroll Container */
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-stone-300 min-h-[650px]">
          {COLUMNS.map((col, colIdx) => {
            const items = (kanbanData && Array.isArray(kanbanData[col.id])) ? kanbanData[col.id] : [];
            const canMoveLeft = colIdx > 0;
            const canMoveRight = colIdx < COLUMNS.length - 1;

            return (
              <div
                key={col.id}
                className="w-80 shrink-0 bg-stone-50 rounded-3xl p-4 border border-stone-200/80 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-stone-900 text-sm">
                      {col.label}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${col.color}`}
                    >
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[750px] pr-1">
                  {items.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center text-stone-400 text-xs font-medium">
                      No contracts in this stage
                    </div>
                  ) : (
                    items.map((b) => (
                      <div
                        key={b._id}
                        className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs hover:border-purple-300 transition-all space-y-3 text-xs"
                      >
                        {/* Booking Number & Type */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-[11px]">
                            {b.bookingNumber}
                          </span>
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                            {b.eventType}
                          </span>
                        </div>

                        {/* Event Title */}
                        <h4 className="font-serif font-bold text-stone-900 text-sm leading-snug">
                          {b.eventName}
                        </h4>

                        {/* Customer & Guests */}
                        <div className="space-y-1 text-stone-500 text-[11px]">
                          <p className="flex items-center gap-1.5 truncate">
                            <span className="font-medium text-stone-700">{b.customerName}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            {b.guestCount} Expected Guests
                          </p>
                          <p className="flex items-center gap-1.5 text-purple-800 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-purple-600" />
                            Event: {formatDate(b.eventDate)}
                          </p>
                        </div>

                        {/* Amounts */}
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex justify-between items-center text-[11px]">
                          <div>
                            <span className="text-stone-400 block text-[9px] uppercase">Contract</span>
                            <span className="font-bold text-stone-900">{formatPrice(b.totalAmount)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-700 font-semibold block text-[10px]">
                              Paid: {formatPrice(b.advanceAmountPaid)}
                            </span>
                            {b.balanceAmountDue > 0 && (
                              <span className="text-amber-800 block text-[10px]">
                                Bal: {formatPrice(b.balanceAmountDue)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stage Controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                          {canMoveLeft ? (
                            <button
                              disabled={movingId === b._id}
                              onClick={() => moveBooking(b, col.id, COLUMNS[colIdx - 1].id)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-600 hover:text-stone-900 p-1 rounded hover:bg-stone-100"
                              title={`Move to ${COLUMNS[colIdx - 1].label}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                              Back
                            </button>
                          ) : (
                            <div></div>
                          )}

                          {canMoveRight && (
                            <button
                              disabled={movingId === b._id}
                              onClick={() => moveBooking(b, col.id, COLUMNS[colIdx + 1].id)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 hover:text-purple-900 p-1 px-2 rounded-lg bg-purple-50 hover:bg-purple-100"
                              title={`Advance to ${COLUMNS[colIdx + 1].label}`}
                            >
                              Advance
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
