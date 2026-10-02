'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Calendar,
  Gift,
  Sparkles,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Flame,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import SearchSuggestionsBar from './SearchSuggestionsBar';

interface NavbarProps {
  onOpenCart: () => void;
}

export default function Navbar({ onOpenCart }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const { getItemCount } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cartCount = getItemCount();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Prevent background page scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop Sweets', href: '/shop' },
    {
      label: 'Restaurant Food',
      href: '/restaurant',
      badge: 'Hot Dining',
      badgeType: 'fire',
    },
    { label: 'Categories', href: '/categories' },
    {
      label: 'Advance Event Booking',
      href: '/event-booking',
      badge: 'Catering',
      badgeType: 'event',
      highlight: true,
    },
    { label: 'Offers & Boxes', href: '/offers' },
    { label: 'Our Heritage', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-md border-b border-gold-200/50 py-2.5'
            : 'bg-cream-50 border-b border-stone-200 py-3.5'
        }`}
      >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 group shrink">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full gold-gradient flex items-center justify-center text-white shadow-gold-sm group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100" />
            </div>
            <div className="min-w-0">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-royal-950 block leading-none truncate">
                Shree Mithai
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-gold-600 font-semibold block mt-0.5 truncate">
                Artisanal & Event Catering
              </span>
            </div>
          </Link>

          {/* Search bar with instant suggestions (Desktop & Tablet) */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchSuggestionsBar placeholder="Search Kaju Katli, Motichoor, Savories..." />
          </div>

          {/* Right Action Icons (Cart, Account, Mobile Menu Toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Advance Booking Quick Action CTA on Desktop */}
            <Link
              href="/event-booking"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-royal-800 text-gold-300 hover:bg-royal-900 border border-royal-700 text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-gold-400" />
              <span>Event Catering</span>
            </Link>

            {/* Cart Trigger Button */}
            <button
              id="cart-toggle-btn"
              onClick={onOpenCart}
              className="relative p-2 sm:p-2.5 rounded-full text-royal-950 hover:bg-gold-100/60 transition-colors shrink-0"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-6 h-6 text-royal-900" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-burgundy-500 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center animate-bounce shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account / Login - Desktop only (hidden on mobile between cart and hamburger) */}
            {isAuthenticated && user ? (
              <div className="hidden md:block relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-stone-300 hover:border-gold-500 bg-white text-xs font-medium text-stone-800 shadow-sm transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-royal-700 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-stone-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-100 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2 border-b border-stone-100">
                      <p className="font-semibold text-stone-900 truncate">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3.5 py-2 text-royal-700 font-semibold hover:bg-royal-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-royal-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2 px-3.5 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-400" />
                      Instant Orders
                    </Link>

                    <Link
                      href="/account/bookings"
                      className="flex items-center gap-2 px-3.5 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-stone-400" />
                      Event Bookings
                    </Link>

                    <Link
                      href="/account/profile"
                      className="flex items-center gap-2 px-3.5 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-stone-400" />
                      Account & Addresses
                    </Link>

                    <div className="border-t border-stone-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-royal-900 border border-royal-800/30 rounded-full hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-royal-950 hover:bg-stone-200/50 transition-colors shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links Bar */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center justify-center border-t border-stone-200/80 pt-2 mt-2 w-full"
        >
          {/* Main Navigation Links List */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 flex-nowrap overflow-x-auto scrollbar-none py-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-[13px] xl:text-sm font-medium transition-all shrink-0 ${
                    isActive
                      ? 'text-gold-700 font-bold bg-gold-100/60 shadow-2xs border border-gold-300/40'
                      : 'text-stone-700 hover:text-royal-950 hover:bg-gold-50/70'
                  }`}
                >
                  <span className="whitespace-nowrap">{link.label}</span>
                  {link.badge && (
                    <span
                      className={`whitespace-nowrap inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] xl:text-[10px] font-bold uppercase rounded-full shadow-2xs tracking-wider leading-none ${
                        link.badgeType === 'fire'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                          : 'bg-royal-900 text-gold-300 border border-royal-700'
                      }`}
                    >
                      {link.badgeType === 'fire' && <Flame className="w-2.5 h-2.5 text-amber-100 shrink-0" />}
                      {link.badgeType === 'event' && <Calendar className="w-2.5 h-2.5 text-gold-400 shrink-0" />}
                      <span>{link.badge}</span>
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-gold-500 to-amber-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>

      {/* Mobile Drawer Navigation (Rendered outside header so it never hides or shifts on scroll) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs sm:max-w-sm h-full bg-cream-50 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Top Header with brand & explicit Cut/Close button */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-cream-100/70">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-white shadow-gold-sm">
                  <Sparkles className="w-4 h-4 text-amber-100" />
                </div>
                <div>
                  <span className="font-serif text-lg font-bold text-royal-950 block leading-tight">
                    Shree Mithai
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-gold-600 font-semibold block">
                    Menu
                  </span>
                </div>
              </Link>
              <button
                id="drawer-close-cut-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full text-stone-500 hover:text-royal-950 hover:bg-stone-200/60 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable menu content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {/* Mobile Search with instant suggestions */}
              <div className="mb-4">
                <SearchSuggestionsBar
                  placeholder="Search sweets, categories..."
                  inputClassName="w-full bg-white border border-stone-300 rounded-lg pl-9 pr-8 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Navigation list */}
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-gold-100/70 text-gold-900 font-bold'
                        : 'text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span
                        className={`whitespace-nowrap inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                          link.badgeType === 'fire'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {link.badgeType === 'fire' && <Flame className="w-2.5 h-2.5 text-amber-100 shrink-0" />}
                        {link.badgeType === 'event' && <Calendar className="w-2.5 h-2.5 text-amber-900 shrink-0" />}
                        <span>{link.badge}</span>
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Event Booking Special Banner in Mobile Menu */}
              <div className="mt-5 p-4 rounded-xl bg-royal-900 text-white">
                <div className="flex items-center gap-2 text-gold-400 font-serif font-bold text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  Advance Event Catering
                </div>
                <p className="text-xs text-stone-300 mb-3">
                  Schedule large sweet orders for weddings, poojas & corporate galas with customized packaging.
                </p>
                <Link
                  href="/event-booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 px-3 rounded-lg gold-gradient text-royal-950 font-bold text-xs tracking-wider uppercase shadow"
                >
                  Start Event Plan
                </Link>
              </div>
            </div>

            {/* Mobile Footer / Auth info */}
            <div className="border-t border-stone-200 p-4 bg-cream-100/50">
              {isAuthenticated && user ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-200">
                    <div className="w-7 h-7 rounded-full bg-royal-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900 text-xs truncate">{user.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-royal-700 font-semibold hover:bg-royal-50 rounded-lg text-xs transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-royal-600" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-lg text-xs transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-stone-400" />
                    Instant Orders
                  </Link>

                  <Link
                    href="/account/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-lg text-xs transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-stone-400" />
                    Event Bookings
                  </Link>

                  <Link
                    href="/account/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-lg text-xs transition-colors"
                  >
                    <User className="w-4 h-4 text-stone-400" />
                    Account & Addresses
                  </Link>

                  <div className="border-t border-stone-200 pt-1 mt-1">
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2 px-3 text-xs text-red-600 hover:bg-red-50 rounded-lg text-left flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 px-3 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 px-3 gold-gradient text-white rounded-lg text-xs font-bold shadow"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
