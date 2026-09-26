'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarDays,
  KanbanSquare,
  Calendar,
  Package,
  Layers,
  Clock,
  Users,
  CreditCard,
  Tag,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Crown,
  Sparkles,
  Home,
  Award,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Instant Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Advance Bookings', href: '/admin/bookings', icon: CalendarDays },
  { label: 'Booking Calendar', href: '/admin/calendar', icon: Calendar },
  { label: 'Booking Kanban', href: '/admin/kanban', icon: KanbanSquare },
  { label: 'Products Catalogue', href: '/admin/products', icon: Package },
  { label: 'Restaurant Food', href: '/admin/restaurant', icon: UtensilsCrossed },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Delivery Slots', href: '/admin/delivery-slots', icon: Clock },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Customer Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Coupons & Offers', href: '/admin/offers', icon: Tag },
  { label: 'Homepage Content', href: '/admin/homepage', icon: Home },
  { label: 'Our Heritage', href: '/admin/heritage', icon: Award },
  { label: 'Footer Section', href: '/admin/footer', icon: Sparkles },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.push('/login?redirect=/admin');
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-amber-400">
        <div className="flex flex-col items-center gap-3">
          <Crown className="w-10 h-10 animate-bounce text-amber-400" />
          <p className="font-serif text-sm tracking-widest uppercase">Verifying Royal Admin Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-stone-800 border border-amber-600/30 rounded-3xl p-8 max-w-md text-center text-white">
          <ShieldAlert className="w-14 h-14 text-amber-500 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-amber-400 mb-2">Restricted Access</h2>
          <p className="text-stone-300 text-sm mb-6">
            The Shree Mithai Management Suite requires authorized Administrator credentials.
          </p>
          <button
            onClick={() => router.push('/login?redirect=/admin')}
            className="w-full py-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-sm hover:from-amber-700 hover:to-amber-800 transition-all shadow-md"
          >
            Sign in as Administrator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-stone-900 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-stone-950 font-bold">
            <Crown className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-amber-300 text-sm">Shree Mithai Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-stone-300 hover:text-white rounded-lg focus:outline-none"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-stone-900 text-stone-200 border-r border-stone-800 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-md shadow-amber-950/40">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-amber-400 text-base leading-tight">Shree Mithai</h1>
              <p className="text-[11px] text-stone-400 tracking-wider uppercase font-medium">Operations Suite</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-stone-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800/80 bg-stone-950/40 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-stone-800/50 border border-stone-700/40 flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-stone-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-amber-400/90 truncate uppercase tracking-wider">{user?.role}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="hidden md:flex bg-white border-b border-stone-200/80 px-8 py-4 items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Royal Confectionery Hub</span>
            <p className="font-serif font-bold text-stone-900 text-lg">Management & Fulfillments</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-amber-50 hover:text-amber-900 border border-stone-200 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Customer Store
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-900 text-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-stone-800">{user?.name}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Children */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
