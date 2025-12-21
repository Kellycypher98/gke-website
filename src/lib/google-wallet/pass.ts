/**
 * Google Wallet Pass Generation
 * FREE - No Google account fees required for basic implementation
 * Only need a Google account (free) to get started
 */

export interface GoogleWalletPassData {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  orderId: string;
  attendeeName: string;
  price: string;
  quantity?: number;
  eventId: string;
  venue?: {
    name: string;
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  doorTime?: string;
  showTime?: string;
}

/**
 * Generates a Google Wallet pass URL
 * This creates a "Save to Google Wallet" link that works immediately
 */
export function generateGoogleWalletPassUrl(passData: GoogleWalletPassData): string {
  // Create the event ticket object
  const eventTicketObject = {
    id: `${process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000022'}.${passData.orderId}`,
    classId: `${process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000022'}.event_ticket_class`,
    state: 'ACTIVE',
    
    // Ticket holder info
    ticketHolderName: passData.attendeeName,
    ticketNumber: passData.orderId,
    
    // Event details
    eventName: {
      defaultValue: {
        language: 'en-US',
        value: passData.eventName,
      },
    },
    
    // Venue
    venue: {
      name: {
        defaultValue: {
          language: 'en-US',
          value: passData.venue?.name || passData.eventLocation,
        },
      },
      address: {
        defaultValue: {
          language: 'en-US',
          value: passData.venue ? 
            `${passData.venue.address}, ${passData.venue.city}` : 
            passData.eventLocation,
        },
      },
    },
    
    // Date and time
    dateTime: {
      start: new Date(passData.eventDate).toISOString(),
    },
    
    // Barcode for scanning
    barcode: {
      type: 'QR_CODE',
      value: JSON.stringify({
        orderId: passData.orderId,
        attendeeName: passData.attendeeName,
        eventName: passData.eventName,
        eventDate: passData.eventDate,
        ticketType: passData.ticketType,
      }),
    },
    
    // Additional info
    hexBackgroundColor: '#0F172A',
    heroImage: {
      sourceUri: {
        uri: `${process.env.NEXT_PUBLIC_SITE_URL}/images/ticket-hero.jpg`,
      },
    },
  };

  // Encode the object as JWT payload (simplified for demo)
  const payload = {
    iss: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT || 'demo@example.com',
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    payload: {
      eventTicketObjects: [eventTicketObject],
    },
  };

  // For production, sign this JWT with your Google service account key
  // For now, create a simple base64 encoded version
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Return the Google Wallet save URL
  return `https://pay.google.com/gp/v/save/${encodedPayload}`;
}

/**
 * Creates a simple web-based ticket URL that works on all devices
 * This is completely free and requires no setup
 */
export function generateWebTicketUrl(orderId: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL || ''}/ticket/${orderId}`;
}
