'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Truck,
  HeartHandshake,
  Calendar,
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Edit2,
  Plus,
  X,
  ChevronRight,
  Eye,
  RefreshCw,
  Star,
  Package,
  Search,
  Gift,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';

const DEFAULT_HOMEPAGE_VALUES = {
  // Hero
  heroBadgeText: 'Royal Indian Confectionery Since 1952',
  heroTitle: 'Grand Heritage Confectionery & Sweets',
  heroSubtitle:
    'Handcrafted with centuries of royal halwai recipes, pure A2 Desi Cow Ghee and Kashmiri Saffron.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1600&q=85',
  heroPrimaryBtnText: 'Order Fresh Now',
  heroPrimaryBtnLink: '/shop',
  heroSecondaryBtnText: 'Advance Event Catering',
  heroSecondaryBtnLink: '/event-booking',

  // 4 Features / Value Highlights
  feature1Title: '100% Desi Ghee',
  feature1Subtitle: 'Pure certified A2 Cow Ghee',
  feature2Title: 'No Preservatives',
  feature2Subtitle: 'Fresh daily artisan batches',
  feature3Title: 'Same-Day Delivery',
  feature3Subtitle: 'Free on orders above ₹799',
  feature4Title: 'Event Catering',
  feature4Subtitle: 'Bespoke bulk boxes & 30% deposit',

  // Royal Catalog
  catalogBadgeText: 'Royal Catalog',
  catalogTitle: 'Explore by Confectionery',
  catalogLinkText: 'All Categories',

  // Best Selling Hampers
  hampersBadgeText: 'Curated Luxury',
  hampersTitle: 'Best Selling Hampers',
  hampersSubtitle:
    'Bespoke velvet gift chests, wedding thalis, and royal festive assortments selected for connoisseurs.',
  hampersLinkText: 'Explore All Hampers',
  hampersLinkUrl: '/shop?search=hamper',
};

