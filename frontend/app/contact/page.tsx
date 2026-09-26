'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2, Send } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-950">
          Contact Customer Concierge
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Have an inquiry regarding wedding sweet assortments, bulk delivery, or instant orders? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Contact Info Card */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif font-bold text-xl text-royal-950">
            Heritage Flagship Store
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-stone-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 font-serif text-sm">Main Confectionery & Kitchen:</strong>
                <span>Heritage Grand Boulevard, Civil Lines, Jaipur, Rajasthan &mdash; 302001</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gold-600 shrink-0" />
              <div>
                <strong className="block text-stone-900 font-serif text-sm">Direct Hotline:</strong>
                <span>+91 98765 43210 / +91 98765 00001</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gold-600 shrink-0" />
              <div>
                <strong className="block text-stone-900 font-serif text-sm">Concierge Email:</strong>
                <span>care@shreemithai.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900 font-serif text-sm">Operating Hours:</strong>
                <span>Monday &ndash; Sunday: 08:00 AM &ndash; 10:00 PM</span>
                <span className="block text-[11px] text-stone-400">Advance order consultations open daily</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <h2 className="font-serif font-bold text-xl text-royal-950">
            Send an Inquiry
          </h2>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-base">Inquiry Received</h4>
              <p className="text-xs">Our royal sweets concierge will reach out to you within 2 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ananya Sharma"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ananya@example.com"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Inquiry Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about your event, wedding date, or order requirements..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl gold-gradient text-royal-950 font-bold uppercase tracking-wider text-xs shadow-gold-sm hover:opacity-95 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
