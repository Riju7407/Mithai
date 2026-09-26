import React from 'react';
import Link from 'next/link';
import { Calendar, Gift, Users, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Advance Event Booking Guide | Shree Mithai & Royal Confectionery',
  description: 'Everything you need to know about booking wholesale, wedding, and corporate bulk sweets with custom packaging.',
};

export default function EventBookingInfoPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            Artisanal Bulk Confectionery
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
            Advance Event Booking Guide
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            From intimate anniversary gatherings to grand destination weddings and multinational corporate Diwali gifting, here is how our advance booking program works.
          </p>
        </div>

        {/* 4 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {[
            {
              step: '01',
              title: 'Event Details',
              desc: 'Select your event date (minimum 3–10 days ahead), venue, and expected guest count.',
              icon: Calendar,
            },
            {
              step: '02',
              title: 'Artisanal Selection',
              desc: 'Choose from signature Kaju Katli, Motichoor Ladoos, Bengali Sandesh, and savory delights.',
              icon: Gift,
            },
            {
              step: '03',
              title: 'Bespoke Packaging',
              desc: 'Customize luxury packaging: Royal Velvet Boxes, Brass Thalis, or Custom Foil Gold Emblems.',
              icon: Sparkles,
            },
            {
              step: '04',
              title: 'Secure Deposit',
              desc: 'Pay a 30% advance deposit via Razorpay to reserve raw ingredients and production slots.',
              icon: ShieldCheck,
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
              <span className="text-4xl font-serif font-black text-amber-100 group-hover:text-amber-200 transition-colors absolute top-4 right-4">
                {item.step}
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-800 mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg mb-2">{item.title}</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Wholesale Tiering & Benefits */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-8 sm:p-12 mb-16 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl">
            <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2 block">Wholesale Rate Transparency</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
              Wholesale Pricing That Honors Scale
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mb-6 leading-relaxed">
              We reward celebration hosts and corporate procurement teams with tiered discounts starting from orders as small as 5 Kilograms.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-amber-300 font-bold block text-sm">1–5 Kg</span>
                <span className="text-xs text-stone-300">Standard Rate</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-amber-300 font-bold block text-sm">6–15 Kg</span>
                <span className="text-xs text-stone-300">5% Advantage</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-amber-300 font-bold block text-sm">16–50 Kg</span>
                <span className="text-xs text-stone-300">10% Advantage</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-amber-300 font-bold block text-sm">50+ Kg</span>
                <span className="text-xs text-stone-300">Bespoke Contract</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/event-booking"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium shadow-lg shadow-amber-900/20 hover:scale-[1.02] transition-all"
          >
            Launch Advance Event Booking Wizard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
