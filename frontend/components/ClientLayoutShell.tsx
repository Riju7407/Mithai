'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import Footer from './Footer';
import DeliveredOrderReviewPopup from './DeliveredOrderReviewPopup';

export default function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);

  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // Admin routes render without customer navbar/footer
    return <div className="min-h-screen bg-stone-100">{children}</div>;
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <DeliveredOrderReviewPopup />
      <Footer />
    </>
  );
}
