import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware-client';
import { generateTicketQRPNG } from '@/lib/pdf/ticket';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        events (
          id,
          title,
          first_event_date,
          date,
          time_start,
          time_end,
          address,
          city,
          country,
          venue_name
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const event = ticket.events as any;
    const eventDate = event.first_event_date || event.date;
    const eventLocation = [event.address, event.city, event.country]
      .filter(Boolean)
      .join(', ');

    // Generate QR code
    const qrCodeBuffer = await generateTicketQRPNG({
      eventName: event.title,
      eventDate: eventDate,
      eventLocation: eventLocation,
      ticketType: ticket.ticket_type || 'General Admission',
      orderId: ticket.order_id,
      attendeeName: ticket.attendee_name || ticket.email,
      priceText: `${ticket.currency || 'GBP'} ${ticket.amount}`,
      quantity: ticket.quantity || 1,
    });

    const qrCodeBase64 = `data:image/png;base64,${qrCodeBuffer.toString('base64')}`;

    return NextResponse.json({
      orderId: ticket.order_id,
      eventName: event.title,
      eventDate: eventDate,
      eventLocation: eventLocation,
      ticketType: ticket.ticket_type || 'General Admission',
      attendeeName: ticket.attendee_name || ticket.email,
      price: `${ticket.currency || 'GBP'} ${ticket.amount}`,
      quantity: ticket.quantity || 1,
      qrCode: qrCodeBase64,
      ...(event.venue_name && {
        venue: {
          name: event.venue_name,
          address: event.address || '',
          city: event.city || '',
        },
      }),
      ...(event.time_start && { doorTime: event.time_start }),
      ...(event.time_end && { showTime: event.time_end }),
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
}
