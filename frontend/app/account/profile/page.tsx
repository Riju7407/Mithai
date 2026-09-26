'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, MapPin, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../lib/api';

export default function CustomerProfilePage() {
  const { user, addresses, fetchAddresses, updateProfile, isAuthenticated, isLoading } =
    useAuthStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New Address Form State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [houseOrFlat, setHouseOrFlat] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [state, setState] = useState('Rajasthan');
  const [pincode, setPincode] = useState('302001');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name, phone });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/addresses', {
        recipientName,
        phone: addrPhone,
        houseOrFlat,
        street,
        landmark,
        city,
        state,
        pincode,
        isDefault,
      });

      setShowAddressModal(false);
      // Reset form
      setRecipientName('');
      setAddrPhone('');
      setHouseOrFlat('');
      setStreet('');
      setLandmark('');
      fetchAddresses();
    } catch (err: any) {
      alert(`Failed to add address: ${err.message}`);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      await api.delete(`/auth/addresses/${id}`);
      fetchAddresses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Sign in to view profile</h2>
        <Link
          href="/login?redirect=/account/profile"
          className="inline-block px-6 py-2.5 rounded-full gold-gradient text-royal-950 font-bold text-xs uppercase"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-950">
          Account Profile & Addresses
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage your personal details and delivery addresses for quick express checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <User className="w-5 h-5 text-gold-600" />
            <span>Personal Information</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Email address cannot be changed</span>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            {profileSuccess && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </p>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl gold-gradient text-royal-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Saved Delivery Addresses */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-600" />
              <span>Saved Addresses</span>
            </h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="px-3 py-1.5 rounded-lg border border-gold-400 text-gold-800 hover:bg-gold-50 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-xs text-stone-400 italic py-4 text-center">
              No saved addresses yet. Add one for one-click checkout.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 relative text-xs text-stone-600 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{addr.recipientName}</span>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-stone-400 hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p>{addr.houseOrFlat}, {addr.street}</p>
                  <p>{addr.city}, {addr.pincode} &bull; Ph: {addr.phone}</p>
                  {addr.isDefault && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Default Address
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-serif font-bold text-lg text-stone-900">Add New Delivery Address</h3>

            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Flat / House / Villa *</label>
                <input
                  type="text"
                  required
                  value={houseOrFlat}
                  onChange={(e) => setHouseOrFlat(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Street / Area *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-gold-600"
                />
                <span className="font-semibold text-stone-700">Set as my default address</span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg gold-gradient text-royal-950 font-bold shadow"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
