'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Clock,
  Phone,
  Flame,
  Users,
  Eye,
  RefreshCw,
  X,
  Star,
  Layers,
  ChefHat,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';

const DEFAULT_RESTAURANT_SETTINGS = {
  restaurantBadgeText: 'Shree Mithai Royal Kitchen & Dining',
  restaurantHeroTitle: 'Master Royal Dining & Artisanal Delicacies',
  restaurantHeroSubtitle:
    'Savor royal Awadhi & Rajputana gourmet dishes prepared fresh by master khansamas using fragrant hand-pounded spices, slow-dum clay handis, and pure A2 Desi Cow Ghee.',
  restaurantHeroImageUrl:
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=85',
  restaurantOpeningHours: '11:00 AM – 11:00 PM Daily',
  restaurantContactPhone: '+91 98765 43210',
  restaurantDiningNotice:
    'Freshly prepared to order. Instant doorstep delivery within 35-45 mins or reserved dining at our Heritage Hall.',
  restaurantFeature1Title: 'Live Clay Tandoor',
  restaurantFeature1Subtitle: 'Charcoal smoked breads & kebabs',
  restaurantFeature2Title: 'Slow-Dum Handi',
  restaurantFeature2Subtitle: '24-hr gentle simmered gravies',
  restaurantFeature3Title: '100% Desi Cow Ghee',
  restaurantFeature3Subtitle: 'Pure certified A2 clarified butter',
  restaurantFeature4Title: 'Express Hot Delivery',
  restaurantFeature4Subtitle: 'Piping hot in thermal insulated bags',

  // Homepage Restaurant Section
  homeRestaurantBadge: "Chef's Gourmet Kitchen",
  homeRestaurantTitle: 'Royal Restaurant Dining & Delicacies',
  homeRestaurantSubtitle:
    'Freshly prepared to order from our live tandoor and copper cauldrons — relish royal thalis, slow-cooked dal, and fragrant biryanis delivered piping hot.',
  homeRestaurantBtnText: 'Explore Full Restaurant Menu',
  homeRestaurantBtnLink: '/restaurant',
  homeRestaurantBannerImage:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85',
  homeRestaurantNotice: 'Instant Doorstep Delivery in 30-45 Mins • Fresh Upon Order',
};

const FOOD_CATEGORIES = [
  'Royal Thalis',
  'Starters & Kebabs',
  'Main Course',
  'Biryani & Rice',
  'Tandoor & Breads',
  'Chaats & Street Food',
  'Beverages & Lassi',
  'Desserts',
];

