import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCheckoutSession } from '@/lib/stripe'

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

    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    const customerEmail = session.customer_details?.email || user.email

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

    // Create a ticket in the database
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        event_id: eventId,
        ticket_type: ticketType,
        price_id: priceId,
        payment_intent_id: session.payment_intent?.toString(),
        amount_paid: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || 'GBP',
        status: 'paid'
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
