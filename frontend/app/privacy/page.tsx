import React from 'react';
import { Lock, ShieldCheck, Eye, FileCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Shree Mithai & Royal Confectionery',
  description: 'How Shree Mithai protects, collects, and respects customer information and order data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold tracking-wider uppercase mb-3">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            Data Protection & Privacy
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            Your privacy is of royal importance to us. Learn how we handle your personal data with utmost discretion.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-sm space-y-8 text-stone-700 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              1. Information We Collect
            </h2>
            <p>
              When you purchase our artisanal sweets or submit an advance event booking, we collect contact information (name, email address, phone number), delivery addresses, and order customization requests. We never sell, rent, or lease your private data to third-party data brokers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              2. How Your Information Is Used
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To confirm and prepare your orders and bespoke packaging.</li>
              <li>To dispatch delivery riders or logistics partners to your doorstep.</li>
              <li>To send order status updates, Razorpay invoices, and booking confirmations.</li>
              <li>To personalize your royal confection browsing experience and reward loyal patrons.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              3. Payment Security & Encryption
            </h2>
            <p>
              All online transactions are processed through encrypted channels backed by Razorpay. Card information, UPI tokens, and net banking credentials are authenticated directly with your financial institution and are never stored on Shree Mithai servers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              4. Cookies and Device Identifiers
            </h2>
            <p>
              We utilize minimal session cookies to remember your cart items, keep you safely authenticated, and ensure smooth checkout. You can adjust your browser settings to decline cookies, though some interactive features may not function properly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
