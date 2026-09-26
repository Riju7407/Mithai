'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Calendar,
  Gift,
  Award,
  ChevronRight,
  ChevronLeft,
  Star,
  ChefHat,
  UtensilsCrossed,
  Flame,
  Clock,
} from 'lucide-react';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import RestaurantFoodCard from '../components/RestaurantFoodCard';

export default function HomePage() {
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellerHampers, setBestSellerHampers] = useState<any[]>([]);
  const [restaurantFoods, setRestaurantFoods] = useState<any[]>([]);
  const [activeRestaurantTab, setActiveRestaurantTab] = useState<string>('All');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auto-moving carousel state and ref for Explore by Confectionery
  const categoryCarouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Auto-moving carousel state and ref for Best Selling Hampers
  const hampersCarouselRef = useRef<HTMLDivElement>(null);
  const [isHampersPaused, setIsHampersPaused] = useState(false);

  useEffect(() => {
    if (categories.length <= 1 || isCarouselPaused) return;

    const interval = setInterval(() => {
      if (!categoryCarouselRef.current) return;
      const el = categoryCarouselRef.current;
      const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : 180;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [categories, isCarouselPaused]);

  useEffect(() => {
    if (bestSellerHampers.length <= 1 || isHampersPaused) return;

    const interval = setInterval(() => {
      if (!hampersCarouselRef.current) return;
      const el = hampersCarouselRef.current;
      const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : 220;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bestSellerHampers, isHampersPaused]);

  const scrollCategoryCarousel = (direction: 'left' | 'right') => {
    if (!categoryCarouselRef.current) return;
    const el = categoryCarouselRef.current;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : 180;
    el.scrollBy({
      left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
      behavior: 'smooth',
    });
  };

  const scrollHampersCarousel = (direction: 'left' | 'right') => {
    if (!hampersCarouselRef.current) return;
    const el = hampersCarouselRef.current;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : 220;
    el.scrollBy({
      left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    Promise.all([
      api.get('/banners?type=HERO').catch(() => ({ data: [] })),
      api.get('/categories').catch(() => ({ data: [] })),
      api.get('/products/featured').catch(() => ({ data: [] })),
      api.get('/products/best-sellers').catch(() => ({ data: [] })),
      api.get('/products/restaurant-food').catch(() => ({ data: [] })),
      api.get('/reviews/testimonials').catch(() => ({ data: [] })),
      api.get('/settings').catch(() => ({ data: {} })),
    ])
      .then(([bannersRes, catsRes, productsRes, hampersRes, restaurantRes, testimonialsRes, settingsRes]) => {
        setHeroBanners(bannersRes.data || []);
        setCategories(catsRes.data || []);
        setFeaturedProducts(productsRes.data || []);
        setBestSellerHampers(hampersRes.data || []);
        setRestaurantFoods(restaurantRes.data || []);
        setTestimonials(testimonialsRes.data || []);
        setSettings(settingsRes.data || {});
      })
      .finally(() => setLoading(false));
  }, []);

  const hero = {
    badgeText: settings?.heroBadgeText || 'Royal Indian Confectionery Since 1952',
    title: settings?.heroTitle || heroBanners[0]?.title || 'Grand Heritage Confectionery & Sweets',
    subtitle:
      settings?.heroSubtitle ||
      heroBanners[0]?.subtitle ||
      'Handcrafted with centuries of royal halwai recipes, pure A2 Desi Cow Ghee and Kashmiri Saffron.',
    imageUrl:
      settings?.heroImageUrl ||
      heroBanners[0]?.imageUrl ||
      'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1600&q=85',
    buttonText: settings?.heroPrimaryBtnText || heroBanners[0]?.buttonText || 'Order Fresh Now',
    link: settings?.heroPrimaryBtnLink || heroBanners[0]?.link || '/shop',
    secondaryBtnText: settings?.heroSecondaryBtnText || 'Advance Event Catering',
    secondaryBtnLink: settings?.heroSecondaryBtnLink || '/event-booking',
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-royal-950 text-white min-h-[500px] sm:min-h-[600px] flex items-center">
        {/* Background Image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={hero.imageUrl}
            alt={hero.title}
            className="w-full h-full object-cover object-center opacity-35 filter brightness-75 scale-105 animate-pulse duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-royal-950 via-royal-950/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>{hero.badgeText}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              {hero.title}
            </h1>

            <p className="text-stone-300 text-sm sm:text-lg leading-relaxed max-w-xl">
              {hero.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={hero.link || '/shop'}
                className="px-7 py-3.5 rounded-full gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase shadow-gold-md hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>{hero.buttonText || 'Explore Sweets'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={hero.secondaryBtnLink || '/event-booking'}
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-gold-400" />
                <span>{hero.secondaryBtnText || 'Advance Event Catering'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Pillars / Value Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 bg-white p-5 sm:p-7 rounded-2xl shadow-lg border border-stone-200/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                {settings?.feature1Title || '100% Desi Ghee'}
              </h4>
              <p className="text-[11px] text-stone-500">
                {settings?.feature1Subtitle || 'Pure certified A2 Cow Ghee'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                {settings?.feature2Title || 'No Preservatives'}
              </h4>
              <p className="text-[11px] text-stone-500">
                {settings?.feature2Subtitle || 'Fresh daily artisan batches'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                {settings?.feature3Title || 'Same-Day Delivery'}
              </h4>
              <p className="text-[11px] text-stone-500">
                {settings?.feature3Subtitle || 'Free on orders above ₹799'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                {settings?.feature4Title || 'Event Catering'}
              </h4>
              <p className="text-[11px] text-stone-500">
                {settings?.feature4Subtitle || 'Bespoke bulk boxes & 30% deposit'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Auto-moving Carousel - Royal Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block mb-1">
              {settings?.catalogBadgeText || 'Royal Catalog'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-royal-950">
              {settings?.catalogTitle || 'Explore by Confectionery'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Carousel navigation controls */}
            <div className="flex items-center gap-1.5 bg-stone-100/90 p-1 rounded-full border border-stone-200/80">
              <button
                type="button"
                onClick={() => scrollCategoryCarousel('left')}
                className="w-8 h-8 rounded-full bg-white hover:bg-gold-500 hover:text-white text-stone-700 shadow-xs flex items-center justify-center transition-all"
                title="Scroll Left"
                aria-label="Scroll Categories Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategoryCarousel('right')}
                className="w-8 h-8 rounded-full bg-white hover:bg-gold-500 hover:text-white text-stone-700 shadow-xs flex items-center justify-center transition-all"
                title="Scroll Right"
                aria-label="Scroll Categories Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/categories"
              className="text-xs sm:text-sm font-bold text-gold-700 hover:text-gold-900 flex items-center gap-1 transition-colors ml-1"
            >
              <span>{settings?.catalogLinkText || 'All Categories'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Carousel Track with Auto-move & Pause on Hover */}
        <div className="relative">
          <div
            ref={categoryCarouselRef}
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            onTouchStart={() => setIsCarouselPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsCarouselPaused(false), 2500)}
            className="flex gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 px-1 scrollbar-none snap-x snap-mandatory focus:outline-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/shop?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-square w-36 sm:w-44 md:w-52 shrink-0 bg-stone-100 border border-stone-200/80 shadow-sm hover:shadow-gold-md hover:border-gold-300 transition-all flex flex-col justify-end p-3.5 text-center snap-start"
              >
                <img
                  src={cat.image?.url || 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80'}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-950/90 via-royal-950/40 to-transparent" />
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-white group-hover:text-gold-300 transition-colors drop-shadow-sm">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Showcase (Signature Sweets & Hampers) - Reduced Card Size */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block mb-1">
              Freshly Prepared
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-royal-950">
              Signature Sweets & Hampers
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-gold-700 hover:text-gold-900 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-60 bg-stone-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} compact={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-amber-50/40 rounded-3xl border border-amber-200/60 p-8">
            <Sparkles className="w-8 h-8 text-gold-600 mx-auto mb-2" />
            <p className="font-serif font-bold text-stone-800 text-base">Handcrafting Fresh Batch Confections</p>
            <p className="text-stone-500 text-xs mt-1">Our halwais are preparing fresh signature treats. Visit our shop to explore.</p>
            <Link
              href="/shop"
              className="inline-block mt-4 px-5 py-2 rounded-xl gold-gradient text-royal-950 font-bold text-xs shadow-gold-sm"
            >
              Explore Royal Shop
            </Link>
          </div>
        )}
      </section>

      {/* Royal Restaurant Food & Gourmet Kitchen Section with Hero Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Restaurant Mini Hero / Spotlight Showcase */}
        <div className="relative rounded-3xl overflow-hidden bg-royal-950 text-white border-2 border-gold-500/40 shadow-2xl">
          <div className="absolute inset-0 z-0">
            <img
              src={
                settings?.homeRestaurantBannerImage ||
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85'
              }
              alt="Royal Restaurant Kitchen"
              className="w-full h-full object-cover object-center opacity-30 filter brightness-75 scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-royal-950 via-royal-950/90 to-royal-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-transparent to-black/30" />
          </div>

          <div className="p-8 sm:p-12 lg:p-14 relative z-10">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider border border-gold-400/30 backdrop-blur-sm">
                <ChefHat className="w-3.5 h-3.5 text-gold-400" />
                <span>{settings?.homeRestaurantBadge || "Chef's Gourmet Kitchen"}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {settings?.homeRestaurantTitle || 'Royal Restaurant Dining & Delicacies'}
              </h2>

              <p className="text-stone-300 text-xs sm:text-base leading-relaxed">
                {settings?.homeRestaurantSubtitle ||
                  'Freshly prepared to order from our live clay tandoor and copper cauldrons — relish royal thalis, slow-cooked dal, and fragrant biryanis delivered piping hot.'}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-200">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Live Clay Tandoor</span>
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30 backdrop-blur-sm">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{settings?.homeRestaurantNotice || 'Express 35-45 Min Doorstep Delivery'}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                  <Clock className="w-3.5 h-3.5 text-gold-400" />
                  <span>{settings?.restaurantOpeningHours || '11:00 AM – 11:00 PM Daily'}</span>
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={settings?.homeRestaurantBtnLink || '/restaurant'}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full gold-gradient text-royal-950 font-bold text-xs sm:text-sm tracking-wider uppercase shadow-gold-md hover:scale-105 transition-all"
                >
                  <span>{settings?.homeRestaurantBtnText || 'Explore Full Restaurant Menu'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/restaurant"
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition-all"
                >
                  <UtensilsCrossed className="w-4 h-4 text-gold-400" />
                  <span>View All Dishes</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Course Tabs and Food Items Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block mb-1">
                Gourmet Hot Dining
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-royal-950">
                Chef&apos;s Signature Kitchen Specials
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none snap-x">
              {['All', 'Chef Specials', 'Royal Thalis', 'Starters & Kebabs', 'Main Course', 'Biryani & Rice'].map(
                (tab) => {
                  const isActive = activeRestaurantTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveRestaurantTab(tab)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 snap-start ${
                        isActive
                          ? 'gold-gradient text-royal-950 shadow-gold-sm'
                          : 'bg-white text-stone-600 hover:text-royal-950 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      {tab === 'Chef Specials' ? '👑 Chef Specials' : tab}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-80 bg-stone-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : restaurantFoods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {restaurantFoods
                .filter((item) => {
                  if (activeRestaurantTab === 'Chef Specials') return item.isChefSpecial;
                  if (activeRestaurantTab !== 'All') {
                    return (
                      item.foodCategory &&
                      item.foodCategory.toLowerCase() === activeRestaurantTab.toLowerCase()
                    );
                  }
                  return true;
                })
                .slice(0, 8)
                .map((food) => (
                  <RestaurantFoodCard key={food._id} food={food} />
                ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-amber-50/40 rounded-3xl border border-amber-200/60 p-6">
              <UtensilsCrossed className="w-8 h-8 text-gold-600 mx-auto mb-2" />
              <p className="font-serif font-bold text-stone-800 text-sm">Preparing Fresh Royal Kitchen Delicacies</p>
              <Link
                href="/restaurant"
                className="inline-block mt-3 px-5 py-2 rounded-xl gold-gradient text-royal-950 font-bold text-xs shadow-gold-sm"
              >
                Visit Restaurant Page
              </Link>
            </div>
          )}

          {/* Bottom CTA to view all dishes */}
          <div className="text-center pt-2">
            <Link
              href="/restaurant"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white hover:bg-gold-50 text-royal-950 font-bold text-xs sm:text-sm border border-stone-200 hover:border-gold-400 shadow-sm transition-all"
            >
              <span>Explore All Royal Dishes & Full Menu</span>
              <ArrowRight className="w-4 h-4 text-gold-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* Model B: Advance Event Booking Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-royal-950 text-white border-2 border-gold-600/40 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="p-8 sm:p-12 lg:p-16 space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider border border-gold-400/30">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                <span>Weddings & Large Events</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Plan Your Grand Auspicious Occasion
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Elevate your wedding celebration, corporate gala, or family pooja with royal Indian sweets. Reserve high quantities with tiered wholesale pricing, bespoke velvet gift chests, and convenient 30% advance deposit.
              </p>

              <div className="grid grid-cols-2 gap-4 py-2 text-xs text-stone-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                  <span>Bulk Tiered Discounts (10kg - 100kg+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                  <span>Handcrafted Velvet & Wooden Chests</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                  <span>Guaranteed Temperature-Controlled Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                  <span>Pay Only 30% Advance Deposit</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/event-booking"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full gold-gradient text-royal-950 font-bold text-sm tracking-wider uppercase shadow-gold-md hover:scale-105 transition-all"
                >
                  <span>Start Advance Event Order</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[350px]">
              <img
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=85"
                alt="Advance Wedding Sweet Hampers"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent via-royal-950/40 to-royal-950" />
            </div>
          </div>
        </div>
      </section>

      {/* Best Selling Hampers Section (Selected by Admin) - Automoving Carousel */}
      {bestSellerHampers && bestSellerHampers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <Gift className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">
                  {settings?.hampersBadgeText || 'Curated Luxury'}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-royal-950">
                {settings?.hampersTitle || 'Best Selling Hampers'}
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-2xl">
                {settings?.hampersSubtitle ||
                  'Bespoke velvet gift chests, wedding thalis, and royal festive assortments selected for connoisseurs.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Carousel navigation controls */}
              <div className="flex items-center gap-1.5 bg-stone-100/90 p-1 rounded-full border border-stone-200/80">
                <button
                  type="button"
                  onClick={() => scrollHampersCarousel('left')}
                  className="w-8 h-8 rounded-full bg-white hover:bg-rose-600 hover:text-white text-stone-700 shadow-xs flex items-center justify-center transition-all"
                  title="Scroll Left"
                  aria-label="Scroll Hampers Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollHampersCarousel('right')}
                  className="w-8 h-8 rounded-full bg-white hover:bg-rose-600 hover:text-white text-stone-700 shadow-xs flex items-center justify-center transition-all"
                  title="Scroll Right"
                  aria-label="Scroll Hampers Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Link
                href={settings?.hampersLinkUrl || '/shop?search=hamper'}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-rose-700 hover:text-rose-800 group"
              >
                <span>{settings?.hampersLinkText || 'Explore All Hampers'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Carousel Track with Auto-move & Pause on Hover */}
          <div className="relative">
            <div
              ref={hampersCarouselRef}
              onMouseEnter={() => setIsHampersPaused(true)}
              onMouseLeave={() => setIsHampersPaused(false)}
              onTouchStart={() => setIsHampersPaused(true)}
              onTouchEnd={() => setTimeout(() => setIsHampersPaused(false), 2500)}
              className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 px-1 scrollbar-none snap-x snap-mandatory focus:outline-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {bestSellerHampers.map((product) => (
                <div
                  key={product._id}
                  className="w-40 sm:w-48 md:w-52 lg:w-56 shrink-0 snap-start flex flex-col h-full"
                >
                  <ProductCard product={product} compact={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Testimonials & Royal Confectionery Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest block mb-1">
            Centuries of Trust
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-royal-950">
            Treasured by Connoisseurs
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1.5">
            Real experiences from patrons who celebrate auspicious milestones and festivals with our confections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(testimonials && testimonials.length > 0
            ? testimonials
            : [
                {
                  _id: 'default-1',
                  reviewerName: 'Rajiv & Sunita Singhal',
                  reviewerLocation: 'Wedding Celebration, Amer',
                  rating: 5,
                  title: 'Pure Royal Desi Ghee Aroma',
                  comment:
                    'We ordered 250 bespoke velvet hampers for our daughter’s wedding in Jaipur. The Kaju Katli was so silky, and every guest commented on how heavenly the Desi Ghee aroma was!',
                  verifiedPurchase: true,
                },
                {
                  _id: 'default-2',
                  reviewerName: 'Vikramaditya Oberoi',
                  reviewerLocation: 'Corporate Director, Jaipur',
                  rating: 5,
                  title: 'Seamless Scheduled Delivery',
                  comment:
                    'The convenience of booking in advance with just a 30% deposit and getting scheduled morning delivery at our banquet hall made our Diwali corporate gifting completely stress-free.',
                  verifiedPurchase: true,
                },
                {
                  _id: 'default-3',
                  reviewerName: 'Dr. Meenakshi Joshi',
                  reviewerLocation: 'Regular Patron',
                  rating: 5,
                  title: 'Godsend Sugar-Free Sweets',
                  comment:
                    'Their Sugar-Free Pista Anjeer delight is a godsend for my diabetic parents. True pure ingredients without chemical aftertaste. Shree Mithai is in a league of its own.',
                  verifiedPurchase: true,
                },
              ]
          ).map((t: any, i: number) => (
            <div
              key={t._id || i}
              className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating || 5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  {t.product && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-200 truncate max-w-[130px]">
                      {t.product.productName}
                    </span>
                  )}
                </div>
                {t.title && (
                  <h4 className="font-serif font-bold text-stone-900 text-sm">{t.title}</h4>
                )}
                <p className="text-xs sm:text-sm text-stone-600 italic leading-relaxed line-clamp-4">
                  &quot;{t.comment}&quot;
                </p>
              </div>

              <div className="border-t border-stone-100 pt-3">
                <h5 className="font-bold text-xs text-stone-900">{t.reviewerName}</h5>
                <p className="text-[11px] text-stone-400">
                  {t.reviewerLocation || (t.verifiedPurchase ? 'Verified Patron' : 'Connoisseur')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
