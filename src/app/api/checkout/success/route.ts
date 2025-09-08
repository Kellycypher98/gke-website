import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCheckoutSession } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    )
  }

  try {
    // Get the full session with expanded data
    const session = await getCheckoutSession(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // Get the customer email from the session
    const customerEmail = session.customer_details?.email || session.customer_email
    
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No customer email found' },
        { status: 400 }
      )
    }
    
    // Try to get the user if they're authenticated
    const { data: { user } } = await supabase.auth.getUser()
    

    // Get event and ticket details from session metadata
    const { eventId, ticketType = 'standard' } = session.metadata || {}
    const priceId = session.line_items?.data[0]?.price?.id
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID not found in session' },
        { status: 400 }
      )
    }

    // Create an order with all necessary details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        userId: user?.id || null,
        eventId: eventId,
        status: 'PAID',
        amount: session.amount_total ? session.amount_total / 100 : 0,
        paymentIntentId: session.payment_intent?.toString(),
        paymentStatus: session.payment_status,
        paymentMethod: session.payment_method_types?.[0],
        "customerEmail": customerEmail,
        "customerName": session.customer_details?.name || null,
        "stripeSessionId": sessionId,
        "ticketType": session.metadata?.ticketType || 'standard'
      })
      .select()
      .single()
    
    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }
    
    // Create a ticket in the database
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create a service role client for admin operations
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    const { data: ticket, error } = await serviceRoleClient
      .from('tickets')
      .insert({
        "orderId": order.id,
        "eventId": eventId,
        "userId": user?.id || null,
        "userEmail": customerEmail,
        "ticketTierId": priceId || 'standard', // Fallback to 'standard' if priceId is not available
        "ticketNumber": ticketNumber,
        "status": 'CONFIRMED'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      )
    }

    // Update the event's sold count
    await supabase.rpc('increment_event_sold', {
      event_id: eventId,
      increment_by: 1
    })

    return NextResponse.json({
      success: true,
      message: 'Ticket purchased successfully',
      ticket
    })

  } catch (error) {
    console.error('Error processing payment success:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
