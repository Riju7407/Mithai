'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  AlertTriangle,
  Sparkles,
  Layers,
  IndianRupee,
  RefreshCw,
  Upload,
  Star,
  Gift,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [bestSellerFilter, setBestSellerFilter] = useState(false);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  const [togglingBestSellerId, setTogglingBestSellerId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Form Fields
  const [formData, setFormData] = useState<any>({
    productName: '',
    slug: '',
    category: '',
    shortDescription: '',
    description: '',
    basePrice: 0,
    discountPercentage: 0,
    finalPrice: 0,
    weightUnit: 'kg',
    perKgPrice: 0,
    stockQuantity: 100,
    lowStockThreshold: 10,
    dietary: 'veg',
    isSugarFree: false,
    ingredients: '',
    shelfLife: '7 days in refrigeration',
    availableForInstantOrder: true,
    availableForAdvanceBooking: true,
    minAdvanceBookingDays: 3,
    isFeatured: false,
    isActive: true,
    productImages: [{ url: '', altText: '', isPrimary: true }],
    bulkPricingTiers: [{ minQuantity: 5, maxQuantity: 15, pricePerUnit: 0 }],
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/products?page=${page}&limit=12`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (categoryFilter) query += `&category=${encodeURIComponent(categoryFilter)}`;

      const res = await api.get(query);
      if (res.success) {
        const prodList = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setProducts(prodList);
        if (res.meta?.totalPages) setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      productName: '',
      slug: '',
      category: categories[0]?._id ? String(categories[0]._id) : '',
      shortDescription: '',
      description: '',
      basePrice: 500,
      discountPercentage: 0,
      finalPrice: 500,
      weightUnit: 'kg',
      perKgPrice: 500,
      stockQuantity: 100,
      lowStockThreshold: 10,
      dietary: 'veg',
      isSugarFree: false,
      ingredients: 'Pure Cow Desi Ghee, Pistachios, Cardamom, Sugar',
      shelfLife: '7-10 days',
      availableForInstantOrder: true,
      availableForAdvanceBooking: true,
      minAdvanceBookingDays: 3,
      isFeatured: false,
      isBestSeller: false,
      isActive: true,
      productImages: [
        {
          url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?q=80&w=600&auto=format&fit=crop',
          altText: 'Artisanal Confectionery',
          isPrimary: true,
        },
      ],
      bulkPricingTiers: [{ minQuantity: 5, maxQuantity: 20, pricePerUnit: 450 }],
    });
    setErrorMsg('');
    setUploadSuccessMsg('');
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    const catId = typeof p.category === 'object' && p.category !== null
      ? (p.category._id || p.category.id)
      : (p.category || '');
    setFormData({
      ...p,
      category: catId ? String(catId) : (categories[0]?._id ? String(categories[0]._id) : ''),
      bulkPricingTiers: p.bulkPricingTiers?.length
        ? p.bulkPricingTiers
        : [{ minQuantity: 5, maxQuantity: 20, pricePerUnit: p.finalPrice * 0.9 }],
      productImages: p.productImages?.length
        ? p.productImages
        : [{ url: '', altText: p.productName, isPrimary: true }],
    });
    setErrorMsg('');
    setUploadSuccessMsg('');
    setModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WebP, AVIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds the 5MB limit.');
      return;
    }

    try {
      setUploadingImage(true);
      setErrorMsg('');
      setUploadSuccessMsg('Uploading image to media server...');

      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const res = await api.upload('/products/upload-image', uploadFormData);

      if (res.success && res.data?.url) {
        setFormData((prev: any) => ({
          ...prev,
          productImages: [
            {
              url: res.data.url,
              altText: prev.productName || 'Artisanal Confectionery',
              isPrimary: true,
            },
          ],
        }));
        setUploadSuccessMsg('Confection image uploaded successfully!');
        setTimeout(() => setUploadSuccessMsg(''), 4000);
      } else {
        setErrorMsg('Failed to upload image. Please try again.');
        setUploadSuccessMsg('');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setErrorMsg(err.message || 'Image upload failed. Ensure image is under 5MB.');
      setUploadSuccessMsg('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');

      // Auto-compute final price
      const base = Number(formData.basePrice) || 0;
      const disc = Number(formData.discountPercentage) || 0;
      const final = Math.round(base - (base * disc) / 100);

      const payload = {
        ...formData,
        basePrice: base,
        discountPercentage: disc,
        finalPrice: final,
        perKgPrice: Number(formData.perKgPrice) || final,
        stockQuantity: Number(formData.stockQuantity) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 10,
        minAdvanceBookingDays: Number(formData.minAdvanceBookingDays) || 3,
      };

      let res;
      if (editingProduct) {
        res = await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        res = await api.post('/products', payload);
      }

      if (res.success) {
        setModalOpen(false);
        fetchProducts();
      } else {
        setErrorMsg(res.message || 'Failed to save product.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleToggleFeatured = async (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setTogglingFeaturedId(p._id);
      const newFeatured = !p.isFeatured;
      const res = await api.put(`/products/${p._id}`, { isFeatured: newFeatured });
      if (res.success) {
        setProducts((prev) =>
          prev.map((item) => (item._id === p._id ? { ...item, isFeatured: newFeatured } : item))
        );
      } else {
        alert(res.message || 'Failed to update featured status.');
      }
    } catch (err: any) {
      console.error('Failed to toggle featured status:', err);
      alert(err.message || 'Failed to update homepage signature sweets status.');
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const handleToggleBestSeller = async (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setTogglingBestSellerId(p._id);
      const newBestSeller = !p.isBestSeller;
      const res = await api.put(`/products/${p._id}`, { isBestSeller: newBestSeller });
      if (res.success) {
        setProducts((prev) =>
          prev.map((item) => (item._id === p._id ? { ...item, isBestSeller: newBestSeller } : item))
        );
      } else {
        alert(res.message || 'Failed to update best seller status.');
      }
    } catch (err: any) {
      console.error('Failed to toggle best seller status:', err);
      alert(err.message || 'Failed to update best selling hampers status.');
    } finally {
      setTogglingBestSellerId(null);
    }
  };

  let displayedProducts = products;
  if (featuredOnly) displayedProducts = displayedProducts.filter((p) => p.isFeatured);
  if (bestSellerFilter) displayedProducts = displayedProducts.filter((p) => p.isBestSeller);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-amber-600" />
            Product Catalogue Management
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Curate royal sweets, adjust live shelf inventory, update wholesale tiers, and control dietary badges.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-900/20 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Confection
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name or ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        {/* Quick Filter: Homepage Signature Sweets & Hampers */}
        <button
          type="button"
          onClick={() => {
            setFeaturedOnly(!featuredOnly);
            if (!featuredOnly) setBestSellerFilter(false);
          }}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            featuredOnly
              ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20 ring-2 ring-amber-400'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
          title="Filter only confections selected for Homepage Signature Sweets & Hampers"
        >
          <Star className={`w-4 h-4 ${featuredOnly ? 'fill-white text-white' : 'text-amber-600'}`} />
          <span>Signature Sweets ({products.filter((p) => p.isFeatured).length})</span>
        </button>

        {/* Quick Filter: Best Selling Hampers */}
        <button
          type="button"
          onClick={() => {
            setBestSellerFilter(!bestSellerFilter);
            if (!bestSellerFilter) setFeaturedOnly(false);
          }}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            bestSellerFilter
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20 ring-2 ring-rose-400'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
          title="Filter only items selected for Homepage Best Selling Hampers section"
        >
          <Gift className={`w-4 h-4 ${bestSellerFilter ? 'text-white' : 'text-rose-600'}`} />
          <span>Best Hampers ({products.filter((p) => p.isBestSeller).length})</span>
        </button>

        <div className="w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 px-3.5 py-2.5 rounded-2xl bg-white border border-stone-300 text-xs sm:text-sm text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-xs cursor-pointer"
          >
            <option value="" className="text-stone-900 bg-white font-medium">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id} className="text-stone-900 bg-white font-medium py-1">
                {c.name || c.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
            Loading confections from catalogue...
          </div>
        ) : (!displayedProducts || displayedProducts.length === 0) ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No products found</h3>
            <p className="text-stone-500 text-xs mt-1">
              {featuredOnly
                ? 'No items currently marked for Homepage Signature Sweets. Toggle "+ Add" on any product below to display it on the homepage.'
                : "Try modifying your search or click 'Add New Confection'."}
            </p>
            {featuredOnly && (
              <button
                type="button"
                onClick={() => setFeaturedOnly(false)}
                className="mt-3 px-4 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Live Stock</th>
                  <th className="px-6 py-4">Channels</th>
                  <th className="px-6 py-4">Homepage Showcase</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {displayedProducts.map((p) => {
                  const available = p.stockQuantity - (p.reservedStock || 0);
                  const isLow = available <= p.lowStockThreshold;

                  return (
                    <tr key={p._id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden relative shrink-0 border border-stone-200">
                          {p.productImages?.[0]?.url ? (
                            <Image
                              src={p.productImages[0].url}
                              alt={p.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif">
                              SM
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block">{p.productName}</span>
                          <span className="text-[11px] text-stone-400">/{p.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-stone-700 font-medium">
                          {p.category?.name ||
                            p.category?.categoryName ||
                            categories.find((c) => String(c._id) === String(p.category?._id || p.category))?.name ||
                            'Sweets'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-stone-900 block">{formatPrice(p.finalPrice)}</span>
                        {p.discountPercentage > 0 && (
                          <span className="text-[10px] text-emerald-600 font-semibold block">
                            {p.discountPercentage}% OFF (Orig. {formatPrice(p.basePrice)})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold block ${isLow ? 'text-rose-600' : 'text-stone-900'}`}>
                          {available} {p.weightUnit}
                        </span>
                        {p.reservedStock > 0 && (
                          <span className="text-[10px] text-purple-600 block">
                            ({p.reservedStock} reserved)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-[10px]">
                          {p.availableForInstantOrder && (
                            <span className="text-emerald-700 font-semibold">✓ Instant</span>
                          )}
                          {p.availableForAdvanceBooking && (
                            <span className="text-purple-700 font-semibold">✓ Advance Booking</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <button
                            type="button"
                            onClick={(e) => handleToggleFeatured(p, e)}
                            disabled={togglingFeaturedId === p._id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                              p.isFeatured
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 ring-1 ring-amber-400/30'
                                : 'bg-stone-50 text-stone-500 border border-stone-200 hover:bg-amber-50 hover:text-amber-900'
                            }`}
                            title="Toggle Signature Sweets & Hampers"
                          >
                            <Star className={`w-3 h-3 ${p.isFeatured ? 'fill-amber-500 text-amber-600' : 'text-stone-400'}`} />
                            <span>{p.isFeatured ? 'Signature' : '+ Signature'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleToggleBestSeller(p, e)}
                            disabled={togglingBestSellerId === p._id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                              p.isBestSeller
                                ? 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200 ring-1 ring-rose-400/30'
                                : 'bg-stone-50 text-stone-500 border border-stone-200 hover:bg-rose-50 hover:text-rose-900'
                            }`}
                            title="Toggle Best Selling Hampers section"
                          >
                            <Gift className={`w-3 h-3 ${p.isBestSeller ? 'text-rose-600' : 'text-stone-400'}`} />
                            <span>{p.isBestSeller ? 'Best Hamper' : '+ Hamper'}</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-amber-800 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.productName)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">
              {editingProduct ? 'Edit Artisanal Confection' : 'Create New Confection'}
            </h2>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs sm:text-sm">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
                  1. Basic Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-800 font-bold mb-1 text-xs sm:text-sm">
                      Category <span className="text-rose-600">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 shadow-xs cursor-pointer"
                    >
                      <option value="" disabled className="text-stone-400 bg-white">
                        -- Select Confection Category --
                      </option>
                      {categories.map((c) => (
                        <option
                          key={c._id}
                          value={String(c._id)}
                          className="text-stone-900 bg-white font-medium py-1.5"
                        >
                          {c.name || c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Short Description</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  ></textarea>
                </div>
              </div>

              {/* Pricing & Units */}
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
                  2. Pricing & Units
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Base Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Unit</label>
                    <select
                      value={formData.weightUnit}
                      onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="gm">Grams (gm)</option>
                      <option value="piece">Piece</option>
                      <option value="box">Box / Hamper</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Per Kg Rate (₹)</label>
                    <input
                      type="number"
                      value={formData.perKgPrice}
                      onChange={(e) => setFormData({ ...formData, perKgPrice: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>
              </div>

              {/* Stock & Availability */}
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
                  3. Inventory & Booking Rules
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Live Stock</label>
                    <input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Low Stock Warning</label>
                    <input
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Min Advance Days</label>
                    <input
                      type="number"
                      value={formData.minAdvanceBookingDays}
                      onChange={(e) => setFormData({ ...formData, minAdvanceBookingDays: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950 bg-amber-50/90 px-3.5 py-2 rounded-xl border border-amber-300 hover:bg-amber-100 transition-colors shadow-xs">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured || false}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                      <span>Showcase in Homepage &apos;Signature Sweets &amp; Hampers&apos;</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-950 bg-rose-50/90 px-3.5 py-2 rounded-xl border border-rose-300 hover:bg-rose-100 transition-colors shadow-xs">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller || false}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="w-4 h-4 rounded border-rose-400 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-rose-600" />
                      <span>Showcase in Homepage &apos;Best Selling Hampers&apos;</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formData.availableForInstantOrder}
                      onChange={(e) => setFormData({ ...formData, availableForInstantOrder: e.target.checked })}
                      className="rounded border-stone-300 text-amber-600"
                    />
                    Available for Instant Delivery
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formData.availableForAdvanceBooking}
                      onChange={(e) => setFormData({ ...formData, availableForAdvanceBooking: e.target.checked })}
                      className="rounded border-stone-300 text-purple-600"
                    />
                    Available for Advance Event Booking
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formData.isSugarFree}
                      onChange={(e) => setFormData({ ...formData, isSugarFree: e.target.checked })}
                      className="rounded border-stone-300 text-emerald-600"
                    />
                    Sugar-Free
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-stone-300 text-stone-900"
                    />
                    Product Active
                  </label>
                </div>
              </div>

              {/* Confection Image Upload & Media */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="font-serif font-bold text-stone-900 text-sm">
                    4. Confection Image & Media
                  </h3>
                  <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Direct Device Upload & Cloudinary
                  </span>
                </div>

                {uploadSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  {/* Live Preview */}
                  <div className="sm:col-span-1 border border-stone-200 rounded-2xl p-2.5 bg-stone-50 text-center space-y-2">
                    <div className="aspect-square relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
                      {formData.productImages?.[0]?.url ? (
                        <img
                          src={formData.productImages[0].url}
                          alt="Confection preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-stone-400 p-4">
                          <Package className="w-8 h-8 mb-1 text-stone-300" />
                          <span className="text-[10px]">No image uploaded</span>
                        </div>
                      )}
                    </div>
                    {formData.productImages?.[0]?.url && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            productImages: [{ url: '', altText: '', isPrimary: true }],
                          })
                        }
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Image
                      </button>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-2 space-y-3">
                    {/* Device Upload Drag & Drop / Click Zone */}
                    <div className="relative border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-5 bg-amber-50/50 hover:bg-amber-50 text-center transition-all cursor-pointer">
                      <input
                        type="file"
                        id="confection-file-upload"
                        accept="image/png, image/jpeg, image/webp, image/jpg, image/avif"
                        onChange={handleImageFileUpload}
                        disabled={uploadingImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center">
                          {uploadingImage ? (
                            <RefreshCw className="w-5 h-5 animate-spin text-amber-800" />
                          ) : (
                            <Upload className="w-5 h-5 text-amber-800" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-amber-950">
                          {uploadingImage ? 'Uploading Image to Server...' : 'Click to Upload Confection Image'}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          PNG, JPG, or WebP from your device (Max 5MB)
                        </p>
                      </div>
                    </div>

                    {/* Or URL input */}
                    <div>
                      <label className="block text-stone-600 text-[11px] font-semibold mb-1">
                        Or specify Image URL directly:
                      </label>
                      <input
                        type="url"
                        value={formData.productImages?.[0]?.url || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            productImages: [
                              {
                                url: e.target.value,
                                altText: formData.productName,
                                isPrimary: true,
                              },
                            ],
                          })
                        }
                        placeholder="https://res.cloudinary.com/... or https://..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs shadow-md shadow-amber-900/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Confection' : 'Create Confection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
