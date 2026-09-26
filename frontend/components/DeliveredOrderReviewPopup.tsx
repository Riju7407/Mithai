'use client';

import React, { useEffect, useState } from 'react';
import { Star, X, CheckCircle2, Gift, Send, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function DeliveredOrderReviewPopup() {
  const { user, isAuthenticated } = useAuthStore();
  const [pendingData, setPendingData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Check backend for delivered order with unreviewed items
    const checkPendingReview = async () => {
      try {
        const res = await api.get('/reviews/pending-order-review');
        if (res.success && res.data?.hasPending && res.data?.order && res.data?.item) {
          const orderId = res.data.order._id;
          // Check if manually dismissed in this browser
          const dismissed = localStorage.getItem(`dismissed_review_order_${orderId}`);
          if (!dismissed) {
            setPendingData(res.data);
            setIsOpen(true);
          }
        }
      } catch (err) {
        // Silently handle if user is guest or endpoint is unavailable
      }
    };

    const timer = setTimeout(checkPendingReview, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  const handleManualDismiss = () => {
    if (pendingData?.order?._id) {
      localStorage.setItem(`dismissed_review_order_${pendingData.order._id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please share a few words about your experience with this item.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await api.post('/reviews', {
        productId: pendingData.item.productId,
        orderId: pendingData.order._id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        reviewerName: user?.name || 'Verified Patron',
        reviewerLocation: 'Delivered Order Customer',
      });

      if (res.success) {
        setSubmitted(true);
        if (pendingData?.order?._id) {
          localStorage.setItem(`dismissed_review_order_${pendingData.order._id}`, 'true');
        }
        setTimeout(() => {
          setIsOpen(false);
        }, 2200);
      } else {
        setErrorMsg(res.message || 'Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !pendingData) return null;

  const item = pendingData.item;
  const order = pendingData.order;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-950/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-gold-300 shadow-2xl shadow-gold-950/30 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Top Gold Shimmer Ribbon */}
        <div className="h-2 gold-gradient w-full" />

        {/* Close Button ("cut the user manually") */}
        <button
          type="button"
          onClick={handleManualDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
          aria-label="Close review popup"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-royal-950">
              Thank You for Your Royal Review!
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto">
              Your feedback honors our master halwais and guides fellow connoisseurs across the realm.
            </p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Gift className="w-4 h-4 text-amber-700" />
                </span>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Order Delivered
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-royal-950">
                Your Royal Sweets Have Arrived!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Order #{order.orderNumber} was recently delivered. How was your tasting experience?
              </p>
            </div>

            {/* Delivered Product Card Preview */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-amber-200">
                <img
                  src={
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-serif font-bold text-sm text-stone-900 truncate">
                  {item.productName}
                </h4>
                {item.variantName && (
                  <span className="text-[11px] text-stone-500 block truncate">
                    {item.variantName}
                  </span>
                )}
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200">
                  ✓ Delivered &amp; Ready for Review
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Interactive Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div className="text-center py-1">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Rate Your Experience
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 -m-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="block mt-1.5 text-xs font-bold text-amber-800">
                  {(hoverRating || rating) === 5 && 'Outstanding Royal Taste! ★★★★★'}
                  {(hoverRating || rating) === 4 && 'Delicious & Fresh! ★★★★☆'}
                  {(hoverRating || rating) === 3 && 'Good Confection ★★★☆☆'}
                  {(hoverRating || rating) === 2 && 'Average Experience ★★☆☆☆'}
                  {(hoverRating || rating) === 1 && 'Needs Improvement ★☆☆☆☆'}
                </span>
              </div>

              {/* Title input */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Review title (e.g. Melt-in-mouth richness, fresh packaging!)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Detailed review textarea */}
              <div>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on the aroma, sweetness balance, packaging, and family enjoyment..."
                  className="w-full p-3.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleManualDismiss}
                  className="text-xs text-stone-400 hover:text-stone-700 underline order-2 sm:order-1"
                >
                  Remind me later
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-gold-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Royal Review'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
