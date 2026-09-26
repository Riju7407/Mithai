'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from 'lucide-react';
import { api } from '../lib/api';

const DEFAULT_FOOTER = {
  footerBrandName: 'Shree Mithai',
  footerAboutText:
    'Honoring centuries-old royal halwai recipes since 1952. Crafted exclusively with certified A2 Desi Cow Ghee, organic raw sugars, and handpicked dry fruits for discerning palates and grand celebrations.',
  footerPhone: '+91 98765 43210',
  footerEmail: 'care@shreemithai.com',
  footerAddress: 'Heritage Grand Boulevard, Civil Lines, Jaipur',
  footerOpeningHours: 'Mon - Sun: 09:00 AM - 10:30 PM',
  footerGheeBadge: '100% Pure Desi Ghee',
  footerFssaiBadge: 'FSSAI Certified',
  footerCopyrightText: 'Shree Mithai & Royal Confectionery. All rights reserved.',
  footerPaymentSecurity: 'Secured with 256-Bit SSL & Razorpay',
  footerPaymentMethods: 'UPI • Cards • NetBanking',
  socialInstagram: 'https://instagram.com/shreemithai',
  socialFacebook: 'https://facebook.com/shreemithai',
  socialTwitter: 'https://twitter.com/shreemithai',
  socialYoutube: 'https://youtube.com/@shreemithai',
};

export default function Footer() {
  const [footerData, setFooterData] = useState(DEFAULT_FOOTER);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function fetchFooterSettings() {
      try {
        const res = await api.get('/settings');
        if (res.success && res.data) {
          setFooterData((prev) => ({
            ...prev,
            footerBrandName: res.data.footerBrandName || prev.footerBrandName,
            footerAboutText: res.data.footerAboutText || prev.footerAboutText,
            footerPhone: res.data.footerPhone || res.data.contactPhone || prev.footerPhone,
            footerEmail: res.data.footerEmail || res.data.contactEmail || prev.footerEmail,
            footerAddress: res.data.footerAddress || res.data.address || prev.footerAddress,
            footerOpeningHours: res.data.footerOpeningHours || prev.footerOpeningHours,
            footerGheeBadge: res.data.footerGheeBadge || prev.footerGheeBadge,
            footerFssaiBadge: res.data.footerFssaiBadge || prev.footerFssaiBadge,
            footerCopyrightText: res.data.footerCopyrightText || prev.footerCopyrightText,
            footerPaymentSecurity: res.data.footerPaymentSecurity || prev.footerPaymentSecurity,
            footerPaymentMethods: res.data.footerPaymentMethods || prev.footerPaymentMethods,
            socialInstagram: res.data.socialInstagram || prev.socialInstagram,
            socialFacebook: res.data.socialFacebook || prev.socialFacebook,
            socialTwitter: res.data.socialTwitter || prev.socialTwitter,
            socialYoutube: res.data.socialYoutube || prev.socialYoutube,
          }));
        }
      } catch (err) {
        // Graceful fallback to default values on error/offline
      }
    }
    fetchFooterSettings();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-royal-950 text-stone-300 pt-16 pb-8 border-t-2 border-gold-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-royal-800">
          {/* Col 1 & 2: Brand Heritage */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 text-amber-100" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                {footerData.footerBrandName}
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              {footerData.footerAboutText}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gold-400">
              {footerData.footerGheeBadge && (
                <span className="flex items-center gap-1.5 bg-royal-900/80 px-3 py-1.5 rounded-full border border-royal-700/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {footerData.footerGheeBadge}
                </span>
              )}
              {footerData.footerFssaiBadge && (
                <span className="flex items-center gap-1.5 bg-royal-900/80 px-3 py-1.5 rounded-full border border-royal-700/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {footerData.footerFssaiBadge}
                </span>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {footerData.socialInstagram && (
                <a
                  href={footerData.socialInstagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-royal-900 hover:bg-gold-500 hover:text-royal-950 flex items-center justify-center text-stone-300 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {footerData.socialFacebook && (
                <a
                  href={footerData.socialFacebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-royal-900 hover:bg-gold-500 hover:text-royal-950 flex items-center justify-center text-stone-300 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {footerData.socialTwitter && (
                <a
                  href={footerData.socialTwitter}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-royal-900 hover:bg-gold-500 hover:text-royal-950 flex items-center justify-center text-stone-300 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {footerData.socialYoutube && (
                <a
                  href={footerData.socialYoutube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-royal-900 hover:bg-gold-500 hover:text-royal-950 flex items-center justify-center text-stone-300 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-white tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/shop" className="hover:text-gold-400 transition-colors">
                  Shop Fresh Sweets
                </Link>
              </li>
              <li>
                <Link href="/restaurant" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <span>Restaurant Food & Dining</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-gold-500/20 text-gold-300 rounded font-semibold">Hot</span>
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-gold-400 transition-colors">
                  Sweet Categories
                </Link>
              </li>
              <li>
                <Link href="/event-booking" className="hover:text-gold-400 transition-colors">
                  Advance Event Booking
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-gold-400 transition-colors">
                  Offers & Gift Hampers
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-400 transition-colors">
                  Our 70-Year Heritage
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Policies & Info */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-white tracking-wide">
              Policies & Help
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link
                  href="/event-booking-information"
                  className="hover:text-gold-400 transition-colors"
                >
                  Event Catering Guide
                </Link>
              </li>
              <li>
                <Link href="/delivery-policy" className="hover:text-gold-400 transition-colors">
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cancellation-policy"
                  className="hover:text-gold-400 transition-colors"
                >
                  Cancellation & Refund
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-white tracking-wide">
              Contact & Updates
            </h3>
            <div className="space-y-2 text-xs text-stone-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-400" />
                <span>{footerData.footerPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-400" />
                <span>{footerData.footerEmail}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <span>{footerData.footerAddress}</span>
              </p>
              {footerData.footerOpeningHours && (
                <p className="flex items-center gap-2 text-[11px] text-stone-400 pt-1">
                  <Clock className="w-3.5 h-3.5 text-gold-400" />
                  <span>{footerData.footerOpeningHours}</span>
                </p>
              )}
            </div>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <label htmlFor="newsletter-email" className="text-xs text-stone-300 font-medium block">
                Receive festive offers & new seasonal arrivals:
              </label>
              {subscribed ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 p-2 rounded-lg border border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Subscribed! Welcome to the royal family.</span>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-royal-900 border border-royal-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg gold-gradient text-royal-950 font-bold text-xs shrink-0 shadow hover:opacity-90"
                  >
                    Join
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Security */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} {footerData.footerCopyrightText}</p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-stone-300">{footerData.footerPaymentSecurity}</span>
            <div className="flex items-center gap-1.5 text-stone-300 font-mono text-[10px] bg-royal-900 px-2 py-1 rounded border border-royal-800">
              {footerData.footerPaymentMethods}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
