'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  X,
  Layers,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Clock,
  Tag,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatPrice } from '../lib/utils';

interface SearchSuggestionsBarProps {
  placeholder?: string;
  initialValue?: string;
  className?: string;
  inputClassName?: string;
  onSearchSubmit?: (query: string) => void;
  autoNavigateOnProductClick?: boolean;
}

export default function SearchSuggestionsBar({
  placeholder = 'Search sweets, categories, ingredients...',
  initialValue = '',
  className = '',
  inputClassName = '',
  onSearchSubmit,
  autoNavigateOnProductClick = true,
}: SearchSuggestionsBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ categories: any[]; products: any[] }>({
    categories: [],
    products: [],
  });
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial value if changed from outside
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  const fetchSuggestions = (searchWord: string) => {
    if (!searchWord.trim()) {
      setSuggestions({ categories: [], products: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/products/suggestions?q=${encodeURIComponent(searchWord.trim())}`)
      .then((res) => {
        if (res.success && res.data) {
          setSuggestions({
            categories: res.data.categories || [],
            products: res.data.products || [],
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch suggestions:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim()) {
      setIsOpen(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(val);
      }, 180);
    } else {
      setIsOpen(false);
      setSuggestions({ categories: [], products: [] });
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query.trim());
    } else {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSuggestions({ categories: [], products: [] });
    inputRef.current?.focus();
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = suggestions.categories.length + suggestions.products.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && query.trim()) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < totalItems) {
        e.preventDefault();
        if (selectedIndex < suggestions.categories.length) {
          const cat = suggestions.categories[selectedIndex];
          setIsOpen(false);
          router.push(`/shop?category=${cat.slug}`);
        } else {
          const prod = suggestions.products[selectedIndex - suggestions.categories.length];
          setIsOpen(false);
          router.push(`/products/${prod.slug}`);
        }
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const hasResults = suggestions.categories.length > 0 || suggestions.products.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={
            inputClassName ||
            'w-full bg-stone-100/90 border border-stone-300 rounded-full pl-10 pr-9 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all shadow-xs'
          }
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Floating Suggestions Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-in fade-in duration-150 max-h-[460px] flex flex-col">
          {/* Header query info */}
          <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>
                Suggestions for <strong className="text-royal-950 font-semibold">"{query}"</strong>
              </span>
            </span>
            {loading && <span className="text-[11px] text-gold-600 animate-pulse font-medium">Searching...</span>}
          </div>

          <div className="overflow-y-auto divide-y divide-stone-100">
            {/* 1. Category Suggestions */}
            {suggestions.categories.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-700 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>Matching Categories</span>
                </div>
                <div className="space-y-1 mt-1">
                  {suggestions.categories.map((cat, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <Link
                        key={cat._id}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                          isSelected ? 'bg-gold-100/70 text-royal-950' : 'hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="w-7 h-7 rounded-lg object-cover border border-stone-200"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center font-bold text-xs">
                              {cat.name.charAt(0)}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-serif font-bold text-xs text-stone-900 block truncate">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-stone-400 block -mt-0.5">
                              Confectionery Category
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-gold-700 flex items-center gap-1 shrink-0">
                          <span>Browse</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Products Suggestions */}
            {suggestions.products.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-700 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Sweets & Delicacies</span>
                </div>
                <div className="space-y-1 mt-1">
                  {suggestions.products.map((prod, idx) => {
                    const itemGlobalIndex = suggestions.categories.length + idx;
                    const isSelected = selectedIndex === itemGlobalIndex;
                    return (
                      <Link
                        key={prod._id}
                        href={`/products/${prod.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                          isSelected ? 'bg-gold-100/70 text-royal-950' : 'hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.imageUrl}
                            alt={prod.productName}
                            className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0 truncate">
                            <div className="flex items-center gap-1.5">
                              {prod.dietary === 'VEG' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" title="Veg" />
                              )}
                              <span className="font-serif font-bold text-xs text-stone-900 truncate">
                                {prod.productName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              {prod.category && (
                                <span className="text-[10px] text-stone-500 font-medium">
                                  {prod.category.name}
                                </span>
                              )}
                              {prod.matchedReason && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                  {prod.matchedReason === 'name'
                                    ? 'In Name'
                                    : prod.matchedReason === 'category'
                                    ? 'In Category'
                                    : 'In Description'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="font-serif font-bold text-xs text-royal-950 block">
                            {formatPrice(prod.finalPrice)}
                          </span>
                          {prod.basePrice > prod.finalPrice && (
                            <span className="text-[10px] text-stone-400 line-through block -mt-0.5">
                              {formatPrice(prod.basePrice)}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results state */}
            {!loading && !hasResults && (
              <div className="p-6 text-center text-xs text-stone-500 space-y-1">
                <p className="font-serif text-sm font-semibold text-stone-700">
                  No direct matches for "{query}"
                </p>
                <p className="text-[11px] text-stone-400">
                  Try searching by sweet name, category (e.g. Kaju, Bengali), or ingredients (Ghee, Pistachio).
                </p>
              </div>
            )}
          </div>

          {/* Bottom Bar: View all results in Shop */}
          <div className="p-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full text-center py-2 px-3 rounded-xl gold-gradient text-royal-950 text-xs font-bold hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>View all results for "{query}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
