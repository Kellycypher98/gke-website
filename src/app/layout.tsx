'use client';

import { Josefin_Sans } from 'next/font/google';
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
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${josefin.variable} antialiased min-h-screen bg-dark-900 text-white`}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
