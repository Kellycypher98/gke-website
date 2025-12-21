import React from 'react';
import Link from 'next/link';

interface DigitalTicketButtonProps {
  orderId: string;
  variant?: 'default' | 'email' | 'compact';
  className?: string;
}

export function DigitalTicketButton({ orderId, variant = 'default', className = '' }: DigitalTicketButtonProps) {
  if (variant === 'email') {
    return (
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <a
          href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://globalkontaktempire.com'}/ticket/${orderId}`}
          style={{
            display: 'inline-block',
            backgroundColor: '#EAB308',
            color: '#000000',
            padding: '14px 28px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '15px',
            textAlign: 'center',
            marginBottom: '10px',
          }}
        >
          🎟️ View Your Ticket
        </a>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          Save to home screen for quick access
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        <Link
          href={`/ticket/${orderId}`}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          🎟️ View Digital Ticket
        </Link>
        <p className="text-xs text-gray-400 text-center">
          Works on all devices • No app required
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/ticket/${orderId}`}
      className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 3v4M8 3v4M2 11h20"/>
      </svg>
      View Digital Ticket
    </Link>
  );
}
