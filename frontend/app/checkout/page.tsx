'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Clock,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  Calendar,
  Info,
  Banknote,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Helper to get local date in YYYY-MM-DD
function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatCutoffLabel(value: number, unit: string) {
  const val = Math.max(0, Number(value) || 0);
  const u = String(unit || 'hours').toLowerCase();
  if (u.startsWith('sec') || u === 's') return `${val}s`;
  if (u.startsWith('min') || u === 'm') return `${val}m`;
  return `${val}h`;
}

function formatCutoffText(value: number, unit: string) {
  const val = Math.max(0, Number(value) || 0);
  const u = String(unit || 'hours').toLowerCase();
  if (u.startsWith('sec') || u === 's') return `${val} ${val === 1 ? 'second' : 'seconds'}`;
  if (u.startsWith('min') || u === 'm') return `${val} ${val === 1 ? 'minute' : 'minutes'}`;
  return `${val} ${val === 1 ? 'hour' : 'hours'}`;
}

// Helper to determine if a slot is available (accounting for capacity and dynamic cutoff for today)
function getSlotAvailability(
  slot: any,
  selectedDateStr: string,
  globalCutoff?: { value?: number; unit?: string }
): {
  isAvailable: boolean;
  isPastCutoff: boolean;
  isFullyBooked: boolean;
  statusLabel: string;
  badgeLabel: string;
  noticeText: string;
} {
  const isFullyBooked = Boolean(
    slot.isFullyBooked || (slot.availableCount !== undefined && slot.availableCount <= 0)
  );

  let isPastCutoff = Boolean(slot.isPastCutoff);

  // Determine effective cutoff rule for this slot
  const effectiveValue =
    slot.customCutoffValue != null
      ? Number(slot.customCutoffValue)
      : Number(globalCutoff?.value ?? 1);
  const effectiveUnit = slot.customCutoffUnit || globalCutoff?.unit || 'hours';

  const noticeText = formatCutoffText(effectiveValue, effectiveUnit);
  const badgeLabel = `Closed (<${formatCutoffLabel(effectiveValue, effectiveUnit)})`;

  // Client-side real-time calculation for today's date
  const todayStr = getLocalDateString(new Date());
  if (selectedDateStr === todayStr) {
    let slotStartTimeString = slot.startTime;
    if (!slotStartTimeString && slot.title) {
      const match = slot.title.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        slotStartTimeString = `${match[1].padStart(2, '0')}:${match[2]}`;
      }
    }

    if (slotStartTimeString) {
      const [sh, sm] = slotStartTimeString.split(':').map((v: string) => parseInt(v, 10));
      const now = new Date();
      const slotStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sh || 0, sm || 0, 0, 0);

      let bufferMs = effectiveValue * 60 * 60 * 1000;
      if (effectiveUnit.startsWith('sec') || effectiveUnit === 's') {
        bufferMs = effectiveValue * 1000;
      } else if (effectiveUnit.startsWith('min') || effectiveUnit === 'm') {
        bufferMs = effectiveValue * 60 * 1000;
      }

      const cutoffTime = new Date(slotStartTime.getTime() - bufferMs);

      if (now.getTime() >= cutoffTime.getTime()) {
        isPastCutoff = true;
      }
    }
  }

  const isAvailable = !isFullyBooked && !isPastCutoff;

  let statusLabel = 'Available';
  if (isPastCutoff) {
    statusLabel = slot.cutoffMessage || `Closed (Requires ${noticeText} notice)`;
  } else if (isFullyBooked) {
    statusLabel = 'Full';
  } else if (slot.availableCount !== undefined) {
    statusLabel = `${slot.availableCount} slots left`;
  }

  return { isAvailable, isPastCutoff, isFullyBooked, statusLabel, badgeLabel, noticeText };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, couponCode, couponDiscount, clearCart } = useCartStore();
  const { user, isAuthenticated, addresses, fetchAddresses } = useAuthStore();

  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'TAKEAWAY'>('DELIVERY');
  const [deliveryDate, setDeliveryDate] = useState(() => getLocalDateString(new Date()));
  const [deliverySlot, setDeliverySlot] = useState('');
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [cutoffMeta, setCutoffMeta] = useState<{
    globalCutoffValue?: number;
    globalCutoffUnit?: string;
    globalNoticeText?: string;
  }>({ globalCutoffValue: 1, globalCutoffUnit: 'hours', globalNoticeText: '1 hour' });

  // Customer Contact
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Shipping Address
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [houseOrFlat, setHouseOrFlat] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [state, setState] = useState('Rajasthan');
  const [pincode, setPincode] = useState('302001');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial user data populate
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
      fetchAddresses();
    }
  }, [isAuthenticated, user]);

  // Handle address auto-select
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def._id);
      setHouseOrFlat(def.houseOrFlat);
      setStreet(def.street);
      setLandmark(def.landmark || '');
      setCity(def.city);
      setState(def.state);
      setPincode(def.pincode);
    }
  }, [addresses]);

  // Fetch settings & delivery slots
  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  // If COD is disabled by admin in settings, ensure paymentMethod falls back to ONLINE
  useEffect(() => {
    if (settings && !settings.enableCashOnDelivery && paymentMethod === 'COD') {
      setPaymentMethod('ONLINE');
    }
  }, [settings, paymentMethod]);

  // Fetch Delivery Slots for selected date
  useEffect(() => {
    if (deliveryDate) {
      api
        .get(`/delivery-slots?date=${deliveryDate}&orderType=INSTANT`)
        .then((res) => {
          const slots = res.data || [];
          const resMeta = (res as any)?.meta;
          if (resMeta) {
            setCutoffMeta(resMeta);
          }
          setDeliverySlots(slots);
          const activeConfig = {
            value: resMeta?.globalCutoffValue ?? settings?.sameDaySlotCutoffValue ?? 1,
            unit: resMeta?.globalCutoffUnit || settings?.sameDaySlotCutoffUnit || 'hours',
          };
          if (slots.length > 0) {
            const firstAvailable = slots.find((s: any) => getSlotAvailability(s, deliveryDate, activeConfig).isAvailable);
            if (firstAvailable) {
              setDeliverySlot(firstAvailable.title);
            } else {
              setDeliverySlot('');
            }
          } else {
            setDeliverySlot('');
          }
        })
        .catch(() => {});
    }
  }, [deliveryDate, settings]);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Your Cart is Empty</h2>
        <p className="text-sm text-stone-500">Please add sweet delicacies before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase"
        >
          Explore Sweets
        </Link>
      </div>
    );
  }

  // User must be logged in to buy any item
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full gold-gradient mx-auto flex items-center justify-center text-white shadow-gold-md">
          <Sparkles className="w-8 h-8 text-amber-100" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block">Account Required</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-950">
            Sign In to Buy Your Delicacies
          </h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            For buying any item, you need to sign in to your Shree Mithai account to ensure seamless order fulfillment and delivery tracking.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-cream-50 border border-gold-200/80 text-left text-xs text-stone-600 space-y-2 max-w-sm mx-auto">
          <div className="flex items-center gap-2 text-stone-800 font-bold">
            <ShoppingBag className="w-4 h-4 text-gold-600" />
            <span>Items in your cart ({items.length}) are saved!</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Your cart total is <strong>{formatPrice(getSubtotal())}</strong>. Once you log in, your selected confections are waiting for you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:opacity-95"
          >
            Sign In to Buy
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-white border border-stone-300 text-stone-800 font-bold text-xs uppercase tracking-wider hover:bg-stone-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Authoritative preliminary estimate for client UI display
  const subtotal = getSubtotal();
  const freeThreshold = settings?.freeDeliveryThreshold || 799;
  const standardFee = settings?.standardDeliveryFee || 50;
  const deliveryFee = deliveryMethod === 'TAKEAWAY' || subtotal >= freeThreshold ? 0 : standardFee;
  const gstRate = settings?.gstRate || 5;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round((taxableAmount * gstRate) / 100);
  const grandTotal = taxableAmount + deliveryFee + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please sign in or register to complete your order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      setErrorMsg('Please complete all contact information.');
      return;
    }

    if (deliveryMethod === 'DELIVERY' && (!houseOrFlat || !street || !city || !pincode)) {
      setErrorMsg('Please complete the delivery address.');
      return;
    }

    const chosenSlotObj = deliverySlots.find((s) => s.title === deliverySlot);
    const activeCutoffConfig = {
      value: cutoffMeta.globalCutoffValue ?? settings?.sameDaySlotCutoffValue ?? 1,
      unit: cutoffMeta.globalCutoffUnit || settings?.sameDaySlotCutoffUnit || 'hours',
    };
    if (
      !deliverySlot ||
      (chosenSlotObj && !getSlotAvailability(chosenSlotObj, deliveryDate, activeCutoffConfig).isAvailable)
    ) {
      const notice = chosenSlotObj
        ? getSlotAvailability(chosenSlotObj, deliveryDate, activeCutoffConfig).noticeText
        : (cutoffMeta.globalNoticeText || formatCutoffText(activeCutoffConfig.value, activeCutoffConfig.unit));
      setErrorMsg(
        `The selected delivery slot is not available. Same-day instant orders require booking at least ${notice} in advance. Please select an available slot or switch to another date.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Create Instant Order on backend
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        deliveryMethod,
        deliveryDate,
        deliverySlot,
        couponCode: couponCode || undefined,
        paymentMethod,
        notes,
        shippingAddress: {
          recipientName: customerName,
          phone: customerPhone,
          houseOrFlat,
          street,
          landmark,
          city,
          state,
          pincode,
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantName: i.variantName,
          quantity: i.quantity,
        })),
      };

      const orderRes = await api.post('/orders', orderPayload);
      const createdOrder = orderRes.data;

      // If Cash Home Delivery (COD), order is confirmed without Razorpay
      if (paymentMethod === 'COD') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        clearCart();
        router.push(`/orders/${createdOrder._id}?autoDownload=1`);
        return;
      }

      // 2. Create Razorpay Payment Order on Backend (Online Payment)
      const rzpRes = await api.post('/payments/razorpay/create-order', {
        orderId: createdOrder._id,
        paymentType: 'FULL',
      });

      const { razorpayOrderId, amountInPaise, keyId } = rzpRes.data;

      // 3. Open Razorpay Modal
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: keyId,
          amount: amountInPaise,
          currency: 'INR',
          name: 'Shree Mithai & Royal Confectionery',
          description: `Order ${createdOrder.orderNumber}`,
          order_id: razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#B87F22',
          },
          handler: async (response: any) => {
            try {
              // Verify signature on backend
              await api.post('/payments/razorpay/verify', {
                orderId: createdOrder._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentType: 'FULL',
              });

              // Confetti celebration
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });

              clearCart();
              router.push(`/orders/${createdOrder._id}?autoDownload=1`);
            } catch (err: any) {
              alert(`Payment verification notice: ${err.message}`);
              clearCart();
              router.push(`/orders/${createdOrder._id}`);
            }
          },
          modal: {
            ondismiss: () => {
              clearCart();
              router.push(`/orders/${createdOrder._id}`);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback
        clearCart();
        router.push(`/orders/${createdOrder._id}?autoDownload=1`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please review your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-royal-950">
          Secure Instant Checkout
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Complete delivery address and payment to confirm your fresh sweet order.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Method Selector */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold-600" />
              <span>1. Delivery Method</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('DELIVERY')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                  deliveryMethod === 'DELIVERY'
                    ? 'border-gold-500 bg-gold-50/70 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <Truck className="w-5 h-5 text-gold-700" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Doorstep Express Delivery</h4>
                  <p className="text-[11px] text-stone-500">Delivered in temperature-controlled bag</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('TAKEAWAY')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                  deliveryMethod === 'TAKEAWAY'
                    ? 'border-gold-500 bg-gold-50/70 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <Store className="w-5 h-5 text-gold-700" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Store Pickup (Takeaway)</h4>
                  <p className="text-[11px] text-stone-500">Civil Lines Outlet &bull; Free</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Delivery Date & Time Slot */}
          {(() => {
            const todayDateStr = getLocalDateString(new Date());
            const isTodaySelected = deliveryDate === todayDateStr;
            const tomorrowDateStr = getLocalDateString(new Date(Date.now() + 86400000));
            const activeCutoffConfig = {
              value: cutoffMeta.globalCutoffValue ?? settings?.sameDaySlotCutoffValue ?? 1,
              unit: cutoffMeta.globalCutoffUnit || settings?.sameDaySlotCutoffUnit || 'hours',
            };
            const activeNoticeText = cutoffMeta.globalNoticeText || formatCutoffText(activeCutoffConfig.value, activeCutoffConfig.unit);

            const allTodaySlotsClosed =
              isTodaySelected &&
              deliverySlots.length > 0 &&
              deliverySlots.every((s) => !getSlotAvailability(s, deliveryDate, activeCutoffConfig).isAvailable);

            return (
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-3">
                  <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold-600" />
                    <span>2. Delivery Date & Time Slot</span>
                  </h2>
                  {isTodaySelected && (
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 inline-flex items-center gap-1 self-start sm:self-auto">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Same-day slots close {activeNoticeText} prior
                    </span>
                  )}
                </div>

                {/* Advisory Notice when Today is Selected */}
                {isTodaySelected && (
                  <div className="text-[11px] text-amber-900 bg-amber-50/80 p-3 rounded-2xl border border-amber-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      <strong className="font-semibold text-amber-950">Instant Kitchen Notice:</strong> Same-day delivery slots remain open only up to <strong>{activeNoticeText} before</strong> the slot starts. Slots within {activeNoticeText} or past their time are closed to guarantee freshly prepared sweets.
                    </p>
                  </div>
                )}

                {/* Alert when all slots for today are closed */}
                {isTodaySelected && allTodaySlotsClosed && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-rose-950">All delivery slots for today are now closed</h4>
                        <p className="text-xs text-rose-700 mt-0.5">
                          Same-day slots close {activeNoticeText} before start time. Please switch to tomorrow to select an available delivery slot.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeliveryDate(tomorrowDateStr)}
                      className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shrink-0 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Switch to Tomorrow
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                      Select Date *
                    </label>
                    <input
                      type="date"
                      min={todayDateStr}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                      Delivery Slot *
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      disabled={deliverySlots.length === 0 || allTodaySlotsClosed}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
                    >
                      {deliverySlots.length === 0 ? (
                        <option value="">No slots configured for this date</option>
                      ) : allTodaySlotsClosed ? (
                        <option value="">All today&apos;s slots closed (Please choose another date)</option>
                      ) : (
                        deliverySlots.map((s) => {
                          const { isAvailable, statusLabel } = getSlotAvailability(s, deliveryDate, activeCutoffConfig);
                          return (
                            <option
                              key={s.title}
                              value={s.title}
                              disabled={!isAvailable}
                            >
                              {s.title} — {statusLabel}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                </div>

                {/* Quick Visual Slot Cards */}
                {deliverySlots.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Time Slot Windows & Live Availability:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {deliverySlots.map((s) => {
                        const { isAvailable, isPastCutoff, isFullyBooked, badgeLabel } = getSlotAvailability(s, deliveryDate, activeCutoffConfig);
                        const isSelected = deliverySlot === s.title;

                        return (
                          <button
                            key={s.title}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setDeliverySlot(s.title)}
                            className={`p-3 rounded-2xl border text-left transition-all relative ${
                              isSelected
                                ? 'border-gold-500 bg-gold-50/80 shadow-sm ring-1 ring-gold-500'
                                : isAvailable
                                ? 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 cursor-pointer'
                                : 'border-stone-200/60 bg-stone-100/70 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isSelected
                                    ? 'text-royal-950'
                                    : isAvailable
                                    ? 'text-stone-800'
                                    : 'text-stone-400 line-through'
                                }`}
                              >
                                {s.startTime} - {s.endTime}
                              </span>
                              {isPastCutoff ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                  {badgeLabel}
                                </span>
                              ) : isFullyBooked ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                  Full
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  Open
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 truncate">
                              {s.title.split('(')[0].trim() || s.title}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 3. Customer Contact & Shipping Address */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-600" />
              <span>3. Contact & Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Phone (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            {deliveryMethod === 'DELIVERY' && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                      House / Flat / Villa No. *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 402, Royal Residency"
                      value={houseOrFlat}
                      onChange={(e) => setHouseOrFlat(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                      Street / Area *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Civil Lines, Main Boulevard"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                      Landmark
                    </label>
                    <input
                      type="text"
                      placeholder="Near Hotel Rajputana"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Order Notes / Special Delivery Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Ring the doorbell twice, pack with extra ice pack"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          {/* 4. Payment Option Selection */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-600" />
                <span>4. Payment Option</span>
              </h2>
              {settings?.enableCashOnDelivery ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  2 Options Available
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Online Payment Only
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: Pay Online via Razorpay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  paymentMethod === 'ONLINE'
                    ? 'border-gold-500 bg-gold-50/70 shadow-sm ring-1 ring-gold-500'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-amber-700" />
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                      paymentMethod === 'ONLINE'
                        ? 'border-gold-600 bg-gold-600'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {paymentMethod === 'ONLINE' && (
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                    )}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Pay Online (Razorpay)</h4>
                  <p className="text-[11px] text-stone-500 mt-1">
                    UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking
                  </p>
                  <span className="inline-block mt-2.5 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Instant & Contactless
                  </span>
                </div>
              </button>

              {/* Option 2: Cash Home Delivery (COD) */}
              {settings?.enableCashOnDelivery ? (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-gold-500 bg-gold-50/70 shadow-sm ring-1 ring-gold-500'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5 text-emerald-700" />
                    </div>
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                        paymentMethod === 'COD'
                          ? 'border-gold-600 bg-gold-600'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {paymentMethod === 'COD' && (
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                      )}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Cash Home Delivery</h4>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Pay cash to our delivery executive when your fresh sweet box arrives.
                    </p>
                    <span className="inline-block mt-2.5 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Cash on Delivery Available
                    </span>
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 text-left relative flex flex-col justify-between opacity-60">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5 text-stone-400" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-600">
                      Unavailable
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-500">Cash Home Delivery</h4>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Currently disabled by store management. Please select Pay Online.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Razorpay CTA */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-5 sticky top-24">
          <h3 className="font-serif font-bold text-lg text-stone-900 pb-2 border-b border-stone-100 flex items-center justify-between">
            <span>Your Order ({items.length})</span>
            <Link href="/cart" className="text-xs font-medium text-gold-700 hover:underline">
              Edit Cart
            </Link>
          </h3>

          {/* Mini Items list */}
          <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-stone-100 pr-1">
            {items.map((i) => (
              <div key={`${i.productId}-${i.variantName}`} className="py-1.5 flex justify-between text-xs">
                <span className="truncate max-w-[180px] text-stone-800">
                  {i.quantity}x {i.productName} {i.variantName ? `(${i.variantName})` : ''}
                </span>
                <span className="font-serif font-semibold text-royal-950">
                  {formatPrice(i.unitPrice * i.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="pt-3 border-t border-stone-200 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon ({couponCode}):</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Charges:</span>
              <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(deliveryFee)}</span>
            </div>

            <div className="flex justify-between">
              <span>GST Tax ({gstRate}%):</span>
              <span>{formatPrice(tax)}</span>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between font-serif font-bold text-lg text-royal-950">
              <span>Total Payable:</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase text-center block shadow-gold-sm hover:scale-[1.02] transition-transform disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? paymentMethod === 'COD'
                ? 'Confirming Cash Order...'
                : 'Securing Razorpay Gateway...'
              : paymentMethod === 'COD'
              ? `Place Cash Home Delivery Order (${formatPrice(grandTotal)})`
              : `Pay ${formatPrice(grandTotal)} via Razorpay`}
          </button>

          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {paymentMethod === 'COD'
                ? 'Verified Cash on Delivery with Safe Packaging'
                : '256-Bit Cryptographic Razorpay Verification'}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
