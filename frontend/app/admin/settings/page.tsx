'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Truck,
  Calendar,
  CreditCard,
  Percent,
  Sparkles,
  Banknote,
  ToggleLeft,
  ToggleRight,
  Award,
} from 'lucide-react';
import { api } from '../../../lib/api';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [settings, setSettings] = useState({
    restaurantName: 'Shree Mithai & Royal Confectionery',
    tagline: 'Artisanal Confections Handcrafted with Pure Desi Ghee',
    contactEmail: 'contact@shreemithai.com',
    contactPhone: '+91 (0) 44 2827 4567',
    address: '18 Royal Heritage Avenue, T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    currency: 'INR',
    currencySymbol: '₹',
    gstRate: 5,
    standardDeliveryFee: 60,
    freeDeliveryThreshold: 499,
    minAdvanceBookingDays: 3,
    maxAdvanceBookingDays: 90,
    advanceDepositPercentage: 30,
    instantOrderCutoffTime: '19:00',
    sameDaySlotCutoffValue: 1,
    sameDaySlotCutoffUnit: 'hours',
    enableRazorpayTestMode: true,
    enableCashOnDelivery: false,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggleCod = async () => {
    const nextState = !settings.enableCashOnDelivery;
    setSettings((prev) => ({ ...prev, enableCashOnDelivery: nextState }));
    try {
      setSaving(true);
      setErrorMsg('');
      const res = await api.put('/settings', {
        enableCashOnDelivery: nextState,
      });
      if (res.success) {
        setSuccessMsg(
          `Cash Home Delivery option has been turned ${nextState ? 'ON (Available on Checkout)' : 'OFF (Hidden on Checkout)'}.`
        );
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to update Cash on Delivery setting.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while updating Cash on Delivery.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.put('/settings', {
        ...settings,
        enableCashOnDelivery: Boolean(settings.enableCashOnDelivery),
        gstRate: Number(settings.gstRate),
        standardDeliveryFee: Number(settings.standardDeliveryFee),
        freeDeliveryThreshold: Number(settings.freeDeliveryThreshold),
        minAdvanceBookingDays: Number(settings.minAdvanceBookingDays),
        maxAdvanceBookingDays: Number(settings.maxAdvanceBookingDays),
        advanceDepositPercentage: Number(settings.advanceDepositPercentage),
        sameDaySlotCutoffValue: Number(settings.sameDaySlotCutoffValue) || 0,
        sameDaySlotCutoffUnit: settings.sameDaySlotCutoffUnit || 'hours',
      });

      if (res.success) {
        setSuccessMsg('Restaurant configuration and operational rules saved successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to update settings.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-12 text-center text-stone-400 text-xs animate-pulse">
        Loading restaurant parameters...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-amber-600" />
          Restaurant Configuration & Business Rules
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Govern platform fees, GST rates, advance event deposit policies, delivery radii, and brand metadata.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs sm:text-sm">
        {/* Section 1: Brand & Contact Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-3">
            <Building className="w-4 h-4 text-amber-600" />
            1. Brand Identity & Communication
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-600 font-semibold mb-1">Establishment Title</label>
              <input
                type="text"
                value={settings.restaurantName}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Brand Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Support Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Helpline Phone</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-600 font-semibold mb-1">Flagship Boutique Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Logistics & Tax */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-3">
            <Truck className="w-4 h-4 text-amber-600" />
            2. Taxes & Delivery Logistics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-600 font-semibold mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                value={settings.gstRate}
                onChange={(e) => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.standardDeliveryFee}
                onChange={(e) => setSettings({ ...settings, standardDeliveryFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="sm:col-span-3 pt-2 border-t border-stone-100">
              <label className="block text-stone-700 font-semibold mb-1">
                Same-Day Slot Booking Cutoff Buffer (Advance Notice Rule)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <span className="text-[11px] text-stone-500 block mb-1">Buffer Value</span>
                  <input
                    type="number"
                    min="0"
                    value={settings.sameDaySlotCutoffValue ?? 1}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sameDaySlotCutoffValue: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-semibold"
                    placeholder="e.g. 1, 2, 30, 45"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block mb-1">Time Unit</span>
                  <select
                    value={settings.sameDaySlotCutoffUnit || 'hours'}
                    onChange={(e) => setSettings({ ...settings, sameDaySlotCutoffUnit: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
                  >
                    <option value="hours">Hours</option>
                    <option value="minutes">Minutes</option>
                    <option value="seconds">Seconds</option>
                  </select>
                </div>
                <div className="text-xs text-stone-500 sm:pt-4">
                  For same-day orders, slots will close{' '}
                  <strong className="text-stone-800">
                    {settings.sameDaySlotCutoffValue ?? 1} {settings.sameDaySlotCutoffUnit || 'hours'}
                  </strong>{' '}
                  before their start time.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Payment Gateways & Cash Home Delivery */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
            <h2 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600" />
              <span>3. Payment Gateways & Cash Home Delivery</span>
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  settings.enableCashOnDelivery
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                }`}
              >
                {settings.enableCashOnDelivery ? 'COD Active' : 'COD Disabled'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-stone-900">Cash Home Delivery (Pay on Arrival)</h4>
                {settings.enableCashOnDelivery ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    ON
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                    OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                When enabled, customers can select &quot;Cash Home Delivery&quot; on checkout and place orders without paying online upfront. When disabled, customers must complete payment via Razorpay.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleCod}
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 ${
                settings.enableCashOnDelivery
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-700/20'
              }`}
            >
              {settings.enableCashOnDelivery ? (
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
        </div>

        {/* Section 4: Advance Event Booking Rules */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-3">
            <Calendar className="w-4 h-4 text-purple-600" />
            4. Advance Event Booking Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-600 font-semibold mb-1">Min Advance Notice (Days)</label>
              <input
                type="number"
                min="1"
                value={settings.minAdvanceBookingDays}
                onChange={(e) => setSettings({ ...settings, minAdvanceBookingDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Max Booking Window (Days)</label>
              <input
                type="number"
                min="10"
                value={settings.maxAdvanceBookingDays}
                onChange={(e) => setSettings({ ...settings, maxAdvanceBookingDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Advance Deposit (%)</label>
              <input
                type="number"
                min="10"
                max="100"
                value={settings.advanceDepositPercentage}
                onChange={(e) => setSettings({ ...settings, advanceDepositPercentage: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Brand Story & Our Heritage Page */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <h2 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-600" />
              5. Our Heritage & Brand Story Management
            </h2>
            <Link
              href="/admin/heritage"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-royal-950 font-bold text-xs shadow-xs hover:opacity-95"
            >
              <span>Manage Entire Heritage Page &rarr;</span>
            </Link>
          </div>
          <p className="text-xs text-stone-500">
            Control the royal founding story, A2 Desi Cow Ghee commitments, halwai lineage text, and photography showcased on the public Our Heritage page.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-900/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Persisting Parameters...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
