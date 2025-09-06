'use client';

import { Josefin_Sans } from 'next/font/google';
import { usePathname } from 'next/navigation';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const josefin = Josefin_Sans({ 
  subsets: ['latin'], 
  variable: '--font-josefin' 
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname === '/login';

  if (isAdminRoute) {
    return children;
  }

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${josefin.variable} antialiased`}>
        <div className="min-h-screen bg-dark-900 text-white">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
