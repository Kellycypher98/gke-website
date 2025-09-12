import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCheckoutSession } from '@/lib/stripe'
import { sendTicketEmail } from '@/lib/email'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  
  // Create a response that we'll modify later
  const response = NextResponse;

  if (!sessionId) {
    return response.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
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

    // Check if order already exists for this session
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, confirmation_sent, status')
      .eq('stripeSessionId', sessionId)
      .maybeSingle();
      
    // If order doesn't exist, try to get it from Stripe
    if (!existingOrder) {
      return response.json(
        { 
          success: true, 
          message: 'Payment processing. You will receive a confirmation email shortly.',
          status: 'processing'
        },
        { status: 200 }
      );
    }

    let order;
    
    if (existingOrder) {
      // Order exists, update payment status if needed
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'PAID',
          paymentStatus: 'paid',
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingOrder.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating order:', updateError);
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        );
      }
      order = updatedOrder;
    } else {
      // Create new order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          customerEmail: customerEmail,
          customerName: customerName,
          stripeSessionId: sessionId,
          status: 'PAID',
          paymentStatus: 'paid',
          ticketType: ticketType,
          quantity: parseInt(quantity) || 1,
          amount: parseFloat(amountTotal) || 0,
          eventId: eventId,
          confirmation_sent: false, // Will be set to true after email is sent
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        return NextResponse.json(
          { error: 'Failed to create order' },
          { status: 500 }
        );
      }
      order = newOrder;
    }

    // Only send email if it hasn't been sent yet and order is paid
    if (order && order.status === 'PAID' && !existingOrder?.confirmation_sent) {
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

        if (emailResult.success) {
          // Mark email as sent in the database
          await supabase
            .from('orders')
            .update({ confirmation_sent: true })
            .eq('id', order.id);
        } else {
          console.error('Failed to send email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error in email sending:', emailError);
      }
    }

    // Redirect to success page with order ID
    const successUrl = new URL('/order/success', request.url);
    successUrl.searchParams.set('order_id', order.id);
    
    return response.redirect(successUrl.toString());

  } catch (error) {
    console.error('Error processing payment success:', error);
    const redirectUrl = new URL('/order/error', request.url);
    redirectUrl.searchParams.set('message', 'There was an error processing your payment. Please contact support if the issue persists.');
    
    return response.redirect(redirectUrl.toString());
  }
}
