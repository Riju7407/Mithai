'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { api } from '../lib/api';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<{
    text: string;
    link?: string;
    linkText?: string;
  } | null>(null);

  useEffect(() => {
    api
      .get('/banners/announcements')
      .then((res) => {
        if (res.data) setAnnouncement(res.data);
      })
      .catch(() => {
        // Fallback default
        setAnnouncement({
          text: '✨ Free Same-Day Express Delivery on Instant Orders Above ₹799 | Pre-book Wedding Sweets with 30% Deposit!',
          link: '/event-booking',
          linkText: 'Book Event Now',
        });
      });
  }, []);

  if (!announcement || !announcement.text) return null;

  return (
    <aside aria-label="Special announcements and offers" className="bg-royal-950 text-gold-300 text-xs sm:text-sm font-medium py-2 px-4 border-b border-gold-900/40 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center gap-2 flex-wrap">
        <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0 animate-pulse" />
        <span className="truncate max-w-xl text-stone-200">{announcement.text}</span>
        {announcement.link && (
          <Link
            href={announcement.link}
            className="underline font-semibold text-gold-400 hover:text-gold-200 transition-colors ml-1"
          >
            {announcement.linkText || 'Learn More'} &rarr;
          </Link>
        )}
      </div>
    </aside>
  );
}
