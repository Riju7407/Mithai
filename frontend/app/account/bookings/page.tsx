'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/utils';
import { useAuthStore } from '../../../store/authStore';
import { generateBookingInvoicePDF } from '../../../lib/invoiceGenerator';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CustomerBookingsContent() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [downloadingBookingId, setDownloadingBookingId] = useState<string | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    api
      .get('/bookings')
      .then((res) => setBookings(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle automatic download when arriving from /event-booking
  useEffect(() => {
    if (!bookings || bookings.length === 0) return;
    const autoDownloadId = searchParams?.get('autoDownload');
    if (autoDownloadId) {
      const target = bookings.find(
        (b) => b._id === autoDownloadId || b.bookingNumber === autoDownloadId
      );
      if (target) {
        setDownloadingBookingId(target._id);
        generateBookingInvoicePDF(target, true)
          .then(() => {
            setBookingNotice(
              `Event Bill #${target.bookingNumber} downloaded successfully!`
            );
          })
          .catch((err) => console.error(err))
          .finally(() => {
            setDownloadingBookingId(null);
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.delete('autoDownload');
              window.history.replaceState({}, '', url.toString());
            }
          });
      }
    }
  }, [bookings, searchParams]);

  const handleDownloadInvoice = async (booking: any) => {
    if (downloadingBookingId) return;
    setDownloadingBookingId(booking._id);
    try {
      await generateBookingInvoicePDF(booking, true);
      setBookingNotice(`Official Booking Bill #${booking.bookingNumber} downloaded.`);
    } catch (err) {
      console.error('Failed to download booking invoice:', err);
    } finally {
      setDownloadingBookingId(null);
    }
  };

  const handlePayRemainingBalance = async (booking: any) => {
    setPayingBookingId(booking._id);

    try {
      // 1. Create Razorpay order for BALANCE payment
      const rzpRes = await api.post('/payments/razorpay/create-order', {
        bookingId: booking._id,
        paymentType: 'BALANCE',
      });

      const { razorpayOrderId, amountInPaise, keyId } = rzpRes.data;

      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: keyId,
          amount: amountInPaise,
          currency: 'INR',
          name: 'Shree Mithai & Royal Confectionery',
          description: `Remaining Balance for ${booking.bookingNumber}`,
          order_id: razorpayOrderId,
          prefill: {
            name: booking.customerName,
            email: booking.customerEmail,
            contact: booking.contactNumber,
          },
          theme: {
            color: '#B87F22',
          },
          handler: async (response: any) => {
            try {
              await api.post('/payments/razorpay/verify', {
                bookingId: booking._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentType: 'BALANCE',
              });

              confetti({ particleCount: 80, spread: 60 });
              const updated = {
                ...booking,
                paymentStatus: 'Paid',
                advanceAmountPaid: booking.totalAmount,
                balanceAmountDue: 0,
              };
              await generateBookingInvoicePDF(updated, true);
              setBookingNotice(`Remaining balance cleared! Fully settled Bill #${booking.bookingNumber} downloaded.`);
              fetchBookings();
            } catch (err: any) {
              alert(`Verification notice: ${err.message}`);
              fetchBookings();
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      alert(`Payment error: ${err.message}`);
    } finally {
      setPayingBookingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-40 bg-stone-200/60 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Sign in to view bookings</h2>
        <Link
          href="/login?redirect=/account/bookings"
          className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-950">
            Advance Event Bookings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your wedding, anniversary, and corporate event bulk confectionery orders.
          </p>
        </div>
        <Link
          href="/event-booking"
          className="px-4 py-2 rounded-xl gold-gradient text-royal-950 font-bold text-xs shadow-sm hover:opacity-95"
        >
          + Plan New Event
        </Link>
      </div>

      {/* Download Alert Notice */}
      {bookingNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-900">{bookingNotice}</p>
              <p className="text-emerald-700 mt-0.5">
                The royal advance event booking bill has been generated with complete guest, venue, and sweet package details.
              </p>
            </div>
          </div>
          <button
            onClick={() => setBookingNotice(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream-100 mx-auto flex items-center justify-center">
            <Calendar className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">No event bookings yet</h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            Reserve fresh sweet hampers and wholesale tiered quantities for your upcoming celebrations.
          </p>
          <Link
            href="/event-booking"
            className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase shadow"
          >
            Start Event Planning
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-sm space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <span className="font-mono text-xs font-bold text-gold-700 block">
                    {booking.bookingNumber}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-royal-950">
                    {booking.eventName}
                  </h3>
                  <span className="text-xs text-stone-500">
                    {booking.eventType} &bull; {booking.numberOfGuests} Guests &bull; Delivery on{' '}
                    <strong>{formatDate(booking.deliveryDate)}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Download Bill PDF Button */}
                  <button
                    onClick={() => handleDownloadInvoice(booking)}
                    disabled={downloadingBookingId === booking._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full gold-gradient text-royal-950 font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
                    title="Download Advance Event Booking Bill PDF"
                  >
                    {downloadingBookingId === booking._id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Download Bill (PDF)</span>
                      </>
                    )}
                  </button>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      booking.bookingStatus === 'Fulfilled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : booking.bookingStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gold-100 text-gold-900 animate-pulse'
                    }`}
                  >
                    {booking.bookingStatus}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      booking.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {booking.paymentStatus === 'Paid' ? 'Fully Paid' : 'Deposit Confirmed (Partial)'}
                  </span>
                </div>
              </div>

              {/* Items & Packaging */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-stone-700 uppercase tracking-wider block">
                    Sweets Reserved:
                  </span>
                  <ul className="space-y-1 text-stone-600">
                    {booking.items.map((it: any, idx: number) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          {it.quantity} {it.unit} x {it.productName}
                        </span>
                        <span className="font-bold font-serif">{formatPrice(it.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5 text-stone-600">
                  <span className="font-bold text-stone-700 uppercase tracking-wider block">
                    Packaging & Venue Details:
                  </span>
                  <p>Style: <strong className="text-stone-900">{booking.packaging?.optionName}</strong></p>
                  <p>Slot: {booking.deliverySlot}</p>
                  <p className="truncate">
                    Venue: {booking.deliveryAddress?.houseOrFlat}, {booking.deliveryAddress?.street}
                  </p>
                  {booking.customMessage && (
                    <p className="italic text-stone-500">Tag: "{booking.customMessage}"</p>
                  )}
                </div>
              </div>

              {/* Payment Settlement Card & Remaining Balance Action */}
              <div className="p-4 rounded-2xl bg-cream-50 border border-gold-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-xs text-stone-600 w-full sm:w-auto">
                  <div className="flex gap-4">
                    <span>Total Amount: <strong className="font-serif font-bold text-stone-900">{formatPrice(booking.totalAmount)}</strong></span>
                    <span>Advance Paid: <strong className="text-emerald-700 font-bold">{formatPrice(booking.advanceAmountPaid)}</strong></span>
                    <span>Remaining Balance: <strong className="text-amber-800 font-bold">{formatPrice(booking.balanceAmountDue)}</strong></span>
                  </div>
                </div>

                {/* Pay Remaining Balance Button */}
                {booking.balanceAmountDue > 0 && booking.bookingStatus !== 'Cancelled' ? (
                  <button
                    onClick={() => handlePayRemainingBalance(booking)}
                    disabled={payingBookingId === booking._id}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-opacity shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Remaining Balance ({formatPrice(booking.balanceAmountDue)})</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payment Fully Settled</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomerBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CustomerBookingsContent />
    </Suspense>
  );
}

