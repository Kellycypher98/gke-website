import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json();
    
    if (!ticketId) {
      return NextResponse.json(
        { valid: false, error: 'No ticket ID provided' },
        { status: 400 }
      );
    }
    
    // Look up the ticket in the database
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('order_id', ticketId)
      .single();
    
    if (error || !ticket) {
      return NextResponse.json(
        { valid: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Check if ticket was already scanned within the last 24 hours
    if (ticket.scanned_at && new Date(ticket.scanned_at) > oneDayAgo) {
      return NextResponse.json({
        valid: false,
        error: 'This ticket has already been used',
        scannedAt: ticket.scanned_at,
        expiresAt: new Date(new Date(ticket.scanned_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Mark as scanned if not already
    if (!ticket.scanned_at) {
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ scanned_at: now.toISOString() })
        .eq('order_id', ticketId);
      
      if (updateError) {
        console.error('Error updating ticket status:', updateError);
        return NextResponse.json(
          { valid: false, error: 'Failed to update ticket status' },
          { status: 500 }
        );
      }
    }
    
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return NextResponse.json({
      valid: true,
      ticket: {
        orderId: ticket.order_id,
        eventName: ticket.event_name,
        attendeeName: ticket.attendee_name,
        ticketType: ticket.ticket_type,
        expiresAt: expiresAt.toISOString(),
        scannedAt: ticket.scanned_at || now.toISOString(),
        isNewScan: !ticket.scanned_at
      }
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
