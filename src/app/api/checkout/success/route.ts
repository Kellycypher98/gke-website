import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCheckoutSession } from '@/lib/stripe'
import { sendTicketEmail } from '@/lib/email'

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
    const customerName = session.customer_details?.name || 'Guest'
    
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No customer email found' },
        { status: 400 }
      )
    }

    // Get event and ticket details from session metadata
    const { eventId, ticketType = 'standard', quantity = 1 } = session.metadata || {}
    const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00'

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID not found in session' },
        { status: 400 }
      )
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      console.error('Error fetching event:', eventError)
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Create an order with all necessary details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        "customerEmail": customerEmail,
        "customerName": customerName,
        "stripeSessionId": sessionId,
        "status": 'PAID',
        "ticketType": ticketType,
        "quantity": parseInt(quantity) || 1,
        "amount": parseFloat(amountTotal) || 0,
        "eventId": eventId
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

    // Send ticket confirmation email
    if (order) {
      try {
        const emailResult = await sendTicketEmail({
          eventName: event.title,
          eventDate: event.start_date,
          eventLocation: event.venue_name || 'TBD',
          ticketType: ticketType,
          orderId: order.id,
          quantity: parseInt(quantity) || 1,
          totalAmount: `$${amountTotal}`,
          attendeeName: customerName,
          attendeeEmail: customerEmail
        });

        if (!emailResult.success) {
          console.error('Failed to send email:', emailResult.error);
          // Don't fail the request if email fails, just log it
        }
      } catch (emailError) {
        console.error('Error in email sending:', emailError);
        // Continue with the response even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order processed successfully',
      order
    })

  } catch (error) {
    console.error('Error processing payment success:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
