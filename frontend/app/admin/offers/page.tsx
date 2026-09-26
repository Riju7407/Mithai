'use client';

import React, { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  Percent,
  IndianRupee,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/utils';

export default function AdminOffersPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxDiscountAmount: 200,
    minOrderValue: 499,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    usageLimit: 500,
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      if (res.success) {
        setCoupons(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: 'Festival Royal Discount',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      maxDiscountAmount: 300,
      minOrderValue: 500,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      usageLimit: 250,
      isActive: true,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxDiscountAmount: c.maxDiscountAmount || 0,
      minOrderValue: c.minOrderValue || 0,
      startDate: new Date(c.startDate).toISOString().split('T')[0],
      endDate: new Date(c.endDate).toISOString().split('T')[0],
      usageLimit: c.usageLimit || 100,
      isActive: c.isActive !== false,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');

      const payload = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: Number(formData.maxDiscountAmount) || undefined,
        minOrderValue: Number(formData.minOrderValue) || 0,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        usageLimit: Number(formData.usageLimit) || undefined,
        isActive: formData.isActive,
      };

      let res;
      if (editingCoupon) {
        res = await api.put(`/coupons/${editingCoupon._id}`, payload);
      } else {
        res = await api.post('/coupons', payload);
      }

      if (res.success) {
        setModalOpen(false);
        fetchCoupons();
      } else {
        setErrorMsg(res.message || 'Failed to save coupon.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.success) {
        fetchCoupons();
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Tag className="w-7 h-7 text-amber-600" />
            Promotional Coupons & Special Offers
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Configure percentage discounts, flat cashback tokens, minimum order limits, and seasonal campaign codes.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-900/20 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
            Loading promotional offers...
          </div>
        ) : (!coupons || coupons.length === 0) ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No coupons configured</h3>
            <p className="text-stone-500 text-xs mt-1">Create coupons to reward festive and bulk patrons.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Promo Code</th>
                  <th className="px-6 py-4">Discount Rate</th>
                  <th className="px-6 py-4">Min Spend</th>
                  <th className="px-6 py-4">Max Cap</th>
                  <th className="px-6 py-4">Redemptions</th>
                  <th className="px-6 py-4">Validity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                        {c.code}
                      </span>
                      <span className="text-[11px] text-stone-400 block mt-1">{c.description}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-900">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </td>
                    <td className="px-6 py-4 text-stone-700">
                      {formatPrice(c.minOrderValue || 0)}
                    </td>
                    <td className="px-6 py-4 text-stone-700">
                      {c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'No Cap'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-800">{c.usedCount || 0}</span>
                      <span className="text-stone-400 text-[11px]"> / {c.usageLimit || '∞'}</span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-stone-500">
                      Until {formatDate(c.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-amber-800 transition-colors"
                        title="Edit Coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.code)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Delete Coupon"
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

      {/* Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">
              {editingCoupon ? 'Edit Promo Coupon' : 'Create Promotional Coupon'}
            </h2>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    placeholder="e.g. DIWALI20"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Currency (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Description / Title</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  placeholder="e.g. 15% Festive Discount for Diwali Celebrations"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">End Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-stone-300 text-amber-600"
                  />
                  Coupon Active for Customer Storefront
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs shadow-md shadow-amber-900/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
