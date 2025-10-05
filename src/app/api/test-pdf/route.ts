import { NextRequest, NextResponse } from 'next/server'
import { generateThemedTicket, type TicketPayload } from '@/lib/pdf/ticket'

// Sample ticket data matching the preview page
const sampleTickets: Record<string, TicketPayload> = {
  concert: {
    eventName: "Summer Music Festival 2025",
    eventDate: "July 15, 2025 @ 7:00 PM",
    eventLocation: "Central Park Amphitheater",
    ticketType: "VIP",
    orderId: "ORD-2025-789456",
    attendeeName: "John Smith",
    priceText: "$150.00",
    quantity: 2,
    venue: {
      name: "Central Park Amphitheater",
      address: "1234 Park Avenue",
      city: "New York, NY"
    },
    doorTime: "6:00 PM",
    showTime: "7:30 PM",
    ageRestriction: "18+",
    genre: "Rock/Pop",
    qrData: JSON.stringify({ orderId: 'ORD-2025-789456', email: 'john@example.com', ts: new Date().toISOString() })
  },
  theater: {
    eventName: "The Phantom of the Opera",
    eventDate: "August 20, 2025 @ 8:00 PM",
    eventLocation: "Grand Theater",
    ticketType: "Premium",
    orderId: "ORD-2025-123789",
    attendeeName: "Sarah Johnson",
    priceText: "$89.50",
    quantity: 1,
    venue: {
      name: "Grand Theater",
      address: "567 Broadway",
      city: "New York, NY"
    },
    doorTime: "7:30 PM",
    showTime: "8:00 PM",
    ageRestriction: "All Ages",
    genre: "Musical Theater",
    qrData: JSON.stringify({ orderId: 'ORD-2025-123789', email: 'sarah@example.com', ts: new Date().toISOString() })
  },
  sports: {
    eventName: "Championship Finals 2025",
    eventDate: "September 10, 2025 @ 3:00 PM",
    eventLocation: "National Stadium",
    ticketType: "General Admission",
    orderId: "ORD-2025-456123",
    attendeeName: "Mike Davis",
    priceText: "$75.00",
    quantity: 4,
    venue: {
      name: "National Stadium",
      address: "789 Sports Complex Dr",
      city: "Los Angeles, CA"
    },
    doorTime: "2:00 PM",
    showTime: "3:00 PM",
    ageRestriction: "All Ages",
    genre: "Sports",
    qrData: JSON.stringify({ orderId: 'ORD-2025-456123', email: 'mike@example.com', ts: new Date().toISOString() })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const theme = searchParams.get('theme') as 'modern' | 'classic' | 'vibrant' | 'minimal' || 'modern'
    const sample = searchParams.get('sample') || 'concert'
    
    // Get the sample payload or use default
    const testPayload = sampleTickets[sample] || sampleTickets.concert

    console.log('Generating test PDF with theme:', theme, 'sample:', sample);

    const pdfBuffer = await generateThemedTicket(testPayload, theme);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="test-ticket.pdf"',
      },
    });
  } catch (error) {
    console.error('Test PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate test PDF', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
