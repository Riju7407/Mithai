'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Truck,
  ArrowLeft,
  AlertCircle,
  FileText,
  Download,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice, formatDate, formatDateTime } from '../../../lib/utils';
import { generateOrderInvoicePDF } from '../../../lib/invoiceGenerator';

const INSTANT_TIMELINE_STEPS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Completed',
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [invoiceDownloadedNotice, setInvoiceDownloadedNotice] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Handle automatic invoice PDF download on initial landing from checkout
  useEffect(() => {
    if (!order) return;
    const shouldAutoDownload = searchParams?.get('autoDownload') === '1';
    if (shouldAutoDownload) {
      setIsGeneratingInvoice(true);
      generateOrderInvoicePDF(order, true)
        .then(() => {
          setInvoiceDownloadedNotice(true);
        })
        .catch((err) => console.error('Auto invoice error:', err))
        .finally(() => {
          setIsGeneratingInvoice(false);
          // Remove autoDownload query from URL quietly without reload
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('autoDownload');
            window.history.replaceState({}, '', url.toString());
          }
        });
    }
  }, [order, searchParams]);

  const handleDownloadInvoice = async () => {
    if (!order || isGeneratingInvoice) return;
    setIsGeneratingInvoice(true);
    try {
      await generateOrderInvoicePDF(order, true);
      setInvoiceDownloadedNotice(true);
    } catch (err) {
      console.error('Invoice generation error:', err);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="h-12 w-64 bg-stone-200 rounded-xl animate-pulse" />
        <div className="h-44 bg-stone-200 rounded-3xl animate-pulse" />
        <div className="h-64 bg-stone-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Order Not Found</h2>
        <Link
          href="/orders"
          className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = INSTANT_TIMELINE_STEPS.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="space-y-1">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-gold-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-950 flex items-center gap-3">
            <span>Order #{order.orderNumber}</span>
          </h1>
          <p className="text-xs text-stone-500">
            Placed on {formatDateTime(order.createdAt)} &bull; {order.deliveryMethod}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Tax Invoice PDF Button */}
          <button
            id="download-invoice-btn"
            onClick={handleDownloadInvoice}
            disabled={isGeneratingInvoice}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
            title="Download Official Royal Tax Invoice PDF"
          >
            {isGeneratingInvoice ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Invoice...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>Download Tax Invoice (PDF)</span>
              </>
            )}
          </button>

          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.orderStatus === 'Delivered' || order.orderStatus === 'Completed'
                ? 'bg-emerald-100 text-emerald-800'
                : order.orderStatus === 'Cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-gold-100 text-gold-900 animate-pulse'
            }`}
          >
            {order.orderStatus}
          </span>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              order.paymentStatus === 'Paid'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Invoice Downloaded Alert Banner */}
      {invoiceDownloadedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-900">Official Bill Invoice Downloaded Successfully!</p>
              <p className="text-emerald-700 mt-0.5">
                Your premium PDF tax invoice featuring the royal insignia, website watermark, and complete breakdown has been downloaded to your downloads folder.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadInvoice}
              disabled={isGeneratingInvoice}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline px-2 py-1"
            >
              Download Again
            </button>
            <button
              onClick={() => setInvoiceDownloadedNotice(false)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Visual Order Tracking Timeline */}
      {order.orderStatus !== 'Cancelled' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-gold-600" />
            <span>Live Kitchen & Delivery Tracking</span>
          </h2>

          {/* Stepper Timeline */}
          <div className="relative">
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 z-0" />
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
              {['Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Completed'].map(
                (stepName, idx) => {
                  const stepOrderIdx = INSTANT_TIMELINE_STEPS.indexOf(stepName);
                  const isDone = currentStepIndex >= stepOrderIdx;
                  const isCurrent = currentStepIndex === stepOrderIdx;

                  return (
                    <div key={stepName} className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow transition-all ${
                          isDone
                            ? 'gold-gradient text-royal-950 scale-105'
                            : 'bg-stone-100 text-stone-400 border border-stone-200'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-xs ${
                          isCurrent
                            ? 'font-bold text-royal-950'
                            : isDone
                            ? 'font-semibold text-stone-800'
                            : 'text-stone-400'
                        }`}
                      >
                        {stepName}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Timeline Event Log */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Activity Log
              </h4>
              <div className="space-y-1 text-xs text-stone-600">
                {order.statusHistory.map((h: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-stone-400 min-w-[130px] font-mono">
                      {formatDateTime(h.timestamp)}
                    </span>
                    <span className="font-semibold text-stone-800">[{h.status}]</span>
                    <span>{h.note || 'Status updated'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two Column Layout: Items & Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items List (2 cols) */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
            Delicacies Ordered ({order.items.length})
          </h3>

          <div className="divide-y divide-stone-100">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={item.productName}
                    className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{item.productName}</h4>
                    {item.variantName && (
                      <span className="text-xs text-gold-700 block">{item.variantName}</span>
                    )}
                    <span className="text-xs text-stone-400">
                      {item.quantity} x {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                </div>

                <span className="font-serif font-bold text-base text-royal-950">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs sm:text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.couponCode || 'Promo'}):</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charges:</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax:</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between font-serif font-bold text-lg text-royal-950">
              <span>Total Paid:</span>
              <span>{formatPrice(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details & Razorpay Ref */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-600" />
              <span>Delivery Details</span>
            </h3>

            <div className="space-y-2 text-xs text-stone-600">
              <p className="font-bold text-stone-900 text-sm">{order.shippingAddress?.recipientName || order.customerName}</p>
              <p>Phone: {order.shippingAddress?.phone || order.customerPhone}</p>
              <p>
                {order.shippingAddress?.houseOrFlat}, {order.shippingAddress?.street}
              </p>
              {order.shippingAddress?.landmark && <p>Near: {order.shippingAddress.landmark}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-1 text-xs">
              <span className="font-bold text-stone-700 uppercase tracking-wider block">
                Scheduled Slot:
              </span>
              <p className="text-gold-800 font-bold">{order.deliverySlot}</p>
              <p className="text-stone-400">Date: {formatDate(order.deliveryDate)}</p>
            </div>
          </div>

          {/* Payment Reference & Method */}
          <div className="bg-cream-50 p-5 rounded-3xl border border-gold-200 space-y-2 text-xs text-stone-600">
            <span className="font-bold uppercase tracking-wider text-royal-950 block">
              Payment Information
            </span>
            <div className="flex items-center gap-2">
              <span className="text-stone-500">Method:</span>
              <span className="font-bold text-stone-900">
                {order.paymentMethod === 'COD'
                  ? 'Cash Home Delivery (COD)'
                  : 'Online Payment (Razorpay)'}
              </span>
            </div>
            {order.paymentMethod === 'COD' ? (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <p className="font-bold">Cash to be collected upon delivery</p>
                <p>Please keep exact change of {formatPrice(order.grandTotal)} ready for our delivery executive.</p>
              </div>
            ) : order.razorpayPaymentId ? (
              <p>
                Razorpay ID:{' '}
                <strong className="font-mono text-stone-800">{order.razorpayPaymentId}</strong>
              </p>
            ) : (
              <p className="text-emerald-700 font-semibold">Payment Verified via Gateway</p>
            )}
            <p className="text-[11px] text-stone-500 pt-1">
              Your order is protected under Shree Mithai Freshness & Hygiene Guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
