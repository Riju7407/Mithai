'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  CreditCard,
  Building,
} from 'lucide-react';
import { api } from '../../../lib/api';

const DEFAULT_FOOTER_VALUES = {
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

export default function AdminFooterManagementPage() {
  const [formData, setFormData] = useState<any>(DEFAULT_FOOTER_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.success && res.data) {
          setFormData({
            footerBrandName: res.data.footerBrandName || DEFAULT_FOOTER_VALUES.footerBrandName,
            footerAboutText: res.data.footerAboutText || DEFAULT_FOOTER_VALUES.footerAboutText,
            footerPhone: res.data.footerPhone || res.data.contactPhone || DEFAULT_FOOTER_VALUES.footerPhone,
            footerEmail: res.data.footerEmail || res.data.contactEmail || DEFAULT_FOOTER_VALUES.footerEmail,
            footerAddress: res.data.footerAddress || res.data.address || DEFAULT_FOOTER_VALUES.footerAddress,
            footerOpeningHours: res.data.footerOpeningHours || DEFAULT_FOOTER_VALUES.footerOpeningHours,
            footerGheeBadge: res.data.footerGheeBadge || DEFAULT_FOOTER_VALUES.footerGheeBadge,
            footerFssaiBadge: res.data.footerFssaiBadge || DEFAULT_FOOTER_VALUES.footerFssaiBadge,
            footerCopyrightText: res.data.footerCopyrightText || DEFAULT_FOOTER_VALUES.footerCopyrightText,
            footerPaymentSecurity: res.data.footerPaymentSecurity || DEFAULT_FOOTER_VALUES.footerPaymentSecurity,
            footerPaymentMethods: res.data.footerPaymentMethods || DEFAULT_FOOTER_VALUES.footerPaymentMethods,
            socialInstagram: res.data.socialInstagram || DEFAULT_FOOTER_VALUES.socialInstagram,
            socialFacebook: res.data.socialFacebook || DEFAULT_FOOTER_VALUES.socialFacebook,
            socialTwitter: res.data.socialTwitter || DEFAULT_FOOTER_VALUES.socialTwitter,
            socialYoutube: res.data.socialYoutube || DEFAULT_FOOTER_VALUES.socialYoutube,
          });
        }
      } catch (err: any) {
        console.error('Failed to load footer settings:', err);
        setErrorMsg('Failed to load existing footer settings. Showing defaults.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.put('/settings', formData);
      if (res.success) {
        setSuccessMsg('Footer settings saved and published to the live storefront successfully!');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      console.error('Failed to update footer settings:', err);
      setErrorMsg(err.message || 'Failed to update footer settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset footer settings to the royal defaults?')) {
      setFormData(DEFAULT_FOOTER_VALUES);
      setSuccessMsg('Reset to defaults. Remember to click "Save Changes" to publish.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-stone-500 font-serif text-sm">
        <Sparkles className="w-5 h-5 text-amber-500 animate-spin mr-3" />
        Loading Footer Management Studio...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Storefront Appearance & Heritage</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Footer Management Studio
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Configure contact info, heritage storytelling, trust certifications, social media links, and copyright notices shown at the bottom of every page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs font-medium transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-medium transition-all shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Storefront
          </a>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Brand & Heritage */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-stone-900 text-base">Brand Heritage & About</h2>
                <p className="text-xs text-stone-500">The royal halwai narrative and trust badges</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Brand Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.footerBrandName}
                  onChange={(e) => setFormData({ ...formData, footerBrandName: e.target.value })}
                  placeholder="Shree Mithai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Heritage Story & Tagline *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.footerAboutText}
                  onChange={(e) => setFormData({ ...formData, footerAboutText: e.target.value })}
                  placeholder="Describe your brand heritage, ingredients, and traditions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Trust Badge 1
                  </label>
                  <input
                    type="text"
                    value={formData.footerGheeBadge}
                    onChange={(e) => setFormData({ ...formData, footerGheeBadge: e.target.value })}
                    placeholder="100% Pure Desi Ghee"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Trust Badge 2
                  </label>
                  <input
                    type="text"
                    value={formData.footerFssaiBadge}
                    onChange={(e) => setFormData({ ...formData, footerFssaiBadge: e.target.value })}
                    placeholder="FSSAI Certified"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Contact Information & Hours */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-stone-900 text-base">Direct Customer Inquiries</h2>
                <p className="text-xs text-stone-500">Helpline, support email, and boutique showroom location</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    Helpline Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.footerPhone}
                    onChange={(e) => setFormData({ ...formData, footerPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    Support Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.footerEmail}
                    onChange={(e) => setFormData({ ...formData, footerEmail: e.target.value })}
                    placeholder="care@shreemithai.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  Flagship Store / Kitchen Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.footerAddress}
                  onChange={(e) => setFormData({ ...formData, footerAddress: e.target.value })}
                  placeholder="Heritage Grand Boulevard, Civil Lines, Jaipur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                ></textarea>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Store Opening Hours
                </label>
                <input
                  type="text"
                  value={formData.footerOpeningHours}
                  onChange={(e) => setFormData({ ...formData, footerOpeningHours: e.target.value })}
                  placeholder="Mon - Sun: 09:00 AM - 10:30 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Social Media Channels */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-stone-900 text-base">Social Media Channels</h2>
                <p className="text-xs text-stone-500">Official brand accounts for patrons to follow</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={formData.socialInstagram}
                  onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
                  placeholder="https://instagram.com/shreemithai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={formData.socialFacebook}
                  onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })}
                  placeholder="https://facebook.com/shreemithai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-500" />
                  Twitter / X URL
                </label>
                <input
                  type="url"
                  value={formData.socialTwitter}
                  onChange={(e) => setFormData({ ...formData, socialTwitter: e.target.value })}
                  placeholder="https://twitter.com/shreemithai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-600" />
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={formData.socialYoutube}
                  onChange={(e) => setFormData({ ...formData, socialYoutube: e.target.value })}
                  placeholder="https://youtube.com/@shreemithai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Legal, Copyright & Payment Badges */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-stone-900 text-base">Copyright & Payment Security</h2>
                <p className="text-xs text-stone-500">Legal statements and gateway encryption disclosures</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Copyright Notice Line
                </label>
                <input
                  type="text"
                  value={formData.footerCopyrightText}
                  onChange={(e) => setFormData({ ...formData, footerCopyrightText: e.target.value })}
                  placeholder="Shree Mithai & Royal Confectionery. All rights reserved."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Security Disclaimer
                  </label>
                  <input
                    type="text"
                    value={formData.footerPaymentSecurity}
                    onChange={(e) => setFormData({ ...formData, footerPaymentSecurity: e.target.value })}
                    placeholder="Secured with 256-Bit SSL & Razorpay"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Accepted Payment Methods
                  </label>
                  <input
                    type="text"
                    value={formData.footerPaymentMethods}
                    onChange={(e) => setFormData({ ...formData, footerPaymentMethods: e.target.value })}
                    placeholder="UPI • Cards • NetBanking"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Visual Preview Container */}
        <div className="bg-stone-900 text-stone-200 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <span className="text-xs font-serif font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Live Storefront Footer Preview
            </span>
            <span className="text-[11px] text-stone-400 bg-stone-800 px-2.5 py-1 rounded-full">
              Real-time rendering
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-base text-amber-400">
                {formData.footerBrandName || 'Shree Mithai'}
              </h3>
              <p className="text-stone-400 text-xs leading-relaxed">
                {formData.footerAboutText}
              </p>
              <div className="flex gap-2 pt-1">
                {formData.footerGheeBadge && (
                  <span className="px-2.5 py-1 rounded-full bg-stone-800 text-amber-300 text-[10px] border border-amber-600/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {formData.footerGheeBadge}
                  </span>
                )}
                {formData.footerFssaiBadge && (
                  <span className="px-2.5 py-1 rounded-full bg-stone-800 text-amber-300 text-[10px] border border-amber-600/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {formData.footerFssaiBadge}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-white text-xs uppercase tracking-wider">
                Direct Contact
              </h4>
              <p className="flex items-center gap-2 text-stone-300">
                <Phone className="w-3 h-3 text-amber-400" />
                <span>{formData.footerPhone}</span>
              </p>
              <p className="flex items-center gap-2 text-stone-300">
                <Mail className="w-3 h-3 text-amber-400" />
                <span>{formData.footerEmail}</span>
              </p>
              <p className="flex items-start gap-2 text-stone-300">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <span>{formData.footerAddress}</span>
              </p>
              {formData.footerOpeningHours && (
                <p className="flex items-center gap-2 text-stone-400 text-[11px] pt-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{formData.footerOpeningHours}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-white text-xs uppercase tracking-wider">
                Follow Royal Confectionery
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.socialInstagram && (
                  <span className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white">
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  </span>
                )}
                {formData.socialFacebook && (
                  <span className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white">
                    <Facebook className="w-3.5 h-3.5 text-blue-400" />
                  </span>
                )}
                {formData.socialTwitter && (
                  <span className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white">
                    <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  </span>
                )}
                {formData.socialYoutube && (
                  <span className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white">
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                  </span>
                )}
              </div>
              <div className="pt-2 text-[10px] text-stone-400 border-t border-stone-800 mt-2">
                <p>© {new Date().getFullYear()} {formData.footerCopyrightText}</p>
                <p className="text-amber-500/80 mt-0.5">{formData.footerPaymentSecurity} • {formData.footerPaymentMethods}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating / Sticky Save Action Bar */}
        <div className="sticky bottom-4 z-20 bg-stone-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-amber-500/40 shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-stone-300 hidden sm:inline">
              Changes update the live customer footer instantly.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 text-xs font-medium transition-all"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-stone-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish Footer'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
