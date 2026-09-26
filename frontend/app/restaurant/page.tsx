'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  Clock,
  Phone,
  Calendar,
  UtensilsCrossed,
  ChefHat,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Award,
  Truck,
  HeartHandshake,
  Star,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { api } from '../../lib/api';
import RestaurantFoodCard, { RestaurantFoodItem } from '../../components/RestaurantFoodCard';
import { useCartStore } from '../../store/cartStore';

const COURSE_CATEGORIES = [
  'All',
  'Chef Specials',
  'Royal Thalis',
  'Starters & Kebabs',
  'Main Course',
  'Biryani & Rice',
  'Tandoor & Breads',
  'Chaats & Street Food',
  'Beverages & Lassi',
  'Desserts',
];

export default function RestaurantPage() {
  const [foods, setFoods] = useState<RestaurantFoodItem[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [spiceFilter, setSpiceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { getItemCount, getSubtotal } = useCartStore();

  const cartCount = getItemCount();
  const cartSubtotal = getSubtotal();

  useEffect(() => {
    Promise.all([
      api.get('/products/restaurant-food').catch(() => ({ data: [] })),
      api.get('/settings').catch(() => ({ data: {} })),
    ])
      .then(([foodRes, settingsRes]) => {
        setFoods(foodRes.data || []);
        setSettings(settingsRes.data || {});
      })
      .finally(() => setLoading(false));
  }, []);

  const heroData = {
    badgeText: settings?.restaurantBadgeText || 'Shree Mithai Royal Kitchen & Dining',
    title: settings?.restaurantHeroTitle || 'Master Royal Dining & Artisanal Delicacies',
    subtitle:
      settings?.restaurantHeroSubtitle ||
      'Savor royal Awadhi & Rajputana gourmet dishes prepared fresh by master khansamas using fragrant hand-pounded spices, slow-dum clay handis, and pure A2 Desi Cow Ghee.',
    imageUrl:
      settings?.restaurantHeroImageUrl ||
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=85',
    openingHours: settings?.restaurantOpeningHours || '11:00 AM – 11:00 PM Daily',
    contactPhone: settings?.restaurantContactPhone || '+91 98765 43210',
    diningNotice:
      settings?.restaurantDiningNotice ||
      'Freshly prepared to order. Instant doorstep delivery within 35-45 mins or reserved dining at our Heritage Hall.',
    feature1Title: settings?.restaurantFeature1Title || 'Live Clay Tandoor',
    feature1Subtitle: settings?.restaurantFeature1Subtitle || 'Charcoal smoked breads & kebabs',
    feature2Title: settings?.restaurantFeature2Title || 'Slow-Dum Handi',
    feature2Subtitle: settings?.restaurantFeature2Subtitle || '24-hr gentle simmered gravies',
    feature3Title: settings?.restaurantFeature3Title || '100% Desi Cow Ghee',
    feature3Subtitle: settings?.restaurantFeature3Subtitle || 'Pure certified A2 clarified butter',
    feature4Title: settings?.restaurantFeature4Title || 'Express Hot Delivery',
    feature4Subtitle: settings?.restaurantFeature4Subtitle || 'Piping hot in thermal insulated bags',
  };

  // Filter food items
  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      // Category filter
      if (activeCategory === 'Chef Specials') {
        if (!item.isChefSpecial) return false;
      } else if (activeCategory !== 'All') {
        if (
          !item.foodCategory ||
          item.foodCategory.toLowerCase() !== activeCategory.toLowerCase()
        ) {
          return false;
        }
      }

      // Dietary filter
      if (dietaryFilter !== 'ALL') {
        if (item.dietary !== dietaryFilter) return false;
      }

      // Spice filter
      if (spiceFilter !== 'ALL') {
        if (item.spiceLevel !== spiceFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.productName.toLowerCase().includes(query);
        const matchesDesc = (item.description || item.shortDescription || '')
          .toLowerCase()
          .includes(query);
        const matchesCategory = (item.foodCategory || '').toLowerCase().includes(query);
        const matchesIngredients = (item.ingredients || []).some((ing) =>
          ing.toLowerCase().includes(query)
        );

        if (!matchesName && !matchesDesc && !matchesCategory && !matchesIngredients) {
          return false;
        }
      }

      return true;
    });
  }, [foods, activeCategory, dietaryFilter, spiceFilter, searchQuery]);

  return (
    <div className="space-y-12 sm:space-y-20 pb-20">
      {/* Royal Restaurant Hero Banner */}
      <section className="relative overflow-hidden bg-royal-950 text-white min-h-[520px] sm:min-h-[580px] flex items-center">
        {/* Background Image with culinary ambiance overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroData.imageUrl}
            alt="Royal Restaurant Kitchen"
            className="w-full h-full object-cover object-center opacity-30 filter brightness-75 scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-royal-950 via-royal-950/85 to-royal-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-transparent to-black/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10 w-full">
          <div className="max-w-3xl space-y-6">
            {/* Royal Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md">
              <ChefHat className="w-4 h-4 text-gold-400" />
              <span>{heroData.badgeText}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              {heroData.title}
            </h1>

            {/* Subtitle */}
            <p className="text-stone-300 text-sm sm:text-lg leading-relaxed max-w-2xl">
              {heroData.subtitle}
            </p>

            {/* Live info pill bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-200">
              <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                <span>{heroData.openingHours}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-400/30 backdrop-blur-sm">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>35-45 Min Express Delivery</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                <Phone className="w-3.5 h-3.5 text-gold-400" />
                <span>Table & Takeaway: {heroData.contactPhone}</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <a
                href="#menu-section"
                className="px-8 py-3.5 rounded-full gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase shadow-gold-md hover:scale-105 transition-all flex items-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Order Dining Specials</span>
              </a>

              <Link
                href="/cart"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-gold-400" />
                <span>View Cart ({cartCount})</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Value Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 bg-white p-5 sm:p-7 rounded-2xl shadow-xl border border-stone-200/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <Flame className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                {heroData.feature1Title}
              </h4>
              <p className="text-[11px] text-stone-500">
                {heroData.feature1Subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-rose-800 shrink-0">
              <UtensilsCrossed className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                {heroData.feature2Title}
              </h4>
              <p className="text-[11px] text-stone-500">
                {heroData.feature2Subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gold-100 flex items-center justify-center text-gold-800 shrink-0">
              <ShieldCheck className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                {heroData.feature3Title}
              </h4>
              <p className="text-[11px] text-stone-500">
                {heroData.feature3Subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <Truck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                {heroData.feature4Title}
              </h4>
              <p className="text-[11px] text-stone-500">
                {heroData.feature4Subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Culinary Menu Section */}
      <section id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block mb-1">
              Fresh Live Kitchen
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-royal-950">
              Royal Dining & Food Delicacies
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-xl">
              Prepared fresh upon order with pure ingredients. Choose from royal thalis, charcoal tandoori appetizers, rich gravies, and fragrant biryanis.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thali, biryani, paneer..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-stone-800 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Course Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x mb-6">
          {COURSE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 snap-start ${
                  isActive
                    ? 'gold-gradient text-royal-950 shadow-gold-sm scale-102'
                    : 'bg-white text-stone-600 hover:text-royal-950 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat === 'Chef Specials' ? '👑 Chef Specials' : cat}
              </button>
            );
          })}
        </div>

        {/* Sub-Filters: Dietary & Spice Level */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 mb-8 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-stone-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Dietary:
            </span>

            <button
              onClick={() => setDietaryFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                dietaryFilter === 'ALL'
                  ? 'bg-royal-950 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              All Items
            </button>

            <button
              onClick={() => setDietaryFilter('VEG')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                dietaryFilter === 'VEG'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>100% Pure Veg</span>
            </button>

            <button
              onClick={() => setDietaryFilter('NON_VEG')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                dietaryFilter === 'NON_VEG'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Non-Vegetarian</span>
            </button>
          </div>

          {/* Spice Filter */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-semibold">Spice Level:</span>
            <select
              value={spiceFilter}
              onChange={(e) => setSpiceFilter(e.target.value)}
              className="bg-white border border-stone-200 text-stone-800 text-xs py-1 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
            >
              <option value="ALL">Any Spice</option>
              <option value="Mild">Mild</option>
              <option value="Medium">Medium</option>
              <option value="Spicy">Spicy</option>
              <option value="Extra Spicy">Extra Hot</option>
            </select>
          </div>
        </div>

        {/* Food Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 bg-stone-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredFoods.map((item) => (
              <RestaurantFoodCard key={item._id} food={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
            <UtensilsCrossed className="w-12 h-12 text-gold-600 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-900 text-lg">No Dishes Found</h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              No restaurant items match your current filter selection. Try selecting another course category or clearing the search query.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setDietaryFilter('ALL');
                setSpiceFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Royal Table Dining & Private Catering Reservation Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-royal-950 text-white border-2 border-gold-600/40 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="p-8 sm:p-12 lg:p-14 space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider border border-gold-400/30">
                <ChefHat className="w-3.5 h-3.5 text-gold-400" />
                <span>Reserve Dining & Grand Catering</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Dine In Royal Rajputana Grandeur
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Experience authentic silver service and royal thalis at our Heritage Dining Hall in Jaipur, or book our Master Khansamas for live catering at your auspicious wedding and family celebrations.
              </p>

              <div className="space-y-2 text-xs sm:text-sm text-stone-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Live Clay Tandoor & Chaat Counters for Events</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Table reservations for family gatherings and festive celebrations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Thermal-insulated express delivery straight from kitchen to doorstep</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={`tel:${heroData.contactPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase shadow-gold-md hover:scale-105 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call to Reserve: {heroData.contactPhone}</span>
                </a>

                <Link
                  href="/event-booking"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-all"
                >
                  <Calendar className="w-4 h-4 text-gold-400" />
                  <span>Event Catering Details</span>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[380px]">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85"
                alt="Royal Dining Table"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent via-royal-950/40 to-royal-950" />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom Cart Bar if items added */}
      {cartCount > 0 && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-royal-950 text-white rounded-2xl p-4 shadow-2xl border-2 border-gold-500/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gold-gradient text-royal-950 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gold-300">
                  {cartCount} item{cartCount > 1 ? 's' : ''} in your order
                </p>
                <p className="font-serif text-sm font-bold text-white">
                  Subtotal: ₹{cartSubtotal}
                </p>
              </div>
            </div>

            <Link
              href="/cart"
              className="px-4 py-2 rounded-xl gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-gold-sm hover:scale-105 transition-all"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
