'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Award, Heart, ArrowRight, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

const DEFAULT_HERITAGE = {
  heritageBadge: 'Since 1952',
  heritageHeroTitle: 'Seven Decades of Royal Culinary Confectionery',
  heritageHeroSubtitle:
    'Honoring royal Rajputana and Bengali halwai lineages through uncompromised purity, heritage copper cauldrons, and certified A2 Desi Cow Ghee.',
  heritageHeroImageUrl:
    'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1600&q=85',
  heritageStoryBadge: 'The Genesis',
  heritageStoryTitle: 'Preserving Royal Recipes Passed Through Generations',
  heritageStoryParagraph1:
    'Shree Mithai began in the walled city of Jaipur with a simple oath: sweets should never compromise on purity. While modern confectioners turned to palm oil and synthetic colors, our kitchen remained faithful to traditional brass kadhais and hand-stirred mawa.',
  heritageStoryParagraph2:
    'Every morning at 4:00 AM, fresh cow milk is brought in from certified local farms to craft fresh chenna for our Rasmalai and Gulab Jamuns.',
  heritageStoryImageUrl:
    'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
  heritagePillar1Title: '100% Pure A2 Cow Ghee',
  heritagePillar1Subtitle:
    'We never use vanaspati or hydrogenated fats. Pure clarified butter gives our laddoos their sacred golden warmth.',
  heritagePillar2Title: 'Zero Preservatives',
  heritagePillar2Subtitle:
    'No artificial chemical stabilisers or artificial fragrances. What you taste is pure saffron, cardamom, and Goan cashews.',
  heritagePillar3Title: 'Grand Celebrations',
  heritagePillar3Subtitle:
    'Over 2,500 royal weddings and state galas catered with bespoke velvet chests and white-glove delivery.',
  heritageCtaText: 'Experience Our Sweets',
  heritageCtaLink: '/shop',
};

export default function AboutPage() {
  const [heritage, setHeritage] = useState(DEFAULT_HERITAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        if (res.success && res.data) {
          setHeritage({
            heritageBadge: res.data.heritageBadge || DEFAULT_HERITAGE.heritageBadge,
            heritageHeroTitle: res.data.heritageHeroTitle || DEFAULT_HERITAGE.heritageHeroTitle,
            heritageHeroSubtitle: res.data.heritageHeroSubtitle || DEFAULT_HERITAGE.heritageHeroSubtitle,
            heritageHeroImageUrl: res.data.heritageHeroImageUrl || DEFAULT_HERITAGE.heritageHeroImageUrl,
            heritageStoryBadge: res.data.heritageStoryBadge || DEFAULT_HERITAGE.heritageStoryBadge,
            heritageStoryTitle: res.data.heritageStoryTitle || DEFAULT_HERITAGE.heritageStoryTitle,
            heritageStoryParagraph1: res.data.heritageStoryParagraph1 || DEFAULT_HERITAGE.heritageStoryParagraph1,
            heritageStoryParagraph2: res.data.heritageStoryParagraph2 || DEFAULT_HERITAGE.heritageStoryParagraph2,
            heritageStoryImageUrl: res.data.heritageStoryImageUrl || DEFAULT_HERITAGE.heritageStoryImageUrl,
            heritagePillar1Title: res.data.heritagePillar1Title || DEFAULT_HERITAGE.heritagePillar1Title,
            heritagePillar1Subtitle: res.data.heritagePillar1Subtitle || DEFAULT_HERITAGE.heritagePillar1Subtitle,
            heritagePillar2Title: res.data.heritagePillar2Title || DEFAULT_HERITAGE.heritagePillar2Title,
            heritagePillar2Subtitle: res.data.heritagePillar2Subtitle || DEFAULT_HERITAGE.heritagePillar2Subtitle,
            heritagePillar3Title: res.data.heritagePillar3Title || DEFAULT_HERITAGE.heritagePillar3Title,
            heritagePillar3Subtitle: res.data.heritagePillar3Subtitle || DEFAULT_HERITAGE.heritagePillar3Subtitle,
            heritageCtaText: res.data.heritageCtaText || DEFAULT_HERITAGE.heritageCtaText,
            heritageCtaLink: res.data.heritageCtaLink || DEFAULT_HERITAGE.heritageCtaLink,
          });
        }
      })
      .catch((err) => console.error('Failed to load heritage settings:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Royal Banner Section */}
      <section className="bg-royal-950 text-white py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle background image overlay */}
        {heritage.heritageHeroImageUrl && (
          <div className="absolute inset-0 z-0 opacity-20">
            <img
              src={heritage.heritageHeroImageUrl}
              alt={heritage.heritageHeroTitle}
              className="w-full h-full object-cover filter brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/70 to-royal-950/90" />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 text-center space-y-4 relative z-10">
          <span className="text-xs font-bold text-gold-400 uppercase tracking-widest inline-block px-3 py-1 rounded-full bg-gold-500/10 border border-gold-400/20">
            {heritage.heritageBadge}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {heritage.heritageHeroTitle}
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {heritage.heritageHeroSubtitle}
          </p>
        </div>
      </section>

      {/* Story & Philosophy Sections */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-gold-600 uppercase tracking-wider block">
              {heritage.heritageStoryBadge}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-950 leading-tight">
              {heritage.heritageStoryTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {heritage.heritageStoryParagraph1}
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {heritage.heritageStoryParagraph2}
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200/90 aspect-[4/3] relative group">
            <img
              src={heritage.heritageStoryImageUrl}
              alt={heritage.heritageStoryTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold text-royal-950 uppercase tracking-wider flex items-center gap-1 shadow">
              <Sparkles className="w-3 h-3 text-gold-600" />
              <span>Authentic Brass Kadhais</span>
            </div>
          </div>
        </div>

        {/* 3 Royal Pillars of Craftsmanship */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-3 hover:border-gold-300 hover:shadow-gold-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-gold-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">{heritage.heritagePillar1Title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {heritage.heritagePillar1Subtitle}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-3 hover:border-emerald-300 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">{heritage.heritagePillar2Title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {heritage.heritagePillar2Subtitle}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-3 hover:border-purple-300 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">{heritage.heritagePillar3Title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {heritage.heritagePillar3Subtitle}
            </p>
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="text-center pt-8">
          <Link
            href={heritage.heritageCtaLink || '/shop'}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:scale-105 transition-transform"
          >
            <span>{heritage.heritageCtaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
