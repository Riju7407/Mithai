'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Award,
  Sparkles,
  ShieldCheck,
  Heart,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { api } from '../../../lib/api';

const DEFAULT_HERITAGE_VALUES = {
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

export default function AdminHeritagePage() {
  const [formData, setFormData] = useState<any>(DEFAULT_HERITAGE_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);

  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.success && res.data) {
        setFormData({
          heritageBadge: res.data.heritageBadge || DEFAULT_HERITAGE_VALUES.heritageBadge,
          heritageHeroTitle: res.data.heritageHeroTitle || DEFAULT_HERITAGE_VALUES.heritageHeroTitle,
          heritageHeroSubtitle: res.data.heritageHeroSubtitle || DEFAULT_HERITAGE_VALUES.heritageHeroSubtitle,
          heritageHeroImageUrl: res.data.heritageHeroImageUrl || DEFAULT_HERITAGE_VALUES.heritageHeroImageUrl,
          heritageStoryBadge: res.data.heritageStoryBadge || DEFAULT_HERITAGE_VALUES.heritageStoryBadge,
          heritageStoryTitle: res.data.heritageStoryTitle || DEFAULT_HERITAGE_VALUES.heritageStoryTitle,
          heritageStoryParagraph1: res.data.heritageStoryParagraph1 || DEFAULT_HERITAGE_VALUES.heritageStoryParagraph1,
          heritageStoryParagraph2: res.data.heritageStoryParagraph2 || DEFAULT_HERITAGE_VALUES.heritageStoryParagraph2,
          heritageStoryImageUrl: res.data.heritageStoryImageUrl || DEFAULT_HERITAGE_VALUES.heritageStoryImageUrl,
          heritagePillar1Title: res.data.heritagePillar1Title || DEFAULT_HERITAGE_VALUES.heritagePillar1Title,
          heritagePillar1Subtitle: res.data.heritagePillar1Subtitle || DEFAULT_HERITAGE_VALUES.heritagePillar1Subtitle,
          heritagePillar2Title: res.data.heritagePillar2Title || DEFAULT_HERITAGE_VALUES.heritagePillar2Title,
          heritagePillar2Subtitle: res.data.heritagePillar2Subtitle || DEFAULT_HERITAGE_VALUES.heritagePillar2Subtitle,
          heritagePillar3Title: res.data.heritagePillar3Title || DEFAULT_HERITAGE_VALUES.heritagePillar3Title,
          heritagePillar3Subtitle: res.data.heritagePillar3Subtitle || DEFAULT_HERITAGE_VALUES.heritagePillar3Subtitle,
          heritageCtaText: res.data.heritageCtaText || DEFAULT_HERITAGE_VALUES.heritageCtaText,
          heritageCtaLink: res.data.heritageCtaLink || DEFAULT_HERITAGE_VALUES.heritageCtaLink,
        });
      }
    } catch (err) {
      console.error('Failed to load settings for heritage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'heritageHeroImageUrl' | 'heritageStoryImageUrl',
    setUploading: (b: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg('');
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await api.upload('/uploads/image', uploadData);
      if (res.success && res.data?.url) {
        handleChange(fieldKey, res.data.url);
        setSuccessMsg('Image uploaded successfully! Remember to save your changes.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg('Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed. Ensure server has Cloudinary/local upload configured.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.put('/settings', formData);
      if (res.success) {
        setSuccessMsg('Our Heritage page content has been updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to update Our Heritage page.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all Our Heritage content to default royal craftsmanship text?')) {
      setFormData(DEFAULT_HERITAGE_VALUES);
      setSuccessMsg('Form reset to defaults. Click "Save Heritage Page" to apply live.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-64 bg-stone-200 rounded animate-pulse" />
        <div className="h-96 bg-stone-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>Content Management System</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Our Heritage & Brand Story
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage all royal stories, founding values, A2 Desi Ghee pillars, and photography shown on the public <Link href="/about" target="_blank" className="text-amber-800 underline font-semibold">Our Heritage (/about)</Link> page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 hover:text-amber-800 hover:border-amber-400 text-xs font-semibold transition-colors bg-white shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Page</span>
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              activeTab === 'preview'
                ? 'bg-purple-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{activeTab === 'preview' ? 'Back to Editor' : 'Live Preview'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Mode 1: LIVE PREVIEW */}
      {activeTab === 'preview' ? (
        <div className="space-y-6">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-center justify-between">
            <span>Live visual preview of how your patrons will experience <strong>/about</strong>:</span>
            <button
              onClick={() => setActiveTab('editor')}
              className="text-xs font-bold text-purple-800 underline hover:text-purple-950"
            >
              Switch back to Edit
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-lg space-y-12 pb-16">
            {/* Banner Preview */}
            <section className="bg-royal-950 text-white py-16 px-4 text-center relative overflow-hidden">
              <div className="max-w-3xl mx-auto space-y-3 relative z-10">
                <span className="text-xs font-bold text-gold-400 uppercase tracking-widest block">
                  {formData.heritageBadge}
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
                  {formData.heritageHeroTitle}
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
                  {formData.heritageHeroSubtitle}
                </p>
              </div>
            </section>

            {/* Genesis Story Preview */}
            <section className="max-w-5xl mx-auto px-6 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gold-600 uppercase tracking-wider block">
                    {formData.heritageStoryBadge}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-royal-950">
                    {formData.heritageStoryTitle}
                  </h2>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {formData.heritageStoryParagraph1}
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {formData.heritageStoryParagraph2}
                  </p>
                </div>
                <div className="rounded-2xl overflow-hidden shadow border border-stone-200 aspect-[4/3]">
                  <img
                    src={formData.heritageStoryImageUrl}
                    alt="Artisanal sweet preparation"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 3 Pillars Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="bg-cream-50/60 p-5 rounded-2xl border border-gold-200/60 space-y-2">
                  <ShieldCheck className="w-6 h-6 text-gold-600" />
                  <h3 className="font-serif font-bold text-sm text-stone-900">{formData.heritagePillar1Title}</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">{formData.heritagePillar1Subtitle}</p>
                </div>
                <div className="bg-cream-50/60 p-5 rounded-2xl border border-gold-200/60 space-y-2">
                  <Award className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-serif font-bold text-sm text-stone-900">{formData.heritagePillar2Title}</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">{formData.heritagePillar2Subtitle}</p>
                </div>
                <div className="bg-cream-50/60 p-5 rounded-2xl border border-gold-200/60 space-y-2">
                  <Heart className="w-6 h-6 text-purple-600" />
                  <h3 className="font-serif font-bold text-sm text-stone-900">{formData.heritagePillar3Title}</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">{formData.heritagePillar3Subtitle}</p>
                </div>
              </div>

              <div className="text-center pt-4">
                <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow">
                  <span>{formData.heritageCtaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </section>
          </div>
        </div>
      ) : (
        /* Mode 2: FULL CONTENT EDITOR FORM */
        <form onSubmit={handleSave} className="space-y-8">
          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 sticky top-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200 shadow-md">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-bold border border-stone-200 hover:bg-stone-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Heritage Page...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Heritage Page</span>
                </>
              )}
            </button>
          </div>

          {/* SECTION 1: Top Hero Banner */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                  Section 1
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Royal Hero Header & Tagline
                </h3>
              </div>
              <span className="text-xs text-stone-400">Displayed at the top of /about</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Heritage Badge Label
                </label>
                <input
                  type="text"
                  value={formData.heritageBadge}
                  onChange={(e) => handleChange('heritageBadge', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-medium"
                  placeholder="e.g. Since 1952"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Main Headline / Title
                </label>
                <input
                  type="text"
                  value={formData.heritageHeroTitle}
                  onChange={(e) => handleChange('heritageHeroTitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-medium"
                  placeholder="e.g. Seven Decades of Royal Culinary Confectionery"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Heritage Mission & Lineage Subtitle
              </label>
              <textarea
                rows={2}
                value={formData.heritageHeroSubtitle}
                onChange={(e) => handleChange('heritageHeroSubtitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-medium"
                placeholder="Describe your heritage halwai tradition, Rajputana roots, and commitment to purity..."
              />
            </div>
          </div>

          {/* SECTION 2: The Genesis & Story */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                  Section 2
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  The Genesis Story & Artisanal Photo
                </h3>
              </div>
              <span className="text-xs text-stone-400">Founder journey & traditional methods</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Story Section Badge
                </label>
                <input
                  type="text"
                  value={formData.heritageStoryBadge}
                  onChange={(e) => handleChange('heritageStoryBadge', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-medium"
                  placeholder="e.g. The Genesis"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Story Heading
                </label>
                <input
                  type="text"
                  value={formData.heritageStoryTitle}
                  onChange={(e) => handleChange('heritageStoryTitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-medium"
                  placeholder="e.g. Preserving Royal Recipes Passed Through Generations"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Story Paragraph 1 (Origins & Core Oath)
                </label>
                <textarea
                  rows={4}
                  value={formData.heritageStoryParagraph1}
                  onChange={(e) => handleChange('heritageStoryParagraph1', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Story Paragraph 2 (Fresh Ingredients & Daily Craft)
                </label>
                <textarea
                  rows={4}
                  value={formData.heritageStoryParagraph2}
                  onChange={(e) => handleChange('heritageStoryParagraph2', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-medium"
                />
              </div>
            </div>

            {/* Story Image Upload & URL */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Artisanal Preparation Photo
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-1 aspect-[4/3] rounded-xl overflow-hidden bg-stone-200 border border-stone-300 relative">
                  <img
                    src={formData.heritageStoryImageUrl}
                    alt="Story Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.heritageStoryImageUrl}
                      onChange={(e) => handleChange('heritageStoryImageUrl', e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono"
                      placeholder="https://..."
                    />
                    <input
                      type="file"
                      ref={storyFileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'heritageStoryImageUrl', setUploadingStory)}
                    />
                    <button
                      type="button"
                      onClick={() => storyFileInputRef.current?.click()}
                      disabled={uploadingStory}
                      className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 shrink-0"
                    >
                      {uploadingStory ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Upload</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Recommended resolution: 800x600 px or higher. Authentic copper kadhai or halwai imagery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: The 3 Royal Pillars */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                  Section 3
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Three Royal Pillars of Excellence
                </h3>
              </div>
              <span className="text-xs text-stone-400">Purity badges & celebration promises</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pillar 1 */}
              <div className="p-4 rounded-2xl bg-cream-50/70 border border-gold-200 space-y-3">
                <div className="flex items-center gap-2 text-gold-700 font-bold text-xs uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pillar 1: Desi Ghee</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.heritagePillar1Title}
                    onChange={(e) => handleChange('heritagePillar1Title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.heritagePillar1Subtitle}
                    onChange={(e) => handleChange('heritagePillar1Subtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-2xl bg-cream-50/70 border border-gold-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
                  <Award className="w-4 h-4" />
                  <span>Pillar 2: Preservatives</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.heritagePillar2Title}
                    onChange={(e) => handleChange('heritagePillar2Title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.heritagePillar2Subtitle}
                    onChange={(e) => handleChange('heritagePillar2Subtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-2xl bg-cream-50/70 border border-gold-200 space-y-3">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase">
                  <Heart className="w-4 h-4" />
                  <span>Pillar 3: Celebrations</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.heritagePillar3Title}
                    onChange={(e) => handleChange('heritagePillar3Title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.heritagePillar3Subtitle}
                    onChange={(e) => handleChange('heritagePillar3Subtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Call To Action Button */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                  Section 4
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Call to Action (CTA) Button
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Button Label
                </label>
                <input
                  type="text"
                  value={formData.heritageCtaText}
                  onChange={(e) => handleChange('heritageCtaText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-medium"
                  placeholder="e.g. Experience Our Sweets"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Button Target URL / Route
                </label>
                <input
                  type="text"
                  value={formData.heritageCtaLink}
                  onChange={(e) => handleChange('heritageCtaLink', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-medium"
                  placeholder="/shop"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-xl gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Heritage Page...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Heritage Page</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
