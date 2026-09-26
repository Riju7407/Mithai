'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
  ExternalLink,
  Package,
  Award,
  Filter,
} from 'lucide-react';
import { api } from '../../../lib/api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'centuries_of_trust' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/reviews/admin?page=${page}&limit=15`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (activeTab === 'centuries_of_trust') {
        query += '&filter=centuries_of_trust';
      } else if (activeTab !== 'ALL') {
        query += `&status=${activeTab}`;
      }

      const res = await api.get(query);
      if (res.success) {
        setReviews(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalCount(res.meta.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, search]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setActionLoadingId(id);
      const res = await api.put(`/reviews/admin/${id}/status`, { status });
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status } : r))
        );
        setToastMsg(`Review marked as ${status}.`);
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update review status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleTrust = async (id: string, currentVal: boolean) => {
    try {
      setActionLoadingId(id);
      const newVal = !currentVal;
      const res = await api.put(`/reviews/admin/${id}/status`, {
        showInCenturiesOfTrust: newVal,
      });
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, showInCenturiesOfTrust: newVal } : r))
        );
        setToastMsg(
          newVal
            ? 'Review added to Homepage "Centuries of Trust" section!'
            : 'Review removed from "Centuries of Trust".'
        );
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update Centuries of Trust status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      setActionLoadingId(id);
      const res = await api.delete(`/reviews/admin/${id}`);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
        setToastMsg('Review deleted permanently.');
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete review.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            Customer Reviews &amp; Testimonials
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Moderate customer feedback, approve ratings, and curate reviews for the homepage &quot;Centuries of Trust&quot; section.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4 text-stone-400" />
          <span>View Homepage Testimonials</span>
        </Link>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-center gap-2 shadow-xs animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setActiveTab('ALL');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              All Reviews ({totalCount})
            </button>

            <button
              onClick={() => {
                setActiveTab('centuries_of_trust');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'centuries_of_trust'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-50 text-amber-800 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Centuries of Trust</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('APPROVED');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-50 text-emerald-800 hover:bg-stone-100'
              }`}
            >
              Approved
            </button>

            <button
              onClick={() => {
                setActiveTab('PENDING');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Pending
            </button>

            <button
              onClick={() => {
                setActiveTab('REJECTED');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'REJECTED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-50 text-rose-800 hover:bg-stone-100'
              }`}
            >
              Rejected
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviewer or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
            Loading customer reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Star className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif font-bold text-stone-800 text-sm">No reviews found</h3>
            <p className="text-stone-400 text-xs">
              No customer reviews matched your search or status filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 sm:p-6 hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-5"
              >
                {/* Left: Product & Review details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    {/* Product Image */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <img
                        src={
                          rev.product?.productImages?.[0]?.url ||
                          'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={rev.product?.productName || 'Delicacy'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <Link
                        href={`/products/${rev.product?.slug || ''}`}
                        target="_blank"
                        className="font-serif font-bold text-sm text-stone-900 hover:text-amber-700 transition-colors inline-flex items-center gap-1"
                      >
                        <span>{rev.product?.productName || 'Royal Confection'}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-stone-700">
                          {rev.reviewerName}
                        </span>
                        {rev.reviewerEmail && (
                          <span className="text-[11px] text-stone-400">
                            ({rev.reviewerEmail})
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full font-medium border border-emerald-200">
                          {rev.reviewerLocation || (rev.verifiedPurchase ? 'Verified Buyer' : 'Customer')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Content */}
                  <div className="space-y-1.5 pl-15">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-stone-700">{rev.rating} / 5</span>
                      <span className="text-stone-300">&bull;</span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {rev.title && (
                      <h4 className="font-serif font-bold text-sm text-stone-900">
                        {rev.title}
                      </h4>
                    )}

                    <p className="text-xs text-stone-600 leading-relaxed italic bg-stone-50 p-3 rounded-xl border border-stone-200/60 max-w-3xl">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>
                </div>

                {/* Right: Moderation Badges & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-2.5 shrink-0 pt-2 md:pt-0">
                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : rev.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {rev.status}
                    </span>

                    {rev.showInCenturiesOfTrust && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                        <Award className="w-3 h-3" />
                        Centuries of Trust
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Toggle Centuries of Trust */}
                    <button
                      type="button"
                      onClick={() => handleToggleTrust(rev._id, !!rev.showInCenturiesOfTrust)}
                      disabled={actionLoadingId === rev._id}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        rev.showInCenturiesOfTrust
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-amber-50 hover:text-amber-900'
                      }`}
                      title="Show in Homepage Centuries of Trust"
                    >
                      <Star className={`w-3.5 h-3.5 ${rev.showInCenturiesOfTrust ? 'fill-amber-500 text-amber-600' : 'text-stone-400'}`} />
                      <span>{rev.showInCenturiesOfTrust ? 'In Trust Section' : '+ Add to Trust'}</span>
                    </button>

                    {/* Approve / Reject */}
                    {rev.status !== 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rev._id, 'APPROVED')}
                        disabled={actionLoadingId === rev._id}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1"
                        title="Approve review"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {rev.status !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rev._id, 'REJECTED')}
                        disabled={actionLoadingId === rev._id}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1"
                        title="Reject review"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(rev._id)}
                      disabled={actionLoadingId === rev._id}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete review permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg border border-stone-200 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-stone-200 disabled:opacity-40"
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
