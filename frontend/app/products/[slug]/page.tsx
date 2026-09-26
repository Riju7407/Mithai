'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Calendar,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  Package,
  Layers,
  ChevronRight,
  ArrowRight,
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';
import { useCartStore } from '../../../store/cartStore';
import { useBookingStore } from '../../../store/bookingStore';
import { useAuthStore } from '../../../store/authStore';
import ProductCard from '../../../components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { addBookingItem } = useBookingStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedInstant, setAddedInstant] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>({
    averageRating: 5.0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const fetchReviews = (prodId: string) => {
    api
      .get(`/reviews/product/${prodId}`)
      .then((res) => {
        if (res.success && res.data) {
          setReviews(res.data.reviews || []);
          if (res.data.stats) setReviewStats(res.data.stats);
        }
      })
      .catch((err) => console.error('Failed to fetch reviews:', err));
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        const prod = res.data.product;
        setProduct(prod);
        setRelatedProducts(res.data.relatedProducts || []);
        if (prod.variants && prod.variants.length > 0) {
          const defaultVar = prod.variants.find((v: any) => v.isDefault) || prod.variants[0];
          setSelectedVariant(defaultVar);
        }
        if (prod?._id) fetchReviews(prod._id);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (user?.name && !reviewerName) {
      setReviewerName(user.name);
    }
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewErrorMsg('Please share a few words about your experience.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewErrorMsg('');
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
        reviewerName: reviewerName.trim() || user?.name || 'Connoisseur Patron',
      });

      if (res.success) {
        setReviewSuccessMsg('Your royal review has been submitted and published. Thank you!');
        setReviewComment('');
        setReviewTitle('');
        setShowReviewForm(false);
        fetchReviews(product._id);
        setTimeout(() => setReviewSuccessMsg(''), 5000);
      } else {
        setReviewErrorMsg(res.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      setReviewErrorMsg(err.message || 'Error submitting review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-stone-200 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-stone-200 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-stone-200 rounded animate-pulse" />
            <div className="h-8 w-40 bg-stone-200 rounded animate-pulse" />
            <div className="h-24 w-full bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Sweet Not Found</h2>
        <p className="text-sm text-stone-500">The product you are looking for may have been removed or updated.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.productImages && product.productImages.length > 0
    ? product.productImages
    : [{ url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80' }];

  const currentPrice = selectedVariant
    ? (selectedVariant.discountedPrice || selectedVariant.price)
    : product.finalPrice;

  const originalPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const hasDiscount = originalPrice > currentPrice;

  const handleAddToCart = () => {
    addItem(
      {
        productId: product._id,
        slug: product.slug,
        productName: product.productName,
        variantName: selectedVariant?.name,
        unit: selectedVariant?.unit || product.weightUnit,
        unitPrice: currentPrice,
        imageUrl: images[0]?.url,
        dietary: product.dietary,
        isSugarFree: product.isSugarFree,
        availableForInstant: product.availableForInstant,
        availableForAdvance: product.availableForAdvance,
        stockQuantity: product.stockQuantity,
      },
      quantity
    );

    setAddedInstant(true);
    setTimeout(() => setAddedInstant(false), 2000);
  };

  const handleStartAdvanceBookingWithThis = () => {
    addBookingItem({
      productId: product._id,
      productName: product.productName,
      unit: product.weightUnit || 'kg',
      quantity: 10, // recommended starting bulk quantity
      unitPrice: product.bulkPricingTiers?.[0]?.pricePerUnit || product.finalPrice,
      imageUrl: images[0]?.url,
    });
    router.push('/event-booking');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link href="/" className="hover:text-gold-700 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <Link href="/shop" className="hover:text-gold-700 transition-colors">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-gold-700 transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <span className="text-stone-900 font-bold truncate max-w-[200px]">{product.productName}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left Column: Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-md relative">
            <img
              src={images[activeImageIndex]?.url}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
            {product.dietary === 'VEG' && (
              <div className="absolute top-4 left-4 bg-white/95 p-1.5 rounded-lg shadow border border-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-600 block" title="100% Pure Vegetarian" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-gold-500 shadow-md scale-95' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 bg-gold-50 px-2.5 py-1 rounded-md border border-gold-200/60">
                {product.category?.name || 'Artisanal Confectionery'}
              </span>
              {product.isSugarFree && (
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Zero Added Sugar
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-royal-950">
              {product.productName}
            </h1>

            {/* Rating Stars & Count Link */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(reviewStats.averageRating || product.averageRating || 5)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-stone-800">
                {(reviewStats.averageRating || product.averageRating || 5.0).toFixed(1)}
              </span>
              <span className="text-stone-300">&bull;</span>
              <a href="#reviews-section" className="text-xs text-gold-700 hover:underline font-semibold">
                {reviewStats.totalReviews || reviews.length} Customer Reviews
              </a>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-cream-100/60 rounded-2xl border border-gold-200/50 flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-royal-950">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-stone-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-xs text-stone-500 font-medium">
              (Inclusive of all taxes &bull; Per {selectedVariant?.name || product.weightUnit})
            </span>
          </div>

          {/* Short / Long Description */}
          <p className="text-sm text-stone-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Select Box / Weight Size:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v: any) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariant(v)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col justify-between ${
                      selectedVariant?.name === v.name
                        ? 'border-gold-500 bg-gold-50/80 text-gold-950 shadow-sm'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="text-gold-700 text-sm mt-0.5 font-serif font-bold">
                      {formatPrice(v.discountedPrice || v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bulk Tiered Pricing Notice (for Event Bookings) */}
          {product.bulkPricingTiers && product.bulkPricingTiers.length > 0 && (
            <div className="p-4 rounded-2xl bg-royal-900 text-white space-y-2.5">
              <div className="flex items-center gap-2 text-gold-400 font-serif font-bold text-sm">
                <Calendar className="w-4 h-4" />
                <span>Bulk Tiered Event Pricing Available</span>
              </div>
              <p className="text-xs text-stone-300">
                Ordering for a wedding or corporate celebration? Unlock wholesale tiered pricing automatically:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                {product.bulkPricingTiers.map((tier: any, i: number) => (
                  <div key={i} className="bg-royal-950/70 p-2 rounded-lg border border-royal-700 text-center">
                    <span className="block font-bold text-gold-300">
                      {tier.minQty} - {tier.maxQty || '50+'} {tier.unit}
                    </span>
                    <span className="text-xs text-stone-200">
                      {formatPrice(tier.pricePerUnit)}/{tier.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2.5 hover:bg-stone-100 text-stone-600 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-2.5 hover:bg-stone-100 text-stone-600 font-bold"
                >
                  +
                </button>
              </div>

              {/* Instant Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.availableForInstant}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                  !product.availableForInstant
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : addedInstant
                    ? 'bg-emerald-600 text-white'
                    : 'gold-gradient text-royal-950 hover:opacity-95'
                }`}
              >
                {addedInstant ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : !product.availableForInstant ? (
                  <span>Advance Event Only</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Instant Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Advance Event Booking Button */}
            {product.availableForAdvance && (
              <button
                onClick={handleStartAdvanceBookingWithThis}
                className="w-full py-3 px-4 rounded-xl border-2 border-royal-900 text-royal-950 font-bold text-xs sm:text-sm hover:bg-royal-950 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-gold-600" />
                <span>Pre-Book Bulk for Weddings & Celebrations (30% Deposit)</span>
              </button>
            )}
          </div>

          {/* Product Specifications & Trust Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-600" />
              <span>Shelf Life: {product.shelfLife || '7-10 Days'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>100% Pure A2 Desi Cow Ghee</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gold-600" />
              <span>Tamper-Proof Luxury Packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Certified Master Halwai Craft</span>
            </div>
          </div>

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-stone-700 block mb-1.5 uppercase tracking-wider">
                Pure Ingredients:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.ingredients.map((ing: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-[11px]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* CUSTOMER REVIEWS & RATINGS SECTION                             */}
      {/* ============================================================== */}
      <section id="reviews-section" className="space-y-8 pt-10 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
              </span>
              <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">
                Patron Impressions
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-950">
              Connoisseur Reviews &amp; Ratings
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Verified testimonials and tasting impressions from our patrons.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-5 py-2.5 rounded-full gold-gradient text-royal-950 text-xs sm:text-sm font-bold shadow-gold-sm hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showReviewForm ? 'Close Review Form' : 'Write a Connoisseur Review'}</span>
          </button>
        </div>

        {/* Review Submission Success Banner */}
        {reviewSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-xs animate-in fade-in">
            <ThumbsUp className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{reviewSuccessMsg}</span>
          </div>
        )}

        {/* Review Form Drawer / Card */}
        {showReviewForm && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gold-300 shadow-gold-md animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-royal-950">
                Share Your Royal Experience
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Tell fellow connoisseurs about the richness, aroma, and delicate texture of this confection.
              </p>
            </div>

            {reviewErrorMsg && (
              <div className="p-3 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-burgundy-600 shrink-0" />
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Your Overall Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewRating(star)}
                      className="p-1 -m-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          star <= (hoverRating || reviewRating)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-xs sm:text-sm font-bold text-stone-700">
                    {(hoverRating || reviewRating) === 5 && 'Outstanding Royal Taste! ★★★★★'}
                    {(hoverRating || reviewRating) === 4 && 'Very Delicious & Fresh! ★★★★☆'}
                    {(hoverRating || reviewRating) === 3 && 'Good Confection ★★★☆☆'}
                    {(hoverRating || reviewRating) === 2 && 'Average Experience ★★☆☆☆'}
                    {(hoverRating || reviewRating) === 1 && 'Needs Improvement ★☆☆☆☆'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Maharani Gayatri / Ananya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Heavenly Desi Ghee Aroma & Melt-in-Mouth Texture"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Detailed Review *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the freshness, saffron fragrance, sweetness balance, packaging, and if your family enjoyed it..."
                  className="w-full p-4 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-xl gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rating Breakdown & Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-50/80 p-6 rounded-3xl border border-stone-200/80">
          {/* Average Score */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-stone-200">
            <span className="font-serif text-5xl font-bold text-royal-950">
              {(reviewStats.averageRating || product.averageRating || 5.0).toFixed(1)}
            </span>
            <div className="flex text-amber-400 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(reviewStats.averageRating || product.averageRating || 5)
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-stone-500">
              Based on {reviewStats.totalReviews || reviews.length} connoisseur reviews
            </p>
          </div>

          {/* Star Rating Distribution Bars */}
          <div className="md:col-span-2 flex flex-col justify-center space-y-1.5 px-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewStats.distribution?.[star] || (star === 5 ? (reviews.length || 1) : 0);
              const total = reviewStats.totalReviews || reviews.length || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={star} className="flex items-center gap-3 text-xs text-stone-600">
                  <span className="w-12 font-medium flex items-center gap-1">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[11px] text-stone-400 font-mono">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <Star className="w-10 h-10 text-stone-300 mx-auto" />
              <h4 className="font-serif font-bold text-stone-800 text-base">
                No customer reviews yet
              </h4>
              <p className="text-stone-500 text-xs max-w-sm mx-auto">
                Be the first royal patron to taste and review this handcrafted confection!
              </p>
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="inline-block mt-2 px-5 py-2 rounded-xl gold-gradient text-royal-950 font-bold text-xs shadow-gold-sm"
              >
                Write First Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {rev.title && (
                      <h4 className="font-serif font-bold text-stone-900 text-sm">
                        {rev.title}
                      </h4>
                    )}

                    <p className="text-xs text-stone-600 leading-relaxed italic">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                    <span className="font-bold text-stone-900">{rev.reviewerName}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                      ✓ {rev.reviewerLocation || (rev.verifiedPurchase ? 'Verified Buyer' : 'Patron')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-stone-200">
          <h2 className="font-serif text-2xl font-bold text-royal-950">
            You May Also Savor
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
