import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { TicketEmail } from '@/components/emails/TicketEmail';
import { stripe } from '@/lib/stripe';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Disable body parsing for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read the raw body as a string
async function getRawBody(readable: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!readable) {
    throw new Error('Request body is empty');
  }
  
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  
  return result + decoder.decode();
}

export async function POST(req: Request) {
  console.log('=== WEBHOOK RECEIVED ===');
  
  try {
    // Get the raw body as text
    const body = await req.text();
    
    if (!body) {
      console.error('❌ Empty request body received');
      return new NextResponse('Empty request body', { status: 400 });
    }
    
    const signature = headers().get('stripe-signature');
    if (!signature) {
      console.error('❌ No Stripe signature header found');
      return new NextResponse('No signature', { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set');
      }
      
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`✅ Webhook verified. Event type: ${event.type}`);
      
    } catch (error: any) {
      console.error('❌ Webhook signature verification failed:', error);
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
    
  } catch (error: any) {
    console.error('Error in webhook handler:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};
    const eventId = metadata.eventId || metadata.eventID;
    const ticketType = metadata.ticketType || 'standard';
    
    if (!eventId) {
      console.error('Missing eventId in checkout session metadata');
      return;
    }

    const customerEmail = session.customer_details?.email || '';
    const customerName = session.customer_details?.name || 'Customer';
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
    
    if (!customerEmail) {
      throw new Error('Customer email is required');
    }

    // Create order in database
    const orderData = {
      customerEmail,
      customerName,
      stripeSessionId: session.id,
      status: 'PAID',
      ticketType,
      quantity: 1,
      amount: parseFloat(amountTotal.toFixed(2)),
      eventId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating order:', orderData);
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    console.log('Order created successfully:', order);
    await sendConfirmationEmail(customerEmail, customerName, order.id, ticketType, amountTotal);
    
  } catch (error) {
    console.error('Error in handleCheckoutSession:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    if (paymentIntent.metadata?.stripe_session_id) {
      const { error } = await supabase
        .from('orders')
        .update({
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentIntentId: paymentIntent.id,
          updatedAt: new Date().toISOString()
        })
        .eq('stripeSessionId', paymentIntent.metadata.stripe_session_id);

      if (error) {
        console.error('Error updating order with payment intent:', error);
      } else {
        console.log('Updated order with payment intent');
      }
    }
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
    throw error;
  }
}

async function sendConfirmationEmail(
  to: string,
  name: string | undefined,
  orderId: string,
  ticketType: string,
  amount: number
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }

    console.log(`Sending confirmation email to: ${to}`);
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // First, get the order details to find the event ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order details:', orderError);
      throw new Error('Could not find order details');
    }

    // Then get the event details
    let eventDetails = {
      name: 'Global Kontakt Empire Event',
      date: new Date().toISOString(),
      location: 'Event Venue',
    };

    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', order.eventId)
        .single();

      if (!eventError && event) {
        eventDetails = {
          name: event.name || eventDetails.name,
          date: event.date || eventDetails.date,
          location: event.location || eventDetails.location,
        };
      } else {
        console.error('Error fetching event details:', eventError);
      }
    } catch (error) {
      console.error('Exception when fetching event details:', error);
    }
    
    // Generate QR code for the ticket
    const qrData = JSON.stringify({
      orderId: orderId,
      email: to,
      ticketType: ticketType,
      timestamp: new Date().toISOString(),
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    
    // Format the date for display
    const formattedDate = new Date(eventDetails.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const emailResponse = await resend.emails.send({
      from: 'tickets@globalkontaktempire.com',
      to: to,
      subject: `Your Ticket Confirmation - ${eventDetails.name}`,
      react: TicketEmail({
        eventName: eventDetails.name,
        eventDate: formattedDate,
        eventLocation: eventDetails.location,
        ticketType: ticketType,
        orderId: orderId,
        quantity: 1,
        totalAmount: `$${amount.toFixed(2)}`,
        attendeeName: name || 'Guest',
        qrCode: qrCode,
      }),
      headers: {
        'X-Entity-Ref-ID': `order-${orderId}`,
      },
    });

    if (emailResponse.error) {
      console.error('Failed to send confirmation email:', emailResponse.error);
      throw emailResponse.error;
    }

    console.log('Confirmation email sent with ticket:', emailResponse.data?.id);
    return emailResponse.data;
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw the error to prevent webhook retries for email failures
    return null;
  }
}
