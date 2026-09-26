import React from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Cancellation & Refund Policy | Shree Mithai & Royal Confectionery',
  description: 'Cancellation and refund terms for instant food orders and advance bulk event bookings.',
};

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-semibold tracking-wider uppercase mb-3">
            <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
            Cancellations & Refunds
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
            Cancellation & Refund Policy
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            Transparent and fair guidelines regarding order modifications, cancellations, and refunds.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-sm space-y-8 text-stone-700 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              1. Instant Orders (Same-Day / Standard Delivery)
            </h2>
            <p>
              Due to the perishable nature of fresh milk sweets, kaju sweets, and warm savories:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600">
              <li>Orders can only be cancelled within <strong>10 minutes</strong> of placing them, provided the kitchen has not begun preparation.</li>
              <li>Once an order is marked as <em>Preparing</em> or <em>Out for Delivery</em>, cancellation and refunds cannot be granted.</li>
              <li>In the rare event of transit damage or missing items, contact our team with photos within 2 hours of delivery for a replacement or store credit.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              2. Advance Event Bookings (Weddings, Bulk Celebrations)
            </h2>
            <p>
              Advance bookings involve procurement of premium dry fruits, saffron, and custom handcrafted packaging:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="block font-semibold text-emerald-900 text-sm">15+ Days Before Event</span>
                <p className="text-xs text-emerald-700 mt-1">Full refund of deposit minus a 5% administrative charge.</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="block font-semibold text-amber-900 text-sm">7–14 Days Before Event</span>
                <p className="text-xs text-amber-700 mt-1">50% refund of the advance deposit. Remaining balance waived.</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="block font-semibold text-rose-900 text-sm">Under 7 Days</span>
                <p className="text-xs text-rose-700 mt-1">Non-refundable as custom packaging & ingredient procurement are finalized.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
              3. Refund Processing
            </h2>
            <p>
              Approved refunds are credited back to the original payment source (Credit/Debit Card, UPI, Netbanking) via Razorpay within <strong>5–7 business days</strong> depending on your bank&apos;s settlement cycle.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              4. How to Request Support
            </h2>
            <p>
              To initiate a cancellation or refund inquiry, email <strong className="text-stone-900">support@shreemithai.com</strong> with your Order Number (e.g. <code>ORD-2026-000001</code>) or Booking Number (<code>EVT-2026-000001</code>).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
