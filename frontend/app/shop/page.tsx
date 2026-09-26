'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import SearchSuggestionsBar from '../../components/SearchSuggestionsBar';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [dietary, setDietary] = useState(searchParams.get('dietary') || '');
  const [isSugarFree, setIsSugarFree] = useState(searchParams.get('isSugarFree') === 'true');
  const [orderTypeFilter, setOrderTypeFilter] = useState(searchParams.get('orderType') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch Categories
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  // Fetch Products with filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (dietary) params.set('dietary', dietary);
    if (isSugarFree) params.set('isSugarFree', 'true');
    if (orderTypeFilter === 'instant') params.set('availableForInstant', 'true');
    if (orderTypeFilter === 'advance') params.set('availableForAdvance', 'true');
    if (sort) params.set('sort', sort);
    params.set('page', page.toString());
    params.set('limit', '16');

    api
      .get(`/products?${params.toString()}`)
      .then((res) => {
        setProducts(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalCount(res.meta.total || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, selectedCategory, dietary, isSugarFree, orderTypeFilter, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setDietary('');
    setIsSugarFree(false);
    setOrderTypeFilter('');
    setSort('featured');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title & Banner Header */}
      <div className="bg-royal-950 text-white p-6 sm:p-10 rounded-3xl relative overflow-hidden shadow-lg border border-gold-900/50">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Artisanal Catalogue</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Royal Mithai & Savories Shop
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            Handcrafted with 100% pure A2 Desi Cow Ghee and Iranian Pistachios. Fresh same-day delivery available across all items.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none bg-gradient-to-l from-gold-500 to-transparent hidden sm:block" />
      </div>

      {/* Search & Top Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        {/* Search Input with Instant Suggestions */}
        <div className="w-full md:w-96">
          <SearchSuggestionsBar
            placeholder="Search sweets, category, ingredients..."
            initialValue={search}
            inputClassName="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-9 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            onSearchSubmit={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
        </div>

        {/* Right Sort & Mobile Filter Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <span className="text-xs text-stone-500 hidden sm:inline">
            Showing <strong>{products.length}</strong> of <strong>{totalCount}</strong> sweets
          </span>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-stone-50 border border-stone-300 text-stone-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Additions</option>
              <option value="popular">Best Sellers</option>
            </select>

            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-stone-100 rounded-xl text-xs font-bold text-stone-800 border border-stone-300"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gold-600" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="font-serif font-bold text-base text-royal-950 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold-600" />
              <span>Filter Sweets</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-gold-700 hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Categories
            </h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPage(1);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === ''
                    ? 'bg-gold-100 font-bold text-gold-900'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-gold-100 font-bold text-gold-900'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Order Type Availability */}
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Ordering Mode
            </h4>
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'All Ordering Types', value: '' },
                { label: 'Instant Order Available', value: 'instant' },
                { label: 'Advance Event Booking Available', value: 'advance' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer text-stone-700 hover:text-stone-900"
                >
                  <input
                    type="radio"
                    name="orderType"
                    checked={orderTypeFilter === opt.value}
                    onChange={() => {
                      setOrderTypeFilter(opt.value);
                      setPage(1);
                    }}
                    className="accent-gold-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dietary & Health */}
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Dietary & Health
            </h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={dietary === 'VEG'}
                  onChange={(e) => {
                    setDietary(e.target.checked ? 'VEG' : '');
                    setPage(1);
                  }}
                  className="rounded text-gold-600 focus:ring-gold-500"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  100% Vegetarian Only
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={isSugarFree}
                  onChange={(e) => {
                    setIsSugarFree(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded text-gold-600 focus:ring-gold-500"
                />
                <span>Zero Refined Sugar (Diabetic Safe)</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-60 bg-stone-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cream-100 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">No sweets found</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                We couldn't find any sweets matching your current search or filter criteria. Try adjusting your selections.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} compact={true} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                      page === pageNum
                        ? 'gold-gradient text-royal-950 shadow-sm'
                        : 'border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-stone-400 animate-pulse">
          Loading artisanal boutique catalogue...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
