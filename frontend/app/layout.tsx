import type { Metadata } from 'next';
import './globals.css';
import ClientLayoutShell from '../components/ClientLayoutShell';

export const metadata: Metadata = {
  title: 'Shree Mithai & Royal Confectionery | Artisanal Sweets & Advance Event Catering',
  description:
    'Experience royal Indian artisanal sweets made with 100% pure A2 Desi Cow Ghee. Order instant sweet boxes or schedule bespoke advance event catering for weddings, birthdays, and festivals.',
  keywords: [
    'Sweets',
    'Mithai',
    'Kaju Katli',
    'Motichoor Ladoo',
    'Event Catering',
    'Wedding Sweet Boxes',
    'Indian Sweets Online',
    'Pure Desi Ghee Sweets',
  ],
  openGraph: {
    title: 'Shree Mithai & Royal Confectionery',
    description: 'Pure artisanal Indian sweets and bespoke advance event booking.',
    images: ['https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1200&q=80'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600&display=swap"
          rel="stylesheet"
        />
        {/* Razorpay Checkout JavaScript SDK */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <ClientLayoutShell>{children}</ClientLayoutShell>
      </body>
    </html>
  );
}
