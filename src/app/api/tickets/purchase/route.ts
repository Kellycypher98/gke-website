import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { normalizeOrderForDb, sanitizeDbPayload } from '@/lib/orderUtils';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { eventId, ticketTierId, quantity, userId, paymentDetails } = await request.json()
    
    // Validate input
    if (!eventId || !ticketTierId || !quantity || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = await createServerSupabaseClient();

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('Failed to fetch user details');
    }

    // Get ticket tier details to calculate total amount
    const { data: ticketTier, error: ticketTierError } = await supabase
      .from('ticket_tiers')
      .select('price')
      .eq('id', ticketTierId)
      .single();

    if (ticketTierError || !ticketTier) {
      throw new Error('Failed to fetch ticket tier details');
    }

    // Create the order using normalized, canonical fields
    const rawOrder = {
      eventId: eventId,
      ticketType: ticketTierId,
      quantity,
      amount: ticketTier.price * quantity,
      total_amount: ticketTier.price * quantity,
      status: 'pending_payment',
      paymentIntentId: paymentDetails?.paymentIntentId,
      paymentStatus: paymentDetails?.status || 'pending',
      customerEmail: user.email,
      customerName: user.full_name || ''
    };

    const payload = normalizeOrderForDb(rawOrder);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(sanitizeDbPayload(payload))
      .select()
      .single();

    if (orderError) {
      throw new Error('Failed to create order');
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error processing ticket purchase:', error)
    return NextResponse.json(
      { error: 'Failed to process ticket purchase' },
      { status: 500 }
    )
  }
}