export default function AdminHomepageManagementPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'features' | 'catalog' | 'signature' | 'hampers'>('hero');
  const [formData, setFormData] = useState<any>(DEFAULT_HOMEPAGE_VALUES);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [togglingProdId, setTogglingProdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Category Edit Modal
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    isActive: true,
  });
  const [savingCategory, setSavingCategory] = useState(false);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);

  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, catsRes, prodsRes] = await Promise.all([
        api.get('/settings').catch(() => ({ success: false, data: {} })),
        api.get('/categories').catch(() => ({ success: false, data: [] })),
        api.get('/products?limit=100').catch(() => ({ success: false, data: [] })),
      ]);

      if (settingsRes.success && settingsRes.data) {
        setFormData({
          heroBadgeText: settingsRes.data.heroBadgeText || DEFAULT_HOMEPAGE_VALUES.heroBadgeText,
          heroTitle: settingsRes.data.heroTitle || DEFAULT_HOMEPAGE_VALUES.heroTitle,
          heroSubtitle: settingsRes.data.heroSubtitle || DEFAULT_HOMEPAGE_VALUES.heroSubtitle,
          heroImageUrl: settingsRes.data.heroImageUrl || DEFAULT_HOMEPAGE_VALUES.heroImageUrl,
          heroPrimaryBtnText: settingsRes.data.heroPrimaryBtnText || DEFAULT_HOMEPAGE_VALUES.heroPrimaryBtnText,
          heroPrimaryBtnLink: settingsRes.data.heroPrimaryBtnLink || DEFAULT_HOMEPAGE_VALUES.heroPrimaryBtnLink,
          heroSecondaryBtnText: settingsRes.data.heroSecondaryBtnText || DEFAULT_HOMEPAGE_VALUES.heroSecondaryBtnText,
          heroSecondaryBtnLink: settingsRes.data.heroSecondaryBtnLink || DEFAULT_HOMEPAGE_VALUES.heroSecondaryBtnLink,

          feature1Title: settingsRes.data.feature1Title || DEFAULT_HOMEPAGE_VALUES.feature1Title,
          feature1Subtitle: settingsRes.data.feature1Subtitle || DEFAULT_HOMEPAGE_VALUES.feature1Subtitle,
          feature2Title: settingsRes.data.feature2Title || DEFAULT_HOMEPAGE_VALUES.feature2Title,
          feature2Subtitle: settingsRes.data.feature2Subtitle || DEFAULT_HOMEPAGE_VALUES.feature2Subtitle,
          feature3Title: settingsRes.data.feature3Title || DEFAULT_HOMEPAGE_VALUES.feature3Title,
          feature3Subtitle: settingsRes.data.feature3Subtitle || DEFAULT_HOMEPAGE_VALUES.feature3Subtitle,
          feature4Title: settingsRes.data.feature4Title || DEFAULT_HOMEPAGE_VALUES.feature4Title,
          feature4Subtitle: settingsRes.data.feature4Subtitle || DEFAULT_HOMEPAGE_VALUES.feature4Subtitle,

          catalogBadgeText: settingsRes.data.catalogBadgeText || DEFAULT_HOMEPAGE_VALUES.catalogBadgeText,
          catalogTitle: settingsRes.data.catalogTitle || DEFAULT_HOMEPAGE_VALUES.catalogTitle,
          catalogLinkText: settingsRes.data.catalogLinkText || DEFAULT_HOMEPAGE_VALUES.catalogLinkText,

          hampersBadgeText: settingsRes.data.hampersBadgeText || DEFAULT_HOMEPAGE_VALUES.hampersBadgeText,
          hampersTitle: settingsRes.data.hampersTitle || DEFAULT_HOMEPAGE_VALUES.hampersTitle,
          hampersSubtitle: settingsRes.data.hampersSubtitle || DEFAULT_HOMEPAGE_VALUES.hampersSubtitle,
          hampersLinkText: settingsRes.data.hampersLinkText || DEFAULT_HOMEPAGE_VALUES.hampersLinkText,
          hampersLinkUrl: settingsRes.data.hampersLinkUrl || DEFAULT_HOMEPAGE_VALUES.hampersLinkUrl,
        });
      }

      if (catsRes.success && Array.isArray(catsRes.data)) {
        setCategories(catsRes.data);
      }

      if (prodsRes.success) {
        const pList = Array.isArray(prodsRes.data) ? prodsRes.data : (prodsRes.data?.products || []);
        setProducts(pList);
      }
    } catch (err: any) {
      console.error('Failed to load homepage settings:', err);
      setErrorMsg('Failed to load existing homepage settings. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductFeatured = async (product: any) => {
    try {
      setTogglingProdId(product._id);
      const newFeatured = !product.isFeatured;
      const res = await api.put(`/products/${product._id}`, { isFeatured: newFeatured });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isFeatured: newFeatured } : p))
        );
        setSuccessMsg(
          newFeatured
            ? `"${product.productName}" is now featured on the Homepage Signature Sweets & Hampers!`
            : `"${product.productName}" was removed from Homepage Signature Sweets & Hampers.`
        );
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to update featured confectionery.');
      }
    } catch (err: any) {
      console.error('Failed to toggle product featured:', err);
      setErrorMsg(err.message || 'Error updating confectionery showcase.');
    } finally {
      setTogglingProdId(null);
    }
  };

  const handleToggleProductBestSeller = async (product: any) => {
    try {
      setTogglingProdId(product._id);
      const newBestSeller = !product.isBestSeller;
      const res = await api.put(`/products/${product._id}`, { isBestSeller: newBestSeller });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isBestSeller: newBestSeller } : p))
        );
        setSuccessMsg(
          newBestSeller
            ? `"${product.productName}" added to Homepage Best Selling Hampers!`
            : `"${product.productName}" removed from Homepage Best Selling Hampers.`
        );
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to update best seller hamper.');
      }
    } catch (err: any) {
      console.error('Failed to toggle product best seller:', err);
      setErrorMsg(err.message || 'Error updating best selling hamper showcase.');
    } finally {
      setTogglingProdId(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.put('/settings', formData);
      if (res.success) {
        setSuccessMsg('Homepage settings saved and published to the live storefront successfully!');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      console.error('Failed to update homepage settings:', err);
      setErrorMsg(err.message || 'Failed to update homepage settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset homepage fields to default brand content? (Unsaved until you click Save)')) {
      setFormData(DEFAULT_HOMEPAGE_VALUES);
      setSuccessMsg('Reset to defaults in the form. Click "Save & Publish" to commit.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingHero(true);
      setErrorMsg('');
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const res = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data?.url) {
        setFormData((prev: any) => ({ ...prev, heroImageUrl: res.data.url }));
        setSuccessMsg('Hero image uploaded successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        throw new Error(res.message || 'Image upload failed');
      }
    } catch (err: any) {
      console.error('Hero image upload failed:', err);
      setErrorMsg(err.message || 'Image upload failed. You can paste an image URL instead.');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCatImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const res = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data?.url) {
        setCategoryFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
      } else {
        throw new Error(res.message || 'Image upload failed');
      }
    } catch (err: any) {
      console.error('Category image upload failed:', err);
      alert(err.message || 'Failed to upload category image.');
    } finally {
      setUploadingCatImage(false);
    }
  };

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || '',
      imageUrl: cat.image?.url || '',
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setEditCategoryModalOpen(true);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setEditCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingCategory(true);
      const payload = {
        name: categoryFormData.name,
        slug: categoryFormData.slug || undefined,
        description: categoryFormData.description,
        image: {
          url: categoryFormData.imageUrl,
          altText: categoryFormData.name,
        },
        displayOrder: Number(categoryFormData.displayOrder),
        isActive: categoryFormData.isActive,
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
      } else {
        await api.post('/categories', payload);
      }

      setEditCategoryModalOpen(false);
      setSuccessMsg(
        editingCategory
          ? `Confectionery category "${categoryFormData.name}" updated successfully!`
          : `New Confectionery category "${categoryFormData.name}" created!`
      );
      setTimeout(() => setSuccessMsg(''), 4000);

      // Refresh categories list
      const catsRes = await api.get('/categories');
      if (catsRes.success && Array.isArray(catsRes.data)) {
        setCategories(catsRes.data);
      }
    } catch (err: any) {
      console.error('Failed to save category:', err);
      alert(err.message || 'Failed to save confectionery category.');
    } finally {
      setSavingCategory(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mb-3" />
        <p className="font-serif text-lg font-medium text-stone-700">Loading Homepage Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-100 text-gold-800">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-royal-950">
              Homepage & Sections Management
            </h1>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Manage the Grand Heritage Hero banner, 4 Value Highlights cards, and Royal Catalog confectionery cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </Link>

          <button
            onClick={() => handleSaveSettings()}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl gold-gradient text-royal-950 text-xs font-bold shadow-gold-sm hover:opacity-95 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-sm flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-burgundy-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-6 rounded-t-2xl pt-2">
        <button
          onClick={() => setActiveTab('hero')}
          className={`pb-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'hero'
              ? 'border-gold-600 text-gold-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hero Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`pb-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'features'
              ? 'border-gold-600 text-gold-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>4 Value Highlights</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-gold-600 text-gold-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Royal Catalog Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('signature')}
          className={`pb-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'signature'
              ? 'border-gold-600 text-gold-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-600" />
          <span>Signature Sweets &amp; Hampers ({products.filter((p) => p.isFeatured).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hampers')}
          className={`pb-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'hampers'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Gift className="w-4 h-4 text-rose-600" />
          <span>Best Selling Hampers ({products.filter((p) => p.isBestSeller).length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: HERO BANNER MANAGEMENT                                  */}
      {/* ============================================================== */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Inputs */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-bold text-royal-950 border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>Grand Heritage Hero Content</span>
                <span className="text-xs font-normal text-stone-400">Live on Storefront</span>
              </h2>

              {/* Badge Text */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Top Gold Badge Text
                </label>
                <input
                  type="text"
                  value={formData.heroBadgeText}
                  onChange={(e) => setFormData({ ...formData, heroBadgeText: e.target.value })}
                  placeholder="e.g. Royal Indian Confectionery Since 1952"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Hero Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Hero Headline / Title
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  placeholder="e.g. Grand Heritage Confectionery & Sweets"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 font-serif"
                />
              </div>

              {/* Hero Subtitle */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Hero Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  placeholder="e.g. Handcrafted with centuries of royal halwai recipes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 leading-relaxed"
                />
              </div>

              {/* Hero Background Image */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Hero Background Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    placeholder="https://... or upload below"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeroFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => heroFileInputRef.current?.click()}
                    disabled={uploadingHero}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingHero ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Recommended size: 1920x800 or high-resolution landscape photo.
                </p>
              </div>

              {/* Button 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.heroPrimaryBtnText}
                    onChange={(e) => setFormData({ ...formData, heroPrimaryBtnText: e.target.value })}
                    placeholder="e.g. Order Fresh Now"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.heroPrimaryBtnLink}
                    onChange={(e) => setFormData({ ...formData, heroPrimaryBtnLink: e.target.value })}
                    placeholder="e.g. /shop"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Button 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.heroSecondaryBtnText}
                    onChange={(e) => setFormData({ ...formData, heroSecondaryBtnText: e.target.value })}
                    placeholder="e.g. Advance Event Catering"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Secondary Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.heroSecondaryBtnLink}
                    onChange={(e) => setFormData({ ...formData, heroSecondaryBtnLink: e.target.value })}
                    placeholder="e.g. /event-booking"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl gold-gradient text-royal-950 text-xs font-bold shadow-gold-sm hover:opacity-95 flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Hero Section'}</span>
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-gold-600" />
                <span>Live Hero Preview</span>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-royal-950 text-white min-h-[360px] p-6 flex flex-col justify-center border border-royal-900 shadow-xl">
                {/* Background image preview */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={formData.heroImageUrl || DEFAULT_HOMEPAGE_VALUES.heroImageUrl}
                    alt="Hero Preview"
                    className="w-full h-full object-cover object-center opacity-30 filter brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-royal-950 via-royal-950/80 to-transparent" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-[11px] font-semibold">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    <span>{formData.heroBadgeText}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight text-white">
                    {formData.heroTitle}
                  </h3>

                  <p className="text-stone-300 text-xs leading-relaxed max-w-sm">
                    {formData.heroSubtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="px-3.5 py-1.5 rounded-full gold-gradient text-royal-950 font-bold text-[11px] uppercase tracking-wider shadow-sm">
                      {formData.heroPrimaryBtnText || 'Order Fresh Now'}
                    </div>

                    <div className="px-3 py-1.5 rounded-full bg-white/10 text-white font-semibold text-[11px] border border-white/20">
                      {formData.heroSecondaryBtnText || 'Event Catering'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: 4 VALUE HIGHLIGHTS / FEATURES BANNER                    */}
      {/* ============================================================== */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-royal-950">
                100% Desi Ghee & Value Highlights Banner (4 Cards)
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                These four trust badges appear directly below the hero section on the homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="p-4 rounded-xl border border-stone-200/90 bg-stone-50/50 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center text-gold-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                      Feature Card 1 (Ghee & Purity)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={formData.feature1Title}
                    onChange={(e) => setFormData({ ...formData, feature1Title: e.target.value })}
                    placeholder="100% Desi Ghee"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Card Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={formData.feature1Subtitle}
                    onChange={(e) => setFormData({ ...formData, feature1Subtitle: e.target.value })}
                    placeholder="Pure certified A2 Cow Ghee"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-xl border border-stone-200/90 bg-stone-50/50 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                      Feature Card 2 (Artisan & Fresh)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={formData.feature2Title}
                    onChange={(e) => setFormData({ ...formData, feature2Title: e.target.value })}
                    placeholder="No Preservatives"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Card Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={formData.feature2Subtitle}
                    onChange={(e) => setFormData({ ...formData, feature2Subtitle: e.target.value })}
                    placeholder="Fresh daily artisan batches"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-xl border border-stone-200/90 bg-stone-50/50 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                      Feature Card 3 (Delivery Threshold)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={formData.feature3Title}
                    onChange={(e) => setFormData({ ...formData, feature3Title: e.target.value })}
                    placeholder="Same-Day Delivery"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Card Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={formData.feature3Subtitle}
                    onChange={(e) => setFormData({ ...formData, feature3Subtitle: e.target.value })}
                    placeholder="Free on orders above ₹799"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-xl border border-stone-200/90 bg-stone-50/50 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                      Feature Card 4 (Events & Bulk Booking)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={formData.feature4Title}
                    onChange={(e) => setFormData({ ...formData, feature4Title: e.target.value })}
                    placeholder="Event Catering"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Card Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={formData.feature4Subtitle}
                    onChange={(e) => setFormData({ ...formData, feature4Subtitle: e.target.value })}
                    placeholder="Bespoke bulk boxes & 30% deposit"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview for the 4 Cards */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Storefront Banner Preview
              </span>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-5 rounded-2xl shadow-md border border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{formData.feature1Title}</h4>
                    <p className="text-[10px] text-stone-500">{formData.feature1Subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{formData.feature2Title}</h4>
                    <p className="text-[10px] text-stone-500">{formData.feature2Subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{formData.feature3Title}</h4>
                    <p className="text-[10px] text-stone-500">{formData.feature3Subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{formData.feature4Title}</h4>
                    <p className="text-[10px] text-stone-500">{formData.feature4Subtitle}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl gold-gradient text-royal-950 text-xs font-bold shadow-gold-sm hover:opacity-95 flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Features Banner'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ROYAL CATALOG - EXPLORE BY CONFECTIONERY CARDS           */}
      {/* ============================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Section Headers Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-5">
            <h2 className="font-serif text-lg font-bold text-royal-950 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Section Heading & Labels</span>
              <span className="text-xs font-normal text-stone-400">Homepage Catalog Header</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Section Badge Text
                </label>
                <input
                  type="text"
                  value={formData.catalogBadgeText}
                  onChange={(e) => setFormData({ ...formData, catalogBadgeText: e.target.value })}
                  placeholder="Royal Catalog"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Section Main Title
                </label>
                <input
                  type="text"
                  value={formData.catalogTitle}
                  onChange={(e) => setFormData({ ...formData, catalogTitle: e.target.value })}
                  placeholder="Explore by Confectionery"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Right Link Text
                </label>
                <input
                  type="text"
                  value={formData.catalogLinkText}
                  onChange={(e) => setFormData({ ...formData, catalogLinkText: e.target.value })}
                  placeholder="All Categories"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="px-5 py-2 rounded-xl gold-gradient text-royal-950 text-xs font-bold shadow-gold-sm hover:opacity-95 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Section Titles</span>
              </button>
            </div>
          </div>

          {/* Confectionery Cards Manager */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-royal-950">
                  Royal Catalog Cards ({categories.length})
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Manage the confectionery cards displayed on the homepage grid. Edit names, photos, or add new categories.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/categories"
                  className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Full Categories Organizer</span>
                </Link>

                <button
                  type="button"
                  onClick={openAddCategory}
                  className="px-4 py-2 rounded-xl gold-gradient text-royal-950 text-xs font-bold shadow-gold-sm flex items-center gap-1.5 hover:opacity-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Confectionery Card</span>
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="group relative rounded-2xl overflow-hidden aspect-square bg-stone-100 border border-stone-200/80 shadow-sm hover:shadow-gold-md hover:border-gold-300 transition-all flex flex-col justify-between p-3"
                >
                  {/* Category Image */}
                  <img
                    src={cat.image?.url || 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80'}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-950/95 via-royal-950/40 to-black/20" />

                  {/* Top Bar with Edit Button */}
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm px-2 py-0.5 rounded-full">
                      #{cat.displayOrder || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditCategory(cat)}
                      className="p-1.5 rounded-lg bg-white/90 text-royal-950 hover:bg-gold-500 hover:text-white transition-colors shadow-sm"
                      title="Edit Category Card"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Title */}
                  <div className="relative z-10 text-center">
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-white drop-shadow-sm">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SIGNATURE SWEETS & HAMPERS SHOWCASE                     */}
      {/* ============================================================== */}
      {activeTab === 'signature' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-600" />
                  </span>
                  <h2 className="font-serif text-xl font-bold text-royal-950">
                    Homepage Signature Sweets &amp; Hampers Selection
                  </h2>
                </div>
                <p className="text-sm text-stone-500 mt-1 max-w-3xl">
                  Select any confections or luxury hampers to display in the premier &quot;Signature Sweets &amp; Hampers&quot; section on the homepage. Storefront cards feature a refined, compact card layout.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  {products.filter((p) => p.isFeatured).length} Items Featured on Homepage
                </span>
                <Link
                  href="/admin/products"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-stone-200 hover:bg-stone-50 text-stone-700"
                >
                  Manage Full Catalogue &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Section 1: Currently Featured Products */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <span>Currently Live on Storefront</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-bold">
                    {products.filter((p) => p.isFeatured).length} Active
                  </span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  These sweets appear directly on the homepage in the Signature Sweets &amp; Hampers showcase.
                </p>
              </div>
            </div>

            {products.filter((p) => p.isFeatured).length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200 p-6">
                <Star className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h4 className="font-serif font-bold text-stone-700 text-sm">No items currently selected</h4>
                <p className="text-stone-500 text-xs mt-1 max-w-md mx-auto">
                  Click &quot;+ Feature on Homepage&quot; on any delicacy from the catalogue below to immediately showcase it on your homepage.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products
                  .filter((p) => p.isFeatured)
                  .map((p) => (
                    <div
                      key={p._id}
                      className="group bg-white rounded-2xl border-2 border-amber-200 p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[16/11] rounded-xl overflow-hidden bg-stone-100 relative mb-2.5">
                          <img
                            src={p.productImages?.[0]?.url || 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80'}
                            alt={p.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-white" />
                            Live on Homepage
                          </span>
                        </div>

                        <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider block">
                          {p.category?.name || p.category?.categoryName || 'Sweets'}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1 mt-0.5">
                          {p.productName}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-serif font-bold text-sm text-royal-950">
                            {formatPrice(p.finalPrice)}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            Per {p.weightUnit || 'kg'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleToggleProductFeatured(p)}
                          disabled={togglingProdId === p._id}
                          className="w-full py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove from Showcase</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Section 2: Full Product Catalogue Picker */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Select Confections from Catalogue
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Click to add or remove any delicacy from the Homepage Signature Sweets &amp; Hampers section.
                </p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search sweets & hampers..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-gold-500 w-48 sm:w-60"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name || c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List / Cards of All Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {products
                .filter((p) => {
                  if (productSearch.trim()) {
                    const q = productSearch.toLowerCase();
                    if (!p.productName?.toLowerCase().includes(q)) return false;
                  }
                  if (productCategoryFilter) {
                    const catId = p.category?._id || p.category;
                    if (catId !== productCategoryFilter) return false;
                  }
                  return true;
                })
                .map((p) => {
                  const isFeatured = !!p.isFeatured;
                  return (
                    <div
                      key={p._id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                        isFeatured
                          ? 'border-amber-300 bg-amber-50/30'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 relative">
                          <img
                            src={p.productImages?.[0]?.url || 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=200&q=80'}
                            alt={p.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                            {p.productName}
                          </h4>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {p.category?.name || p.category?.categoryName || 'Sweets'}
                          </span>
                          <span className="font-bold text-xs text-stone-900 mt-0.5 block">
                            {formatPrice(p.finalPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleToggleProductFeatured(p)}
                          disabled={togglingProdId === p._id}
                          className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isFeatured
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-xs'
                              : 'bg-stone-50 hover:bg-gold-50 text-stone-700 hover:text-royal-950 border border-stone-200 hover:border-gold-300'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-500 text-amber-600' : 'text-stone-400'}`} />
                          <span>{isFeatured ? '✓ Featured on Homepage' : '+ Feature on Homepage'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: BEST SELLING HAMPERS SECTION                            */}
      {/* ============================================================== */}
      {activeTab === 'hampers' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                    <Gift className="w-5 h-5" />
                  </span>
                  <h2 className="font-serif text-xl font-bold text-royal-950">
                    Homepage Best Selling Hampers Management
                  </h2>
                </div>
                <p className="text-sm text-stone-500 mt-1 max-w-3xl">
                  Select items to showcase in the &quot;Best Selling Hampers&quot; section displayed directly above the &quot;Centuries of Trust&quot; section on the homepage. Storefront cards feature a refined compact layout with a dedicated &quot;Best Seller&quot; ribbon.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-rose-600" />
                  {products.filter((p) => p.isBestSeller).length} Hampers Live on Homepage
                </span>
                <Link
                  href="/admin/products"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-stone-200 hover:bg-stone-50 text-stone-700"
                >
                  Manage Full Catalogue &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Section 1: Section Title & Content Settings */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Section Copy &amp; Header Settings
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Customize the title, subtitle, badge, and navigation link shown above the hampers on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Section Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Section Badge Text
                </label>
                <input
                  type="text"
                  value={formData.hampersBadgeText || ''}
                  onChange={(e) => setFormData({ ...formData, hampersBadgeText: e.target.value })}
                  placeholder="e.g. Curated Luxury"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Section Title
                </label>
                <input
                  type="text"
                  value={formData.hampersTitle || ''}
                  onChange={(e) => setFormData({ ...formData, hampersTitle: e.target.value })}
                  placeholder="e.g. Best Selling Hampers"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-rose-500 font-serif font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={formData.hampersSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, hampersSubtitle: e.target.value })}
                  placeholder="e.g. Bespoke velvet gift chests and royal festive assortments..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Link Button Text
                </label>
                <input
                  type="text"
                  value={formData.hampersLinkText || ''}
                  onChange={(e) => setFormData({ ...formData, hampersLinkText: e.target.value })}
                  placeholder="e.g. Explore All Hampers"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Link Destination URL
                </label>
                <input
                  type="text"
                  value={formData.hampersLinkUrl || ''}
                  onChange={(e) => setFormData({ ...formData, hampersLinkUrl: e.target.value })}
                  placeholder="e.g. /shop?search=hamper"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Currently Selected Best Selling Hampers */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <span>Currently Live in Best Selling Hampers</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-sans font-bold">
                    {products.filter((p) => p.isBestSeller).length} Selected
                  </span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  These items appear directly in the Best Selling Hampers showcase above Centuries of Trust.
                </p>
              </div>
            </div>

            {products.filter((p) => p.isBestSeller).length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200 p-6">
                <Gift className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h4 className="font-serif font-bold text-stone-700 text-sm">No hampers currently selected</h4>
                <p className="text-stone-500 text-xs mt-1 max-w-md mx-auto">
                  Click &quot;+ Add to Best Hampers&quot; on any delicacy or gift box from the catalogue below to immediately showcase it on your homepage.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products
                  .filter((p) => p.isBestSeller)
                  .map((p) => (
                    <div
                      key={p._id}
                      className="group bg-white rounded-2xl border-2 border-rose-200 p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[16/11] rounded-xl overflow-hidden bg-stone-100 relative mb-2.5">
                          <img
                            src={p.productImages?.[0]?.url || 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80'}
                            alt={p.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs flex items-center gap-1">
                            <Gift className="w-2.5 h-2.5" />
                            Best Seller Hamper
                          </span>
                        </div>

                        <span className="text-[10px] text-rose-700 font-semibold uppercase tracking-wider block">
                          {p.category?.name || p.category?.categoryName || 'Hampers'}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1 mt-0.5">
                          {p.productName}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-serif font-bold text-sm text-royal-950">
                            {formatPrice(p.finalPrice)}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            Per {p.weightUnit || 'box'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleToggleProductBestSeller(p)}
                          disabled={togglingProdId === p._id}
                          className="w-full py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove from Best Hampers</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Section 3: Full Catalogue Picker for Hampers */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Select Hampers &amp; Items from Catalogue
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Click to add or remove any sweet, thali, or gift box from the Homepage Best Selling Hampers section.
                </p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search sweets & hampers..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 w-48 sm:w-60"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name || c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List / Cards of All Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {products
                .filter((p) => {
                  if (productSearch.trim()) {
                    const q = productSearch.toLowerCase();
                    if (!p.productName?.toLowerCase().includes(q)) return false;
                  }
                  if (productCategoryFilter) {
                    const catId = p.category?._id || p.category;
                    if (catId !== productCategoryFilter) return false;
                  }
                  return true;
                })
                .map((p) => {
                  const isBestSeller = !!p.isBestSeller;
                  return (
                    <div
                      key={p._id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                        isBestSeller
                          ? 'border-rose-300 bg-rose-50/30'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 relative">
                          <img
                            src={p.productImages?.[0]?.url || 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=200&q=80'}
                            alt={p.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                            {p.productName}
                          </h4>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {p.category?.name || p.category?.categoryName || 'Hampers'}
                          </span>
                          <span className="font-bold text-xs text-stone-900 mt-0.5 block">
                            {formatPrice(p.finalPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleToggleProductBestSeller(p)}
                          disabled={togglingProdId === p._id}
                          className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isBestSeller
                              ? 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200 shadow-xs'
                              : 'bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-950 border border-stone-200 hover:border-rose-300'
                          }`}
                        >
                          <Gift className={`w-3.5 h-3.5 ${isBestSeller ? 'text-rose-600' : 'text-stone-400'}`} />
                          <span>{isBestSeller ? '✓ Best Selling Hamper' : '+ Add to Best Hampers'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT / ADD CONFECTIONERY CARD                           */}
      {/* ============================================================== */}
      {editCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-royal-950">
                {editingCategory ? `Edit "${editingCategory.name}" Card` : 'Add New Confectionery Card'}
              </h3>
              <button
                type="button"
                onClick={() => setEditCategoryModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Confectionery Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="e.g. Kaju Katli, Motichoor Ladoo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:ring-2 focus:ring-gold-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Confectionery Card Image
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={categoryFormData.imageUrl}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, imageUrl: e.target.value })}
                    placeholder="https://... image URL"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                  <input
                    ref={catFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => catFileInputRef.current?.click()}
                    disabled={uploadingCatImage}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingCatImage ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>

                {categoryFormData.imageUrl && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                    <img
                      src={categoryFormData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={categoryFormData.displayOrder}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, displayOrder: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Visibility
                  </label>
                  <select
                    value={categoryFormData.isActive ? 'true' : 'false'}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, isActive: e.target.value === 'true' })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-5 py-2 rounded-xl gold-gradient text-royal-950 text-xs font-bold shadow-gold-sm hover:opacity-95"
                >
                  {savingCategory ? 'Saving...' : 'Save Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
