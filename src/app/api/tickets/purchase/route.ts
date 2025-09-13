import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server';
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

    // Create the order using direct Supabase client
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        event_id: eventId,
        ticket_tier_id: ticketTierId,
        quantity,
        total_amount: ticketTier.price * quantity,
        status: 'pending_payment',
        payment_intent_id: paymentDetails?.paymentIntentId,
        payment_status: paymentDetails?.status || 'pending',
        customer_email: user.email,
        customer_name: user.full_name || ''
      })
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
