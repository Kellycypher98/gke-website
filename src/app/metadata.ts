import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Kontakt Empire Ltd - Experience Culture. Empower Business. Celebrate Life.',
  description: 'Premier Afrocentric event hosting and business empowerment brand. Discover our exclusive events, cultural experiences, and business opportunities.',
  keywords: 'Afrocentric events, cultural experiences, business empowerment, Afro Splash Night, Kente Banquet, GBU-UK',
  authors: [{ name: 'Global Kontakt Empire Ltd' }],
  openGraph: {
    title: 'Global Kontakt Empire Ltd',
    description: 'Experience Culture. Empower Business. Celebrate Life.',
    url: 'https://globalkontaktempire.com',
    siteName: 'Global Kontakt Empire Ltd',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Global Kontakt Empire Ltd',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Kontakt Empire Ltd',
    description: 'Experience Culture. Empower Business. Celebrate Life.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
