import React from 'react';
import { Truck, Clock, MapPin, PackageCheck, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Delivery Policy | Shree Mithai & Royal Confectionery',
  description: 'Delivery standards, temperature-controlled packaging, and slot coverage across the city.',
};

export default function DeliveryPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold tracking-wider uppercase mb-3">
            <Truck className="w-3.5 h-3.5 text-blue-700" />
            Safe & Timely Logistics
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
            Delivery & Shipping Policy
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            Delivering royal sweetness in pristine condition with food-grade temperature stabilization and scheduled delivery slots.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-sm space-y-8 text-stone-700 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              1. Delivery Methods & Timeframes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <h3 className="font-semibold text-stone-900 mb-1">Instant Same-Day Delivery</h3>
                <p className="text-xs text-stone-600">Dispatched within 45–90 minutes for orders placed before 7:00 PM within our primary city delivery zone.</p>
              </div>
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <h3 className="font-semibold text-stone-900 mb-1">Advance Event Scheduled Delivery</h3>
                <p className="text-xs text-stone-600">Delivered on your chosen celebration date within your booked time slot via dedicated temperature-controlled vans.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              2. Packaging & Freshness Assurance
            </h2>
            <p>
              All confections are packaged in food-grade, airtight tamper-evident gold boxes with protective butter-paper liners and moisture-lock barriers to ensure pure ghee sweets retain their crisp texture and intoxicating cardamom aroma.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              3. Delivery Charges
            </h2>
            <p>
              Standard city delivery is <strong>₹60</strong>. Orders of ₹499 or more qualify for <strong>FREE DELIVERY</strong>. Outstation bulk shipments for destination weddings are billed at actual logistics carrier rates.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              4. Unattended Deliveries
            </h2>
            <p>
              Due to temperature sensitivity and freshness protocols, our delivery partners cannot leave packages unattended at doorsteps. Please ensure someone is present at the recipient address during the chosen time slot.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
