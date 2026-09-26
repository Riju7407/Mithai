'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  CalendarDays,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  CreditCard,
  Crown,
  Banknote,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatPrice, formatDate } from '../../lib/utils';

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [codEnabled, setCodEnabled] = useState(false);
  const [togglingCod, setTogglingCod] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [kpiRes, revRes, settingsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/analytics/revenue?days=14'),
          api.get('/settings'),
        ]);

        if (kpiRes.success) setKpis(kpiRes.data);
        if (revRes.success) setRevenueData(Array.isArray(revRes.data) ? revRes.data : []);
        if (settingsRes.success && settingsRes.data) {
          setCodEnabled(Boolean(settingsRes.data.enableCashOnDelivery));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleCod = async () => {
    const nextState = !codEnabled;
    setCodEnabled(nextState);
    try {
      setTogglingCod(true);
      await api.put('/settings', { enableCashOnDelivery: nextState });
    } catch (err) {
      console.error('Failed to toggle COD:', err);
      setCodEnabled(!nextState); // revert on failure
    } finally {
      setTogglingCod(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-stone-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-72 bg-stone-200 rounded-3xl"></div>
      </div>
    );
  }

  // Calculate highest revenue for SVG chart scaling
  const maxRevenue = Math.max(...((Array.isArray(revenueData) ? revenueData : []).map((d) => d.total) || [1000]), 1000);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            Operations & Revenue Hub
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Live overview of kitchen prep, advance event pipeline, and settlement analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Database Synchronized
        </div>
      </div>

      {/* Quick Action: Cash Home Delivery Toggle Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              codEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
            }`}
          >
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-stone-900">Cash Home Delivery (COD) on Checkout</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  codEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {codEnabled ? 'Active (ON)' : 'Disabled (OFF)'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {codEnabled
                ? 'Customers currently have two options on checkout: Pay Online (Razorpay) or Cash Home Delivery.'
                : 'Customers only see Online Payment on checkout. Cash Home Delivery is disabled.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleCod}
          disabled={togglingCod}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs ${
            codEnabled
              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {codEnabled ? (
            <>
              <ToggleRight className="w-4 h-4" />
              <span>Turn OFF Cash on Delivery</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span>Turn ON Cash on Delivery</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Today's Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Today&apos;s Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">
            {formatPrice(kpis?.todayRevenue || 0)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">Instant orders + Advance deposits</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Month to Date</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">
            {formatPrice(kpis?.monthlyRevenue || 0)}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Current billing cycle</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Active Instant Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">
            {kpis?.pendingOrdersCount || 0}
          </p>
          <Link href="/admin/orders" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium">
            Review in kitchen queue <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Advance Bookings in Pipeline */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Advance Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">
            {kpis?.pendingBookingsCount || 0}
          </p>
          <Link href="/admin/bookings" className="text-[11px] text-purple-600 hover:underline flex items-center gap-1 mt-1 font-medium">
            Manage event production <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-900 font-semibold block">Upcoming Events</span>
            <span className="text-lg font-bold text-stone-900">{kpis?.upcomingEventsCount || 0} scheduled</span>
          </div>
          <Calendar className="w-6 h-6 text-amber-600" />
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-600 font-semibold block">Pending Balance Due</span>
            <span className="text-lg font-bold text-stone-900">{formatPrice(kpis?.pendingBalanceTotal || 0)}</span>
          </div>
          <Clock className="w-6 h-6 text-stone-500" />
        </div>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          (kpis?.lowStockCount || 0) > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div>
            <span className={`text-xs font-semibold block ${
              (kpis?.lowStockCount || 0) > 0 ? 'text-rose-900' : 'text-emerald-900'
            }`}>
              Low Stock Alerts
            </span>
            <span className="text-lg font-bold text-stone-900">
              {kpis?.lowStockCount || 0} items low
            </span>
          </div>
          <AlertTriangle className={`w-6 h-6 ${
            (kpis?.lowStockCount || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
          }`} />
        </div>
      </div>

      {/* 14-Day Revenue Analytics Visual Chart */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">14-Day Daily Revenue Trend</h2>
            <p className="text-xs text-stone-500">Aggregated payments across Instant Orders and Advance Event Booking deposits.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Instant
            </span>
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              Advance
            </span>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-stone-100 overflow-x-auto">
          {(Array.isArray(revenueData) ? revenueData : []).map((d, idx) => {
            const instantHeight = maxRevenue > 0 ? (d.instant / maxRevenue) * 100 : 0;
            const advanceHeight = maxRevenue > 0 ? (d.advance / maxRevenue) * 100 : 0;
            return (
              <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10">
                  {d.date}: {formatPrice(d.total)}
                </div>
                <div className="w-full bg-stone-100 rounded-t-lg h-36 flex flex-col justify-end overflow-hidden p-0.5">
                  <div
                    style={{ height: `${advanceHeight}%` }}
                    className="w-full bg-purple-500 rounded-t"
                  ></div>
                  <div
                    style={{ height: `${instantHeight}%` }}
                    className="w-full bg-amber-500 rounded-t mt-0.5"
                  ></div>
                </div>
                <span className="text-[9px] text-stone-400 truncate w-full text-center">
                  {d.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Instant Orders */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              Recent Instant Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-amber-700 hover:underline font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!kpis?.recentOrders || kpis.recentOrders.length === 0) ? (
              <p className="text-xs text-stone-400 py-6 text-center">No orders recorded yet.</p>
            ) : (
              kpis.recentOrders.map((order: any) => (
                <div key={order._id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-stone-900 block">{order.orderNumber}</span>
                    <span className="text-stone-500 text-[11px]">{order.user?.name || 'Customer'} • {formatDate(order.createdAt)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900 block">{formatPrice(order.grandTotal)}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'Out for Delivery'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Advance Event Bookings */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-600" />
              Upcoming Event Celebrations
            </h2>
            <Link href="/admin/bookings" className="text-xs text-purple-700 hover:underline font-semibold flex items-center gap-1">
              View Pipeline <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!kpis?.upcomingBookings || kpis.upcomingBookings.length === 0) ? (
              <p className="text-xs text-stone-400 py-6 text-center">No upcoming celebration bookings.</p>
            ) : (
              kpis.upcomingBookings.map((b: any) => (
                <div key={b._id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-stone-900 block">{b.bookingNumber} - {b.eventName}</span>
                    <span className="text-stone-500 text-[11px]">
                      {b.eventType} • {formatDate(b.eventDate)} ({b.guestCount} guests)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900 block">{formatPrice(b.totalAmount)}</span>
                    <span className="text-[10px] font-medium text-emerald-700 block">
                      Paid: {formatPrice(b.advanceAmountPaid)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Warning Table */}
      {kpis?.lowStockAlerts && kpis.lowStockAlerts.length > 0 && (
        <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h2 className="font-serif font-bold text-rose-950 text-base">Low Stock Procurement Alerts</h2>
            </div>
            <Link href="/admin/products" className="text-xs text-rose-700 hover:underline font-semibold">
              Manage Inventory
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {kpis.lowStockAlerts.map((prod: any) => {
              const available = prod.stockQuantity - (prod.reservedStock || 0);
              return (
                <div key={prod._id} className="bg-white p-3.5 rounded-2xl border border-rose-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-900 block">{prod.productName}</span>
                    <span className="text-stone-500 text-[11px]">Threshold: {prod.lowStockThreshold} {prod.weightUnit}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-600 text-sm block">{available} {prod.weightUnit}</span>
                    <span className="text-[10px] text-stone-400">Available</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
