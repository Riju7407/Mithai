import React from 'react';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | Shree Mithai & Royal Confectionery',
  description: 'Terms of service and purchasing conditions for Shree Mithai & Royal Confectionery.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            Legal & Governance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            Please read these terms carefully before placing instant confectionery orders or scheduling bespoke advance event bookings with Shree Mithai.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-sm space-y-8 text-stone-700 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing our website, creating an account, placing instant orders, or reserving advance celebration bookings, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you disagree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              2. Product Freshness & Artisanal Variations
            </h2>
            <p>
              All our sweets, savories, and confectionery delicacies are freshly prepared using traditional artisanal recipes and 100% pure desi ghee, natural saffron, and premium dry fruits. Because our delicacies are hand-crafted without chemical preservatives, natural variances in shape, color saturation, and decorative silver vark may occur.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              3. Instant Order Placement & Fulfillment
            </h2>
            <p>
              Instant orders are prepared and dispatched based on immediate shelf stock availability. Customers are required to provide accurate delivery addresses and contact information. Once dispatched, instant orders cannot be cancelled due to the perishable nature of fresh sweets.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              4. Advance Event Booking Rules & Payments
            </h2>
            <p>
              Advance event bookings (Weddings, Anniversaries, Corporate Galas) require a minimum advance notice of 3 to 10 days depending on guest count and packaging customizations. A non-refundable 30% advance deposit or 100% full payment is required to lock in production schedule and reserve raw ingredients. Any pending balance must be cleared prior to dispatch.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              5. Razorpay Payments & Security
            </h2>
            <p>
              Online payments are processed securely through RBI-compliant payment gateway Razorpay using 256-bit SSL encryption. Shree Mithai does not store credit/debit card numbers or CVVs on its servers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              6. Contact & Grievance Officer
            </h2>
            <p>
              For legal inquiries or dispute resolution, contact our grievance team at <strong className="text-stone-900">legal@shreemithai.com</strong> or call us directly at <strong className="text-stone-900">+91 (0) 44 2827 4567</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