export default function AdminRestaurantManagementPage() {
  const [activeTab, setActiveTab] = useState<'items' | 'settings'>('items');
  const [settingsForm, setSettingsForm] = useState<any>(DEFAULT_RESTAURANT_SETTINGS);
  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingItemImage, setUploadingItemImage] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Item Modal (Add / Edit)
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemForm, setItemForm] = useState({
    productName: '',
    slug: '',
    foodCategory: 'Main Course',
    category: '',
    shortDescription: '',
    description: '',
    basePrice: 300,
    discountPercentage: 0,
    dietary: 'VEG' as 'VEG' | 'NON_VEG',
    spiceLevel: 'Medium' as 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy' | 'None',
    preparationTime: '15-20 mins',
    servingSize: 'Serves 1-2',
    weightUnit: 'portion',
    stockQuantity: 100,
    isChefSpecial: false,
    isFeatured: false,
    isBestSeller: false,
    availableForInstant: true,
    availableForAdvance: true,
    isActive: true,
    ingredientsStr: '',
    shelfLife: 'Best consumed fresh upon delivery',
    imageUrl: '',
  });

  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const itemFileInputRef = useRef<HTMLInputElement>(null);

  const fetchFoodsAndSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, foodsRes, catsRes] = await Promise.all([
        api.get('/settings').catch(() => ({ data: {} })),
        api.get('/products?isRestaurantFood=true&includeInactive=true&limit=100').catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] })),
      ]);

      if (settingsRes.data) {
        setSettingsForm((prev: any) => ({
          ...prev,
          ...settingsRes.data,
        }));
      }

      const foodItems = Array.isArray(foodsRes.data)
        ? foodsRes.data
        : foodsRes.data?.products || [];
      setFoods(foodItems);
      setCategories(catsRes.data || []);
    } catch (err: any) {
      console.error('Failed to load restaurant data:', err);
      setErrorMsg('Failed to load restaurant data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodsAndSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.put('/settings', settingsForm);
      if (res.success) {
        setSuccessMsg('Restaurant page and homepage section settings updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingHero(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.upload('/products/upload-image', formData);
      if (res.success && res.data?.url) {
        setSettingsForm((prev: any) => ({
          ...prev,
          restaurantHeroImageUrl: res.data.url,
        }));
        setSuccessMsg('Hero image uploaded successfully! Click "Save Settings" to persist.');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setErrorMsg('Failed to upload image. You can also paste an image URL directly.');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingItemImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.upload('/products/upload-image', formData);
      if (res.success && res.data?.url) {
        setItemForm((prev) => ({
          ...prev,
          imageUrl: res.data.url,
        }));
      }
    } catch (err: any) {
      console.error('Item image upload failed:', err);
      alert('Failed to upload image. You can paste an image URL directly.');
    } finally {
      setUploadingItemImage(false);
    }
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    let defaultCatId = '';
    const restaurantCat = categories.find((c) => c.slug === 'restaurant-food');
    if (restaurantCat) defaultCatId = restaurantCat._id;
    else if (categories.length > 0) defaultCatId = categories[0]._id;

    setItemForm({
      productName: '',
      slug: '',
      foodCategory: 'Main Course',
      category: defaultCatId,
      shortDescription: '',
      description: '',
      basePrice: 320,
      discountPercentage: 0,
      dietary: 'VEG',
      spiceLevel: 'Medium',
      preparationTime: '15-20 mins',
      servingSize: 'Serves 1-2',
      weightUnit: 'portion',
      stockQuantity: 100,
      isChefSpecial: false,
      isFeatured: false,
      isBestSeller: false,
      availableForInstant: true,
      availableForAdvance: true,
      isActive: true,
      ingredientsStr: 'Fresh Cottage Cheese, Onion, Tomato, Royal Spices, A2 Desi Cow Ghee',
      shelfLife: 'Best consumed fresh upon arrival',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=85',
    });
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: any) => {
    setEditingItem(item);
    const primaryImg =
      item.productImages?.find((img: any) => img.isPrimary)?.url ||
      item.productImages?.[0]?.url ||
      '';

    setItemForm({
      productName: item.productName || '',
      slug: item.slug || '',
      foodCategory: item.foodCategory || 'Main Course',
      category: item.category?._id || item.category || '',
      shortDescription: item.shortDescription || '',
      description: item.description || '',
      basePrice: item.basePrice || 0,
      discountPercentage: item.discountPercentage || 0,
      dietary: item.dietary || 'VEG',
      spiceLevel: item.spiceLevel || 'Medium',
      preparationTime: item.preparationTime || '15-20 mins',
      servingSize: item.servingSize || 'Serves 1-2',
      weightUnit: item.weightUnit || 'portion',
      stockQuantity: item.stockQuantity || 100,
      isChefSpecial: item.isChefSpecial || false,
      isFeatured: item.isFeatured || false,
      isBestSeller: item.isBestSeller || false,
      availableForInstant: item.availableForInstant !== false,
      availableForAdvance: item.availableForAdvance !== false,
      isActive: item.isActive !== false,
      ingredientsStr: (item.ingredients || []).join(', '),
      shelfLife: item.shelfLife || 'Best consumed fresh upon arrival',
      imageUrl: primaryImg,
    });
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.productName.trim()) {
      alert('Please enter a dish name.');
      return;
    }

    try {
      const ingredientsArray = itemForm.ingredientsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const calculatedFinalPrice = Math.round(
        itemForm.basePrice * (1 - (itemForm.discountPercentage || 0) / 100)
      );

      const payload: any = {
        productName: itemForm.productName.trim(),
        slug: itemForm.slug.trim() || undefined,
        foodCategory: itemForm.foodCategory,
        category: itemForm.category || categories[0]?._id,
        shortDescription: itemForm.shortDescription,
        description: itemForm.description || itemForm.shortDescription || itemForm.productName,
        basePrice: Number(itemForm.basePrice),
        discountPercentage: Number(itemForm.discountPercentage || 0),
        finalPrice: calculatedFinalPrice,
        dietary: itemForm.dietary,
        spiceLevel: itemForm.spiceLevel,
        preparationTime: itemForm.preparationTime,
        servingSize: itemForm.servingSize,
        weightUnit: itemForm.weightUnit,
        stockQuantity: Number(itemForm.stockQuantity || 100),
        isChefSpecial: itemForm.isChefSpecial,
        isFeatured: itemForm.isFeatured,
        isBestSeller: itemForm.isBestSeller,
        availableForInstant: itemForm.availableForInstant,
        availableForAdvance: itemForm.availableForAdvance,
        isActive: itemForm.isActive,
        isRestaurantFood: true,
        ingredients: ingredientsArray,
        shelfLife: itemForm.shelfLife,
        productImages: itemForm.imageUrl
          ? [{ url: itemForm.imageUrl, isPrimary: true }]
          : [
              {
                url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=85',
                isPrimary: true,
              },
            ],
      };

      if (editingItem) {
        const res = await api.put(`/products/${editingItem._id}`, payload);
        if (res.success) {
          setSuccessMsg(`"${itemForm.productName}" updated successfully!`);
          setItemModalOpen(false);
          fetchFoodsAndSettings();
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.success) {
          setSuccessMsg(`"${itemForm.productName}" created successfully!`);
          setItemModalOpen(false);
          fetchFoodsAndSettings();
        }
      }
    } catch (err: any) {
      console.error('Failed to save food item:', err);
      alert(err.message || 'Failed to save food item.');
    }
  };

  const handleDeleteItem = async (item: any) => {
    if (!confirm(`Are you sure you want to delete "${item.productName}" from the Restaurant Menu?`)) {
      return;
    }

    try {
      const res = await api.delete(`/products/${item._id}`);
      if (res.success) {
        setSuccessMsg(`"${item.productName}" removed.`);
        setFoods((prev) => prev.filter((p) => p._id !== item._id));
      }
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item.');
    }
  };

  const handleQuickToggle = async (item: any, field: 'isActive' | 'isChefSpecial' | 'isFeatured') => {
    try {
      const updatedVal = !item[field];
      const res = await api.put(`/products/${item._id}`, { [field]: updatedVal });
      if (res.success) {
        setFoods((prev) =>
          prev.map((p) => (p._id === item._id ? { ...p, [field]: updatedVal } : p))
        );
      }
    } catch (err) {
      console.error('Quick toggle failed:', err);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('This will seed the 10 Royal Heritage dishes if not already present. Continue?')) {
      return;
    }
    try {
      setLoading(true);
      await api.post('/products/seed-restaurant', {});
      setSuccessMsg('Royal dishes verified and seeded successfully!');
      fetchFoodsAndSettings();
    } catch (err: any) {
      console.error('Seed failed:', err);
      alert('Failed to seed dishes.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter((item) => {
    if (categoryFilter !== 'All') {
      if (categoryFilter === 'Chef Specials') {
        if (!item.isChefSpecial) return false;
      } else if (!item.foodCategory || item.foodCategory.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchesName = item.productName?.toLowerCase().includes(q);
      const matchesCategory = item.foodCategory?.toLowerCase().includes(q);
      if (!matchesName && !matchesCategory) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Operations & Dining Suite
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Restaurant Food & Menu Management
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Manage your gourmet kitchen dishes, pricing, chef specials, and customize the Restaurant Food page & homepage showcase.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/restaurant"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          <button
            onClick={openAddItemModal}
            className="px-4 py-2 rounded-xl gold-gradient text-royal-950 text-xs font-bold shadow-gold-sm flex items-center gap-1.5 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Food Item</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'items'
              ? 'bg-royal-950 text-white shadow-md'
              : 'text-stone-600 hover:text-royal-950 hover:bg-stone-200/60'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Food Items Catalog ({foods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'settings'
              ? 'bg-royal-950 text-white shadow-md'
              : 'text-stone-600 hover:text-royal-950 hover:bg-stone-200/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Page & Hero Settings</span>
        </button>
      </div>

      {/* TAB 1: FOOD ITEMS CATALOG */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dishes or categories..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-stone-700 text-xs py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500"
              >
                <option value="All">All Courses</option>
                <option value="Chef Specials">👑 Chef Specials Only</option>
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={handleSeedDefaults}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1.5 transition-colors"
                title="Populate royal recipe defaults if collection is empty"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Seed Royal Dishes</span>
              </button>

              <button
                onClick={fetchFoodsAndSettings}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                title="Refresh List"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Food Items Table / Cards */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
              <p className="text-stone-500 text-xs">Loading restaurant dishes...</p>
            </div>
          ) : filteredFoods.length > 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Dish</th>
                      <th className="py-3 px-3">Course</th>
                      <th className="py-3 px-3">Spice & Time</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3 text-center">Chef Special</th>
                      <th className="py-3 px-3 text-center">Home Feature</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredFoods.map((item) => {
                      const imgUrl =
                        item.productImages?.find((img: any) => img.isPrimary)?.url ||
                        item.productImages?.[0]?.url ||
                        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=150&q=80';

                      return (
                        <tr key={item._id} className="hover:bg-amber-50/30 transition-colors">
                          {/* Dish info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={imgUrl}
                                alt={item.productName}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`w-2 h-2 rounded-full inline-block ${
                                      item.dietary === 'NON_VEG' ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`}
                                  />
                                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                                    {item.productName}
                                  </h4>
                                </div>
                                <p className="text-[11px] text-stone-400 truncate max-w-xs mt-0.5">
                                  {item.shortDescription || item.description || 'Royal kitchen delicacy'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Course Category */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              {item.foodCategory || 'Delicacy'}
                            </span>
                          </td>

                          {/* Spice & Time */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5 text-[11px]">
                              <span className="text-stone-600 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-red-500" />
                                {item.spiceLevel || 'Medium'}
                              </span>
                              <span className="text-stone-400 flex items-center gap-1 text-[10px]">
                                <Clock className="w-3 h-3 text-stone-400" />
                                {item.preparationTime || '15-20m'}
                              </span>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3 whitespace-nowrap font-serif font-bold text-stone-900">
                            <div>
                              <span>{formatPrice(item.finalPrice)}</span>
                              {item.discountPercentage > 0 && (
                                <span className="block text-[10px] text-stone-400 line-through">
                                  {formatPrice(item.basePrice)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Chef Special Toggle */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleQuickToggle(item, 'isChefSpecial')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                item.isChefSpecial
                                  ? 'bg-amber-100 text-amber-700 font-bold'
                                  : 'text-stone-300 hover:text-stone-500'
                              }`}
                              title={item.isChefSpecial ? 'Chef Signature' : 'Mark as Chef Signature'}
                            >
                              <Sparkles className="w-4 h-4 fill-current" />
                            </button>
                          </td>

                          {/* Home Feature Toggle */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleQuickToggle(item, 'isFeatured')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                item.isFeatured
                                  ? 'bg-gold-100 text-gold-700 font-bold'
                                  : 'text-stone-300 hover:text-stone-500'
                              }`}
                              title={item.isFeatured ? 'Featured on Home' : 'Feature on Home'}
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                          </td>

                          {/* Active / Inactive Status */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleQuickToggle(item, 'isActive')}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.isActive !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {item.isActive !== false ? 'Active' : 'Hidden'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditItemModal(item)}
                                className="p-1.5 rounded-lg text-stone-600 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                                title="Edit Dish"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Dish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
              <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-serif font-bold text-stone-700">No dishes in this category</p>
              <button
                onClick={openAddItemModal}
                className="mt-3 px-4 py-2 rounded-xl gold-gradient text-royal-950 font-bold text-xs"
              >
                Add Your First Dish
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAGE & HERO SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Main Restaurant Hero Banner Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Restaurant Page Hero & Header
                </h3>
                <p className="text-xs text-stone-500">
                  Configure the hero banner displayed at the top of <code>/restaurant</code>.
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs tracking-wider uppercase shadow-gold-sm hover:scale-105 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Badge Text */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Hero Badge Text
                </label>
                <input
                  type="text"
                  value={settingsForm.restaurantBadgeText || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantBadgeText: e.target.value })
                  }
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. Shree Mithai Royal Kitchen & Dining"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Table & Takeaway Phone
                </label>
                <input
                  type="text"
                  value={settingsForm.restaurantContactPhone || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantContactPhone: e.target.value })
                  }
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={settingsForm.restaurantHeroTitle || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantHeroTitle: e.target.value })
                  }
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500 font-serif"
                  placeholder="e.g. Master Royal Dining & Artisanal Delicacies"
                />
              </div>

              {/* Subtitle */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Hero Subtitle
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.restaurantHeroSubtitle || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantHeroSubtitle: e.target.value })
                  }
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="Describe your kitchen, cooking techniques, pure ghee..."
                />
              </div>

              {/* Opening Hours */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Opening Hours / Dining Timings
                </label>
                <input
                  type="text"
                  value={settingsForm.restaurantOpeningHours || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantOpeningHours: e.target.value })
                  }
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. 11:00 AM – 11:00 PM Daily"
                />
              </div>

              {/* Dining Notice */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Delivery / Dining Notice Banner
                </label>
                <input
                  type="text"
                  value={settingsForm.restaurantDiningNotice || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantDiningNotice: e.target.value })
                  }
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. Instant doorstep delivery in 35-45 mins or reserved dining"
                />
              </div>

              {/* Hero Image */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  Hero Background Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settingsForm.restaurantHeroImageUrl || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        restaurantHeroImageUrl: e.target.value,
                      })
                    }
                    className="flex-1 text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500 font-mono"
                    placeholder="https://..."
                  />

                  <input
                    type="file"
                    ref={heroFileInputRef}
                    onChange={handleHeroImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => heroFileInputRef.current?.click()}
                    disabled={uploadingHero}
                    className="px-4 py-2.5 rounded-xl bg-royal-950 text-white text-xs font-semibold hover:bg-royal-900 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingHero ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                </div>

                {settingsForm.restaurantHeroImageUrl && (
                  <div className="h-32 rounded-xl overflow-hidden border border-stone-200 mt-2 relative">
                    <img
                      src={settingsForm.restaurantHeroImageUrl}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4 Feature Pillars Settings */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Culinary Value Highlights (4 Badges)
            </h3>
            <p className="text-xs text-stone-500">
              These 4 value highlight cards appear right below the hero banner.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Feature 1</span>
                <input
                  type="text"
                  value={settingsForm.restaurantFeature1Title || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantFeature1Title: e.target.value })
                  }
                  className="w-full p-2 text-xs font-bold rounded-lg border border-stone-200 bg-white"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={settingsForm.restaurantFeature1Subtitle || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantFeature1Subtitle: e.target.value })
                  }
                  className="w-full p-2 text-[11px] rounded-lg border border-stone-200 bg-white"
                  placeholder="Subtitle"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Feature 2</span>
                <input
                  type="text"
                  value={settingsForm.restaurantFeature2Title || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantFeature2Title: e.target.value })
                  }
                  className="w-full p-2 text-xs font-bold rounded-lg border border-stone-200 bg-white"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={settingsForm.restaurantFeature2Subtitle || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantFeature2Subtitle: e.target.value })
                  }
                  className="w-full p-2 text-[11px] rounded-lg border border-stone-200 bg-white"
                  placeholder="Subtitle"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-gold-800 uppercase">Feature 3</span>
                <input
                  type="text"
                  value={settingsForm.restaurantFeature3Title || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantFeature3Title: e.target.value })
                  }
                  className="w-full p-2 text-xs font-bold rounded-lg border border-stone-200 bg-white"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={settingsForm.restaurantFeature3Subtitle || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantFeature3Subtitle: e.target.value })
                  }
                  className="w-full p-2 text-[11px] rounded-lg border border-stone-200 bg-white"
                  placeholder="Subtitle"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Feature 4</span>
                <input
                  type="text"
                  value={settingsForm.restaurantFeature4Title || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantFeature4Title: e.target.value })
                  }
                  className="w-full p-2 text-xs font-bold rounded-lg border border-stone-200 bg-white"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={settingsForm.restaurantFeature4Subtitle || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantFeature4Subtitle: e.target.value })
                  }
                  className="w-full p-2 text-[11px] rounded-lg border border-stone-200 bg-white"
                  placeholder="Subtitle"
                />
              </div>
            </div>
          </div>

          {/* Homepage Section Settings */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Homepage Section Settings
            </h3>
            <p className="text-xs text-stone-500">
              Customize how the Restaurant Food section appears on the homepage (<code>/</code>).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Homepage Section Badge
                </label>
                <input
                  type="text"
                  value={settingsForm.homeRestaurantBadge || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, homeRestaurantBadge: e.target.value })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                  placeholder="e.g. Chef's Gourmet Kitchen"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Homepage Section Title
                </label>
                <input
                  type="text"
                  value={settingsForm.homeRestaurantTitle || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, homeRestaurantTitle: e.target.value })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-serif font-bold"
                  placeholder="e.g. Royal Restaurant Dining & Delicacies"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Homepage Section Subtitle
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.homeRestaurantSubtitle || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, homeRestaurantSubtitle: e.target.value })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                  placeholder="Section description..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={settingsForm.homeRestaurantBtnText || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, homeRestaurantBtnText: e.target.value })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                  placeholder="Explore Full Restaurant Menu"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notice / Delivery Tag
                </label>
                <input
                  type="text"
                  value={settingsForm.homeRestaurantNotice || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, homeRestaurantNotice: e.target.value })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                  placeholder="Instant Doorstep Delivery in 30-45 Mins"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:scale-105 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ITEM MODAL */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-royal-950 font-bold">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    {editingItem ? `Edit: ${editingItem.productName}` : 'Add New Restaurant Dish'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Fill in dish details, course category, pricing, spice level, and imagery.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setItemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Scrollable */}
            <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dish Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.productName}
                    onChange={(e) => setItemForm({ ...itemForm, productName: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium"
                    placeholder="e.g. Maharaja Grand Royal Thali"
                  />
                </div>

                {/* Course Category */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Course Category *
                  </label>
                  <select
                    value={itemForm.foodCategory}
                    onChange={(e) => setItemForm({ ...itemForm, foodCategory: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  >
                    {FOOD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dietary */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Dietary Classification *
                  </label>
                  <select
                    value={itemForm.dietary}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, dietary: e.target.value as 'VEG' | 'NON_VEG' })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  >
                    <option value="VEG">🟢 100% Pure Vegetarian</option>
                    <option value="NON_VEG">🔴 Non-Vegetarian</option>
                  </select>
                </div>

                {/* Spice Level */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Spice Level
                  </label>
                  <select
                    value={itemForm.spiceLevel}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        spiceLevel: e.target.value as any,
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  >
                    <option value="None">None (Sweet / Beverage)</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Extra Spicy">Extra Hot</option>
                  </select>
                </div>

                {/* Preparation Time */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    placeholder="e.g. 15-20 mins"
                  />
                </div>

                {/* Serving Size */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Serving Size / Portion
                  </label>
                  <input
                    type="text"
                    value={itemForm.servingSize}
                    onChange={(e) => setItemForm({ ...itemForm, servingSize: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    placeholder="e.g. Serves 1-2, 6 Pieces"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Daily Batch Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.stockQuantity}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, stockQuantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                  />
                </div>

                {/* Base Price */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={itemForm.basePrice}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, basePrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-semibold"
                  />
                </div>

                {/* Discount % */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={itemForm.discountPercentage}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        discountPercentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                  />
                </div>

                {/* Short Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Short Description (1-2 sentences)
                  </label>
                  <input
                    type="text"
                    value={itemForm.shortDescription}
                    onChange={(e) => setItemForm({ ...itemForm, shortDescription: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    placeholder="Crispy charcoal-smoked cottage cheese cubes..."
                  />
                </div>

                {/* Full Description / Chef Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Description / Chef Tasting Notes
                  </label>
                  <textarea
                    rows={3}
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    placeholder="Elaborate on spices, authentic preparations..."
                  />
                </div>

                {/* Ingredients */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ingredients (comma separated)
                  </label>
                  <input
                    type="text"
                    value={itemForm.ingredientsStr}
                    onChange={(e) => setItemForm({ ...itemForm, ingredientsStr: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    placeholder="Fresh Paneer, Hung Curd, Degi Mirch, A2 Desi Cow Ghee"
                  />
                </div>

                {/* Image URL with Upload Button */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    Dish Photo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={itemForm.imageUrl}
                      onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                      className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                      placeholder="https://..."
                    />

                    <input
                      type="file"
                      ref={itemFileInputRef}
                      onChange={handleItemImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => itemFileInputRef.current?.click()}
                      disabled={uploadingItemImage}
                      className="px-3 py-2 rounded-xl bg-stone-800 text-white text-xs font-semibold hover:bg-stone-900 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingItemImage ? 'Uploading...' : 'Upload'}</span>
                    </button>
                  </div>

                  {itemForm.imageUrl && (
                    <div className="h-24 w-36 rounded-xl overflow-hidden border border-stone-200 mt-1">
                      <img
                        src={itemForm.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={itemForm.isChefSpecial}
                      onChange={(e) => setItemForm({ ...itemForm, isChefSpecial: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Chef&apos;s Special</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={itemForm.isFeatured}
                      onChange={(e) => setItemForm({ ...itemForm, isFeatured: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Featured on Home</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={itemForm.isBestSeller}
                      onChange={(e) => setItemForm({ ...itemForm, isBestSeller: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={itemForm.isActive}
                      onChange={(e) => setItemForm({ ...itemForm, isActive: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Active in Menu</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-stone-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:scale-105 transition-all"
                >
                  {editingItem ? 'Update Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
