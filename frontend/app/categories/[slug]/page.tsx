'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';
import ProductCard from '../../../components/ProductCard';

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      api.get(`/categories/${slug}`).catch(() => ({ data: null })),
      api.get(`/products?category=${slug}`).catch(() => ({ data: [] })),
    ])
      .then(([catRes, prodRes]) => {
        setCategory(catRes.data);
        setProducts(prodRes.data || []);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-10 w-48 bg-stone-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 bg-stone-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Category Not Found</h2>
        <Link
          href="/categories"
          className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase"
        >
          View All Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-gold-700 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Categories</span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-950">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mt-1 leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
          <p className="text-sm text-stone-500">No sweets currently listed in this category.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase"
          >
            Explore All Sweets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
