'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  Info,
  Save,
} from 'lucide-react';
import { api } from '../../../lib/api';

export default function AdminDeliverySlotsPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Global same-day cutoff buffer settings
  const [cutoffValue, setCutoffValue] = useState<number>(1);
  const [cutoffUnit, setCutoffUnit] = useState<'hours' | 'minutes' | 'seconds'>('hours');
  const [savingCutoff, setSavingCutoff] = useState(false);
  const [cutoffSuccess, setCutoffSuccess] = useState('');
  const [cutoffError, setCutoffError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    startTime: '09:00',
    endTime: '11:00',
    maxCapacity: 25,
    orderType: 'ALL',
    active: true,
    hasCustomCutoff: false,
    customCutoffValue: 1,
    customCutoffUnit: 'hours' as 'hours' | 'minutes' | 'seconds',
  });

  const presets = [
    { label: '15 Mins', value: 15, unit: 'minutes' as const },
    { label: '30 Mins', value: 30, unit: 'minutes' as const },
    { label: '45 Mins', value: 45, unit: 'minutes' as const },
    { label: '1 Hour', value: 1, unit: 'hours' as const },
    { label: '2 Hours', value: 2, unit: 'hours' as const },
    { label: '3 Hours', value: 3, unit: 'hours' as const },
  ];

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery-slots');
      if (res.success) {
        setSlots(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load delivery slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success && res.data) {
        if (res.data.sameDaySlotCutoffValue !== undefined) {
          setCutoffValue(Number(res.data.sameDaySlotCutoffValue));
        }
        if (res.data.sameDaySlotCutoffUnit) {
          setCutoffUnit(res.data.sameDaySlotCutoffUnit);
        }
      }
    } catch (err) {
      console.error('Failed to load cutoff settings:', err);
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchSettings();
  }, []);

  const handleSaveCutoff = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingCutoff(true);
      setCutoffError('');
      setCutoffSuccess('');

      const val = Math.max(0, Number(cutoffValue));
      const res = await api.put('/settings', {
        sameDaySlotCutoffValue: val,
        sameDaySlotCutoffUnit: cutoffUnit,
      });

      if (res.success) {
        setCutoffSuccess(`Cutoff buffer successfully updated to ${val} ${cutoffUnit}.`);
        setTimeout(() => setCutoffSuccess(''), 4000);
        fetchSlots();
      } else {
        setCutoffError(res.message || 'Failed to update cutoff buffer rule.');
      }
    } catch (err: any) {
      setCutoffError(err.message || 'Error saving cutoff rule.');
    } finally {
      setSavingCutoff(false);
    }
  };

  const openAddModal = () => {
    setEditingSlot(null);
    setFormData({
      title: '09:00 AM – 11:00 AM',
      startTime: '09:00',
      endTime: '11:00',
      maxCapacity: 25,
      orderType: 'ALL',
      active: true,
      hasCustomCutoff: false,
      customCutoffValue: cutoffValue,
      customCutoffUnit: cutoffUnit,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (slot: any) => {
    setEditingSlot(slot);
    setFormData({
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxCapacity: slot.maxCapacity,
      orderType: slot.orderType || 'ALL',
      active: slot.active !== false,
      hasCustomCutoff: slot.customCutoffValue != null,
      customCutoffValue: slot.customCutoffValue != null ? slot.customCutoffValue : cutoffValue,
      customCutoffUnit: slot.customCutoffUnit || cutoffUnit,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');

      const payload: any = {
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxCapacity: Number(formData.maxCapacity) || 20,
        orderType: formData.orderType,
        active: formData.active,
        customCutoffValue: formData.hasCustomCutoff ? Number(formData.customCutoffValue) : null,
        customCutoffUnit: formData.hasCustomCutoff ? formData.customCutoffUnit : null,
      };

      let res;
      if (editingSlot) {
        res = await api.put(`/delivery-slots/${editingSlot._id}`, payload);
      } else {
        res = await api.post('/delivery-slots', payload);
      }

      if (res.success) {
        setModalOpen(false);
        fetchSlots();
      } else {
        setErrorMsg(res.message || 'Failed to save delivery slot.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete delivery slot "${title}"?`)) return;
    try {
      const res = await api.delete(`/delivery-slots/${id}`);
      if (res.success) {
        fetchSlots();
      }
    } catch (err) {
      console.error('Failed to delete slot:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-amber-600" />
            Delivery Slot Capacity Management
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Control delivery dispatch windows, throttle maximum kitchen order capacity, and manage same-day booking cutoffs.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-900/20 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Delivery Slot
        </button>
      </div>

      {/* Same-Day Order Advance Notice Cutoff Buffer Management Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white rounded-3xl p-6 sm:p-7 border border-amber-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-900/10">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base sm:text-lg flex items-center gap-2">
                Same-Day Slot Cutoff Buffer (Advance Notice Rule)
              </h2>
              <p className="text-stone-600 text-xs">
                Configure how much advance notice is required before a delivery slot starts for today&apos;s instant checkout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              Active Global Rule: <strong>{cutoffValue} {cutoffUnit}</strong> prior
            </span>
          </div>
        </div>

        {cutoffSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {cutoffSuccess}
          </div>
        )}

        {cutoffError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            {cutoffError}
          </div>
        )}

        <form onSubmit={handleSaveCutoff} className="space-y-4 bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-amber-200/50">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="block text-stone-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                Notice Buffer Value *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={cutoffValue}
                onChange={(e) => setCutoffValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 font-bold text-sm bg-white"
                placeholder="e.g. 1, 2, 30, 45"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-stone-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                Time Unit (Hour / Minute / Second) *
              </label>
              <select
                value={cutoffUnit}
                onChange={(e) => setCutoffUnit(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 font-semibold text-sm bg-white cursor-pointer"
              >
                <option value="hours">Hours (hrs)</option>
                <option value="minutes">Minutes (mins)</option>
                <option value="seconds">Seconds (secs)</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <button
                type="submit"
                disabled={savingCutoff}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {savingCutoff ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving Rule...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Cutoff Rule
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
              Quick Presets:
            </span>
            {presets.map((p) => {
              const isActive = cutoffValue === p.value && cutoffUnit === p.unit;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setCutoffValue(p.value);
                    setCutoffUnit(p.unit);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Live Impact:</strong> For today&apos;s checkout, each delivery window will close{' '}
              <span className="font-bold text-stone-900 underline">
                {cutoffValue} {cutoffUnit}
              </span>{' '}
              before its starting time. Customers will not be allowed to place orders into closed slots.
            </p>
          </div>
        </form>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
            Loading delivery slots...
          </div>
        ) : (!slots || slots.length === 0) ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No delivery slots configured</h3>
            <p className="text-stone-500 text-xs mt-1">Click &apos;Add Delivery Slot&apos; to set up your store delivery windows.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Slot Window</th>
                  <th className="px-6 py-4">Time Range</th>
                  <th className="px-6 py-4">Notice Buffer</th>
                  <th className="px-6 py-4">Max Capacity</th>
                  <th className="px-6 py-4">Supported Channel</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {slots.map((s) => (
                  <tr key={s._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-stone-900 block">{s.title}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-stone-600">
                      {s.startTime} – {s.endTime}
                    </td>
                    <td className="px-6 py-4">
                      {s.customCutoffValue != null ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                          {s.customCutoffValue} {s.customCutoffUnit || 'hours'} (Custom)
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                          {cutoffValue} {cutoffUnit} (Global)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-stone-900">{s.maxCapacity} orders</span>
                      <span className="text-[11px] text-stone-400 block">per calendar day</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full">
                        {s.orderType === 'ALL'
                          ? 'Instant + Advance'
                          : s.orderType === 'INSTANT'
                          ? 'Instant Only'
                          : 'Advance Event Only'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.active !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {s.active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-amber-800 transition-colors"
                        title="Edit Slot"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id, s.title)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Delete Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Slot Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">
              {editingSlot ? 'Edit Delivery Window' : 'New Delivery Slot'}
            </h2>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Slot Label *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  placeholder="e.g. 09:00 AM – 11:00 AM"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Start Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">End Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Max Capacity (Orders)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Channel Restriction</label>
                <select
                  value={formData.orderType}
                  onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Orders (Instant + Advance)</option>
                  <option value="INSTANT">Instant Delivery Only</option>
                  <option value="ADVANCE_BOOKING">Advance Event Bookings Only</option>
                </select>
              </div>

              {/* Custom Cutoff Override */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800 text-xs">
                  <input
                    type="checkbox"
                    checked={formData.hasCustomCutoff}
                    onChange={(e) => setFormData({ ...formData, hasCustomCutoff: e.target.checked })}
                    className="rounded border-stone-300 text-amber-600"
                  />
                  <span>Set Custom Advance Notice Buffer for this Slot</span>
                </label>

                {formData.hasCustomCutoff ? (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
                    <div>
                      <label className="block text-stone-500 text-[11px] font-semibold mb-1">Buffer Value</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.customCutoffValue}
                        onChange={(e) => setFormData({ ...formData, customCutoffValue: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-500 text-[11px] font-semibold mb-1">Unit</label>
                      <select
                        value={formData.customCutoffUnit}
                        onChange={(e) => setFormData({ ...formData, customCutoffUnit: e.target.value as any })}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
                      >
                        <option value="hours">Hours</option>
                        <option value="minutes">Minutes</option>
                        <option value="seconds">Seconds</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-500">
                    Currently follows the global rule: <strong>{cutoffValue} {cutoffUnit}</strong> prior.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-stone-300 text-amber-600"
                  />
                  Delivery Slot Active
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs shadow-md shadow-amber-900/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
