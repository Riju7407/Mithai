'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      // If user is Admin, redirect to admin dashboard, otherwise redirect to homepage
      if (res.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setErrorMsg(res.message || 'Invalid email or password.');
    }
  };

  const handleDemoFill = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('Admin@41312');
    } else {
      setEmail('customer@mithai.com');
      setPassword('Customer@123456');
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-7 sm:p-10 rounded-3xl border border-stone-200 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full gold-gradient mx-auto flex items-center justify-center text-white shadow-gold-sm">
          <Sparkles className="w-6 h-6 text-amber-100" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Welcome to Shree Mithai
        </h1>
        <p className="text-xs text-stone-500">
          Sign in to access your orders, event bookings, and saved addresses.
        </p>
      </div>

      {/* Demo Credentials Quick Click Bar */}
      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-[11px] text-amber-900 space-y-1.5">
        <span className="font-bold flex items-center gap-1 text-amber-950">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Quick Demo Accounts:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill('admin')}
            className="flex-1 py-1 px-2 rounded-lg bg-stone-900 text-amber-300 font-bold hover:bg-stone-950 text-[10px]"
          >
            Fill Admin Account
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('customer')}
            className="flex-1 py-1 px-2 rounded-lg bg-amber-200 text-amber-900 font-bold hover:bg-amber-300 text-[10px]"
          >
            Fill Customer Account
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-stone-700 block mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-stone-700">Password</label>
            <Link href="/forgot-password" className="text-amber-700 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-10 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-none p-0.5 rounded transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl gold-gradient text-stone-900 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 flex items-center justify-center gap-2"
        >
          <span>{submitting ? 'Verifying...' : 'Sign In to Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-stone-500">
        Don&apos;t have an account yet?{' '}
        <Link href="/register" className="font-bold text-amber-700 hover:underline">
          Register for Free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-stone-200 text-center animate-pulse text-xs text-stone-400">
            Loading authentication portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
