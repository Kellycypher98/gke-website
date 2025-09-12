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
    console.log('=== PROCESSING CHECKOUT SESSION ===');
    console.log('Session ID:', session.id);
    console.log('Mode:', session.mode);
    console.log('Payment Link ID:', (session as any).payment_link);
    console.log('Metadata:', session.metadata);
    console.log('Customer email:', session.customer_details?.email || session.customer_email);

    // Check if we've already processed this session
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, confirmation_sent')
      .eq('stripeSessionId', session.id)
      .maybeSingle();

    // If order exists and confirmation was already sent, skip processing
    if (existingOrder?.confirmation_sent) {
      console.log(`Order ${existingOrder.id} already processed, skipping`);
      return;
    }

    const metadata = session.metadata || {};
    // For payment links, we might need to get event ID from line items or other sources
    let eventId = metadata.eventId || metadata.eventID;
    const ticketType = metadata.ticketType || 'standard';
    
    // If no event ID in metadata, try to get it from line items
    if (!eventId && session.line_items) {
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        if (lineItems.data.length > 0) {
          const priceId = lineItems.data[0].price?.id;
          if (priceId) {
            // Try to get event ID from price metadata if available
            const price = await stripe.prices.retrieve(priceId as string);
            if (price.metadata?.eventId) {
              eventId = price.metadata.eventId;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching line items or price:', error);
      }
    }
    
    if (!eventId) {
      console.error('Missing eventId in checkout session metadata');
      // For payment links, we might want to use a default event ID or handle it differently
      // For now, we'll log the error but proceed with the order
      console.log('Proceeding with order without event ID for payment link');
    }

    const customerEmail = session.customer_details?.email || '';
    const customerName = session.customer_details?.name || 'Customer';
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
    
    if (!customerEmail) {
      throw new Error('Customer email is required');
    }

    // Create or update order in database
    const orderData: any = {
      customerEmail: customerEmail || session.customer_email || session.customer_details?.email || '',
      customerName: customerName || session.customer_details?.name || 'Customer',
      stripeSessionId: session.id,
      status: 'PAID',
      ticketType,
      quantity: 1, // Default quantity, can be updated from line items if needed
      amount: parseFloat(amountTotal.toFixed(2)),
      paymentStatus: 'paid',
      updatedAt: new Date().toISOString(),
      // Store payment link ID if available
      paymentLinkId: (session as any).payment_link || null,
      // Store metadata for debugging
      metadata: JSON.stringify({
        ...metadata,
        paymentLink: (session as any).payment_link,
        mode: session.mode,
        paymentIntent: session.payment_intent,
        customer: session.customer
      })
    };
    
    // Only add eventId if we have it
    if (eventId) {
      orderData.eventId = eventId;
    } else {
      // If we don't have an event ID, we need to handle this case
      // For now, we'll use a default event ID or leave it null
      console.warn('No event ID found for order, using default');
      orderData.eventId = 'default-event-id'; // Replace with your default event ID or handle differently
    }

    let order;
    if (existingOrder) {
      // Update existing order
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', existingOrder.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating order:', updateError);
        throw updateError;
      }
      order = updatedOrder;
    } else {
      // Create new order
      orderData.createdAt = new Date().toISOString();
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating order:', createError);
        throw createError;
      }
      order = newOrder;
    }

    console.log('Order processed successfully:', order.id);
    
    // Only send email if it hasn't been sent yet
    if (!existingOrder?.confirmation_sent) {
      await sendConfirmationEmail(customerEmail, customerName, order.id, ticketType, amountTotal);
      
      // Mark confirmation as sent in the database
      await supabase
        .from('orders')
        .update({ confirmation_sent: true })
        .eq('id', order.id);
    }
    
  } catch (error) {
    console.error('Error in handleCheckoutSession:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    if (paymentIntent.metadata?.stripe_session_id) {
      // Just update the payment status, don't send any emails
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
        console.log('Updated order payment status with payment intent');
      }
    }
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
    // Don't throw the error to prevent webhook retries for non-critical updates
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
