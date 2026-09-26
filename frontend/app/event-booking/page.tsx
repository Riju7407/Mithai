'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  Package,
  Gift,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AdvanceEventBookingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    step,
    setStep,
    eventType,
    eventName,
    eventDate,
    numberOfGuests,
    deliveryDate,
    deliverySlot,
    contactNumber,
    customerName,
    customerEmail,
    deliveryAddress,
    packagingOptionId,
    packagingOptionName,
    packagingExtraPrice,
    customRequirements,
    specialInstructions,
    customMessage,
    paymentPreference,
    selectedItems,
    updateBookingData,
    addBookingItem,
    updateBookingItemQty,
    removeBookingItem,
    resetBooking,
  } = useBookingStore();

  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-populate customer contact if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      updateBookingData({
        customerName: customerName || user.name,
        customerEmail: customerEmail || user.email,
        contactNumber: contactNumber || user.phone || '',
      });
    }
  }, [isAuthenticated, user]);

  // Load auxiliary data: event types, packaging options, settings, products
  useEffect(() => {
    Promise.all([
      api.get('/event-types').catch(() => ({ data: [] })),
      api.get('/packaging-options').catch(() => ({ data: [] })),
      api.get('/settings').catch(() => ({ data: null })),
      api.get('/products?availableForAdvance=true&limit=50').catch(() => ({ data: [] })),
    ]).then(([eventsRes, pkgRes, setRes, prodRes]) => {
      setEventTypes(eventsRes.data || []);
      setPackagingOptions(pkgRes.data || []);
      setSettings(setRes.data || {});
      setAvailableProducts(prodRes.data || []);

      if (pkgRes.data && pkgRes.data.length > 0 && !packagingOptionId) {
        const def = pkgRes.data.find((p: any) => p.isDefault) || pkgRes.data[0];
        updateBookingData({
          packagingOptionId: def._id,
          packagingOptionName: def.name,
          packagingExtraPrice: def.extraPrice,
        });
      }
    });
  }, []);

  // Fetch Delivery Slots with capacity whenever deliveryDate changes
  useEffect(() => {
    if (deliveryDate) {
      api
        .get(`/delivery-slots?date=${deliveryDate}&orderType=ADVANCE_BOOKING`)
        .then((res) => {
          setDeliverySlots(res.data || []);
          if (res.data && res.data.length > 0 && !deliverySlot) {
            setDeliverySlots(res.data);
            const firstAvailable = res.data.find((s: any) => !s.isFullyBooked) || res.data[0];
            updateBookingData({ deliverySlot: firstAvailable.title });
          }
        })
        .catch((err) => console.error(err));
    }
  }, [deliveryDate]);

  // Min and max date calculation based on restaurant settings
  const minDays = settings?.minAdvanceBookingDays || 3;
  const maxDays = settings?.maxAdvanceBookingDays || 90;

  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() + minDays);
  const minDateStr = minDateObj.toISOString().split('T')[0];

  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + maxDays);
  const maxDateStr = maxDateObj.toISOString().split('T')[0];

  // Price calculations
  const itemsSubtotal = selectedItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const packagingTotal = packagingExtraPrice;
  const gstRate = settings?.gstRate || 5;
  const tax = Math.round(((itemsSubtotal + packagingTotal) * gstRate) / 100);
  const grandTotal = itemsSubtotal + packagingTotal + tax;
  const depositPercentage = settings?.advanceDepositPercentage || 30;
  const depositAmount = Math.round((grandTotal * depositPercentage) / 100);
  const balanceDue = grandTotal - depositAmount;

  // Step 1 Validation
  const validateStep1 = () => {
    if (!eventName.trim()) {
      setErrorMsg('Please specify an event name.');
      return false;
    }
    if (!eventDate) {
      setErrorMsg('Please select an event date.');
      return false;
    }
    if (numberOfGuests < 10) {
      setErrorMsg('Advance catering requires a minimum of 10 guests.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (selectedItems.length === 0) {
      setErrorMsg('Please select at least one sweet or savory product for your event.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Step 3 Validation (Packaging)
  const validateStep3 = () => {
    setErrorMsg('');
    return true;
  };

  // Step 4 Validation (Delivery & Contact)
  const validateStep4 = () => {
    if (!deliveryDate) {
      setErrorMsg('Please select a delivery date.');
      return false;
    }
    if (deliveryDate < minDateStr) {
      setErrorMsg(`Delivery date must be at least ${minDays} days in advance (${minDateStr}).`);
      return false;
    }
    if (!deliverySlot) {
      setErrorMsg('Please select a delivery slot.');
      return false;
    }
    if (!customerName.trim() || !customerEmail.trim() || !contactNumber.trim()) {
      setErrorMsg('Please provide your full contact name, email, and phone number.');
      return false;
    }
    if (
      !deliveryAddress.houseOrFlat.trim() ||
      !deliveryAddress.street.trim() ||
      !deliveryAddress.city.trim() ||
      !deliveryAddress.pincode.trim()
    ) {
      setErrorMsg('Please complete all delivery address fields.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Submission handler
  const handleFinalSubmit = async () => {
    if (!isAuthenticated) {
      alert('Please sign in or register before confirming your advance event booking.');
      router.push('/login?redirect=/event-booking');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Create Advance Booking on Backend
      const bookingPayload = {
        customerName,
        customerEmail,
        customerPhone: contactNumber,
        eventType,
        eventName,
        eventDate,
        numberOfGuests,
        deliveryDate,
        deliverySlot,
        deliveryAddress,
        contactNumber,
        packagingOptionId,
        customRequirements,
        specialInstructions,
        customMessage,
        paymentPreference,
        items: selectedItems.map((item) => ({
          productId: item.productId,
          unit: item.unit,
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/bookings', bookingPayload);
      const createdBooking = res.data;

      // 2. Create Razorpay Order
      const rzpOrderRes = await api.post('/payments/razorpay/create-order', {
        bookingId: createdBooking._id,
        paymentType: paymentPreference, // 'DEPOSIT' (30%) or 'FULL' (100%)
      });

      const { razorpayOrderId, amountInPaise, keyId } = rzpOrderRes.data;

      // 3. Launch Razorpay Checkout Modal
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: keyId,
          amount: amountInPaise,
          currency: 'INR',
          name: 'Shree Mithai & Royal Confectionery',
          description: `Advance Booking Deposit for ${createdBooking.bookingNumber}`,
          order_id: razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: contactNumber,
          },
          theme: {
            color: '#B87F22',
          },
          handler: async (response: any) => {
            try {
              // Verify Signature on backend
              await api.post('/payments/razorpay/verify', {
                bookingId: createdBooking._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentType: paymentPreference,
              });

              resetBooking();
              router.push(`/account/bookings?autoDownload=${createdBooking._id}`);
            } catch (vErr: any) {
              alert(`Payment verification notice: ${vErr.message}`);
              router.push(`/account/bookings`);
            }
          },
          modal: {
            ondismiss: () => {
              // Redirect to user's bookings where balance/deposit can still be paid
              router.push(`/account/bookings`);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback if Razorpay script didn't load
        alert('Booking created successfully! Redirecting to your bookings dashboard.');
        resetBooking();
        router.push(`/account/bookings?autoDownload=${createdBooking._id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit advance event booking. Please check your data.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Wizard Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-wider border border-gold-300">
          <Calendar className="w-3.5 h-3.5 text-gold-600" />
          <span>Advance Event & Bulk Catering</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-950">
          Reserve Royal Sweets for Your Event
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Schedule wedding sweet boxes, festive bulk platters, and corporate hampers. Secure your production slot with only 30% advance deposit.
        </p>
      </div>

      {/* 5-Step Visual Stepper Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-stone-500 overflow-x-auto gap-2 pb-1">
          {[
            { num: 1, label: 'Event Details', icon: Calendar },
            { num: 2, label: 'Select Sweets', icon: Package },
            { num: 3, label: 'Packaging', icon: Gift },
            { num: 4, label: 'Delivery & Venue', icon: MapPin },
            { num: 5, label: 'Review & Deposit', icon: CreditCard },
          ].map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-gold-500 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-stone-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent
                      ? 'bg-white text-gold-900 font-bold'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {isCompleted ? '✓' : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Wizard Step Forms */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm">
        {/* STEP 1: Event Information */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-serif font-bold text-xl text-royal-950 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-600" />
              <span>Step 1: Event & Celebration Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Event / Celebration Type *
                </label>
                <select
                  value={eventType}
                  onChange={(e) => updateBookingData({ eventType: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer font-medium"
                >
                  {eventTypes.length > 0
                    ? eventTypes.map((t) => (
                        <option key={t._id} value={t.name}>
                          {t.name}
                        </option>
                      ))
                    : [
                        'Wedding Celebration',
                        'Anniversary Celebration',
                        'Birthday Gala',
                        'Corporate Event',
                        'Festival Gathering',
                        'Religious & Pooja Occasion',
                        'Other Celebration',
                      ].map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Celebration Name / Monogram *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verma & Singhal Wedding Reception"
                  value={eventName}
                  onChange={(e) => updateBookingData({ eventName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Event Date *
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  max={maxDateStr}
                  value={eventDate}
                  onChange={(e) => updateBookingData({ eventDate: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Earliest date allowed: {minDateStr} (Requires {minDays} days advance prep)
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Expected Number of Guests *
                </label>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  value={numberOfGuests}
                  onChange={(e) =>
                    updateBookingData({ numberOfGuests: parseInt(e.target.value, 10) || 10 })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Minimum 10 guests for advance event catering.
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="px-8 py-3 rounded-full gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase shadow-gold-sm hover:opacity-95 flex items-center gap-2"
              >
                <span>Continue to Select Sweets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Sweets & Bulk Quantities */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-serif font-bold text-xl text-royal-950 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-gold-600" />
              <span>Step 2: Select Royal Sweets & Bulk Quantities</span>
            </h2>

            {/* Currently Selected Items list */}
            {selectedItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-cream-50 border border-gold-200/70 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-royal-950">
                  Your Event Sweet Selections ({selectedItems.length}):
                </h4>
                <div className="divide-y divide-stone-200">
                  {selectedItems.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between gap-4">
                      <div>
                        <h5 className="font-bold text-sm text-stone-900">{item.productName}</h5>
                        <span className="text-xs text-stone-500">
                          {formatPrice(item.unitPrice)} per {item.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() =>
                              updateBookingItemQty(item.productId, Math.max(1, item.quantity - 5))
                            }
                            className="px-2 py-1 text-xs hover:bg-stone-100 text-stone-600"
                          >
                            -5
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-900">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => updateBookingItemQty(item.productId, item.quantity + 5)}
                            className="px-2 py-1 text-xs hover:bg-stone-100 text-stone-600"
                          >
                            +5
                          </button>
                        </div>

                        <span className="font-serif font-bold text-sm text-royal-950 min-w-[70px] text-right">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>

                        <button
                          onClick={() => removeBookingItem(item.productId)}
                          className="text-stone-400 hover:text-red-600 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gold-200 flex justify-between text-sm font-bold text-royal-950">
                  <span>Selected Sweets Subtotal:</span>
                  <span className="font-serif">{formatPrice(itemsSubtotal)}</span>
                </div>
              </div>
            )}

            {/* Catalog of Sweets to Add */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                Available Delicacies for Event Catering:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableProducts.map((prod) => {
                  const isSelected = selectedItems.some((i) => i.productId === prod._id);
                  const bulkRate = prod.bulkPricingTiers?.[0]?.pricePerUnit || prod.finalPrice;

                  return (
                    <div
                      key={prod._id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-gold-500 bg-gold-50/50 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-gold-300'
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={
                            prod.productImages[0]?.url ||
                            'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={prod.productName}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {prod.productName}
                          </h5>
                          <span className="text-xs font-serif font-bold text-gold-700 block">
                            {formatPrice(bulkRate)} / {prod.weightUnit}
                          </span>
                          <span className="text-[10px] text-stone-400">Wholesale bulk tier rate</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                        {isSelected ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Added
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              addBookingItem({
                                productId: prod._id,
                                productName: prod.productName,
                                unit: prod.weightUnit,
                                quantity: 10, // default 10 units for event
                                unitPrice: bulkRate,
                                imageUrl: prod.productImages[0]?.url,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg gold-gradient text-royal-950 font-bold text-xs shadow-sm hover:opacity-95"
                          >
                            + Add (10 {prod.weightUnit})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-full border border-stone-300 text-stone-700 font-semibold text-xs uppercase"
              >
                Back
              </button>

              <button
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="px-8 py-3 rounded-full gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase shadow-gold-sm hover:opacity-95 flex items-center gap-2"
              >
                <span>Continue to Packaging</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Packaging & Presentation */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-serif font-bold text-xl text-royal-950 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold-600" />
              <span>Step 3: Royal Packaging & Bespoke Customizations</span>
            </h2>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Choose Packaging Style:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packagingOptions.map((opt) => {
                  const isSelected = packagingOptionId === opt._id;
                  return (
                    <div
                      key={opt._id}
                      onClick={() =>
                        updateBookingData({
                          packagingOptionId: opt._id,
                          packagingOptionName: opt.name,
                          packagingExtraPrice: opt.extraPrice,
                        })
                      }
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-gold-500 bg-gold-50/70 shadow-md'
                          : 'border-stone-200 bg-white hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-serif font-bold text-base text-stone-900">{opt.name}</h4>
                        <span className="text-xs font-bold text-gold-700 bg-gold-100 px-2 py-0.5 rounded-full">
                          {opt.extraPrice === 0 ? 'Included' : `+${formatPrice(opt.extraPrice)}`}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">{opt.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Monogram & Message */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Custom Calligraphy Gift Tag / Bride & Groom Message
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. With Warm Compliments from the Singhal & Verma Families"
                  value={customMessage}
                  onChange={(e) => updateBookingData({ customMessage: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Special Kitchen / Dietary Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Ensure gold foil is strictly vegetarian; separate sugar-free boxes with green ribbon"
                  value={specialInstructions}
                  onChange={(e) => updateBookingData({ specialInstructions: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full border border-stone-300 text-stone-700 font-semibold text-xs uppercase"
              >
                Back
              </button>

              <button
                onClick={() => {
                  if (validateStep3()) setStep(4);
                }}
                className="px-8 py-3 rounded-full gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase shadow-gold-sm hover:opacity-95 flex items-center gap-2"
              >
                <span>Continue to Delivery & Venue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Delivery & Venue Address */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-serif font-bold text-xl text-royal-950 pb-2 border-b border-stone-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-600" />
              <span>Step 4: Delivery Schedule & Banquet / Venue Address</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Scheduled Delivery Date *
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  max={maxDateStr}
                  value={deliveryDate}
                  onChange={(e) => updateBookingData({ deliveryDate: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Delivery Time Slot *
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => updateBookingData({ deliverySlot: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer font-medium"
                >
                  {deliverySlots.map((slot) => (
                    <option
                      key={slot.title}
                      value={slot.title}
                      disabled={slot.isFullyBooked}
                    >
                      {slot.title} {slot.isFullyBooked ? '(FULL)' : `(${slot.availableCount || slot.maxCapacity} slots free)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Coordinator Contact Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => updateBookingData({ customerName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Coordinator Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactNumber}
                  onChange={(e) => updateBookingData({ contactNumber: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Venue / Banquet Hall / House Address *
                </label>
                <input
                  type="text"
                  placeholder="Grand Ballroom, Rambagh Palace Hotel"
                  value={deliveryAddress.houseOrFlat}
                  onChange={(e) =>
                    updateBookingData({
                      deliveryAddress: { ...deliveryAddress, houseOrFlat: e.target.value },
                    })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Street / Area / Landmark *
                </label>
                <input
                  type="text"
                  placeholder="Bhawani Singh Road"
                  value={deliveryAddress.street}
                  onChange={(e) =>
                    updateBookingData({
                      deliveryAddress: { ...deliveryAddress, street: e.target.value },
                    })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) =>
                      updateBookingData({
                        deliveryAddress: { ...deliveryAddress, city: e.target.value },
                      })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={deliveryAddress.pincode}
                    onChange={(e) =>
                      updateBookingData({
                        deliveryAddress: { ...deliveryAddress, pincode: e.target.value },
                      })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-full border border-stone-300 text-stone-700 font-semibold text-xs uppercase"
              >
                Back
              </button>

              <button
                onClick={() => {
                  if (validateStep4()) setStep(5);
                }}
                className="px-8 py-3 rounded-full gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase shadow-gold-sm hover:opacity-95 flex items-center gap-2"
              >
                <span>Continue to Summary & Deposit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Payment Options (Deposit vs Full) */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-serif font-bold text-xl text-royal-950 pb-2 border-b border-stone-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold-600" />
              <span>Step 5: Review Booking & Secure Deposit via Razorpay</span>
            </h2>

            {/* Event Summary Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-cream-50 rounded-2xl border border-gold-200">
              <div className="space-y-1.5 text-xs text-stone-600">
                <span className="font-bold uppercase text-gold-800 tracking-wider block">
                  Event & Venue:
                </span>
                <p className="font-bold text-stone-900 text-sm">{eventName}</p>
                <p>Type: {eventType} &bull; Guests: {numberOfGuests}</p>
                <p>Delivery: {deliveryDate} ({deliverySlot})</p>
                <p className="truncate">Venue: {deliveryAddress.houseOrFlat}, {deliveryAddress.street}, {deliveryAddress.city}</p>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <span className="font-bold uppercase text-gold-800 tracking-wider block">
                  Packaging & Customization:
                </span>
                <p className="font-bold text-stone-900 text-sm">{packagingOptionName}</p>
                {customMessage && <p className="italic">"{customMessage}"</p>}
                <p>Coordinator: {customerName} ({contactNumber})</p>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Total Sweets Amount ({selectedItems.length} items):</span>
                <span>{formatPrice(itemsSubtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Packaging Upgrade:</span>
                <span>{formatPrice(packagingTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST ({gstRate}%):</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-base text-royal-950 font-serif">
                <span>Grand Total:</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Preference Selector: DEPOSIT (30%) vs FULL (100%) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Select Your Payment Option:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 30% Advance Deposit */}
                <div
                  onClick={() => updateBookingData({ paymentPreference: 'DEPOSIT' })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentPreference === 'DEPOSIT'
                      ? 'border-gold-500 bg-gold-50/70 shadow-md'
                      : 'border-stone-200 bg-white hover:border-stone-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-base text-stone-900">
                        Pay 30% Advance Deposit Now
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Reserves kitchen slot and locks raw material ingredients. Pay the remaining 70% balance prior to event delivery.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gold-200/50 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-stone-500 block">Due Now:</span>
                      <span className="font-serif text-2xl font-bold text-royal-950">
                        {formatPrice(depositAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-stone-500 block">Balance Due Later:</span>
                      <span className="text-xs font-bold text-stone-700">{formatPrice(balanceDue)}</span>
                    </div>
                  </div>
                </div>

                {/* 100% Full Payment */}
                <div
                  onClick={() => updateBookingData({ paymentPreference: 'FULL' })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentPreference === 'FULL'
                      ? 'border-gold-500 bg-gold-50/70 shadow-md'
                      : 'border-stone-200 bg-white hover:border-stone-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-base text-stone-900">
                        Pay 100% Full Payment
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Complete payment in full today. No balance due on delivery day.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-stone-500 block">Due Now:</span>
                      <span className="font-serif text-2xl font-bold text-royal-950">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-stone-500 block">Balance Due:</span>
                      <span className="text-xs font-bold text-emerald-700">₹0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Razorpay Trust Callout */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3 text-xs text-stone-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Processed securely via <strong>Razorpay 256-Bit Encryption</strong>. Supports UPI (Google Pay, PhonePe, Paytm), NetBanking, Credit and Debit Cards.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(4)}
                disabled={submitting}
                className="px-6 py-2.5 rounded-full border border-stone-300 text-stone-700 font-semibold text-xs uppercase"
              >
                Back
              </button>

              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="px-8 py-3.5 rounded-full gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase shadow-gold-md hover:scale-105 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <span>Initiating Razorpay...</span>
                ) : (
                  <>
                    <span>Confirm & Pay {formatPrice(paymentPreference === 'DEPOSIT' ? depositAmount : grandTotal)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
