import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { TicketEmail } from '@/components/emails/TicketEmail';
import { generateTicketPDF, generateTicketQRPNG } from '@/lib/pdf/ticket';
import { stripe } from '@/lib/stripe';
import { normalizeOrderForDb, sanitizeDbPayload } from '@/lib/orderUtils';

// Ensure this route runs on the Node.js runtime (required for Stripe signature verification)
export const runtime = 'nodejs';
// Ensure no caching/static optimization interferes with webhooks
export const dynamic = 'force-dynamic';

declare global {
  // eslint-disable-next-line no-var
  var console: Console;
}

// Optional: respond to GET for health checks (Stripe sometimes pings or you may test in browser)
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

interface EventDetails {
  name: string;
  date: string;
  location: string;
  currency: string;
  price: number;
}

interface TicketPrices {
  gate: number;
  early_bird: number;
  currency: string;
  [key: string]: any;
}

interface EventData {
  id?: string;
  title?: string;
  date?: string;
  time_start?: string;
  address?: string;
  city?: string;
  country?: string;
  ticket_prices?: string | TicketPrices;
  [key: string]: any;
}

interface OrderData {
  id: string;
  eventId: string;
  [key: string]: any;
}

// NOTE: We create a Supabase server client per-request using
// `createServerSupabaseClient()` which will pick the service role key
// or fall back safely. Creating a client at import-time with an empty
// key can lead to silent permission failures.

async function getSupabaseClient() {
  return await createServerSupabaseClient();
}

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
  console.log('=== WEBHOOK RECEIVED (POST) ===');
  console.log('Supabase keys present:', {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
  });
  
  try {
    // Read raw body bytes for Stripe signature verification
    const raw = await req.arrayBuffer();
    const bodyBuffer = Buffer.from(raw);
    const hdrs = await headers();
    const contentLength = hdrs.get('content-length');
    console.log('Headers received:', {
      'content-type': hdrs.get('content-type'),
      'content-length': contentLength,
      'stripe-signature-present': !!hdrs.get('stripe-signature'),
    });
    
    if (!bodyBuffer || bodyBuffer.length === 0) {
      console.error('❌ Empty request body received');
      return new NextResponse('Empty request body', { status: 400 });
    }
    
    const signature = hdrs.get('stripe-signature');
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
      
      event = stripe.webhooks.constructEvent(bodyBuffer, signature, webhookSecret);
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

export async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  try {
    console.log('=== PROCESSING CHECKOUT SESSION ===');
    console.log('Session ID:', session.id);
    console.log('Mode:', session.mode);
    console.log('Payment Link ID:', (session as any).payment_link);
    console.log('Metadata:', session.metadata);
    console.log('Customer email:', session.customer_details?.email || session.customer_email);

    // Create a server-side Supabase client for DB operations
    const supabase = await getSupabaseClient();

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
    
    // Get quantity from metadata first, then from line items
    let quantity = parseInt(metadata.quantity) || 1; // Try metadata first
    try {
      console.log('Fetching line items for session:', session.id);
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      console.log('Line items found:', lineItems.data.length);
      
      if (lineItems.data.length > 0) {
        const firstItem = lineItems.data[0];
        const lineItemQuantity = firstItem.quantity || 1;
        // Use line item quantity if it's different from metadata (line items are more reliable)
        if (lineItemQuantity !== quantity) {
          quantity = lineItemQuantity;
          console.log('Updated quantity from line items:', quantity, '(was from metadata:', parseInt(metadata.quantity) || 1, ')');
        } else {
          console.log('Quantity matches metadata:', quantity);
        }
        
        // Try to get event ID from price metadata if available
        const priceId = firstItem.price?.id;
        if (priceId && !eventId) {
          const price = await stripe.prices.retrieve(priceId as string);
          if (price.metadata?.eventId) {
            eventId = price.metadata.eventId;
            console.log('Extracted eventId from price metadata:', eventId);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching line items or price:', error);
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
    const rawOrderData: any = {
      customerEmail: customerEmail || session.customer_email || session.customer_details?.email || '',
      customerName: customerName || session.customer_details?.name || 'Customer',
      stripeSessionId: session.id,
      status: 'processing', // Start with processing status
      ticketType,
      quantity: quantity, // Use actual quantity from line items
      amount: parseFloat(amountTotal.toFixed(2)),
      paymentStatus: 'pending', // Start with pending status
      updatedAt: new Date().toISOString(),
      paymentLinkId: (session as any).payment_link || null,
      metadata: JSON.stringify({
        ...metadata,
        paymentLink: (session as any).payment_link,
        mode: session.mode,
        paymentIntent: session.payment_intent,
        customer: session.customer,
        webhookSource: 'checkout.session.completed'
      })
    };
    
    // Only add eventId if we have it
    if (eventId) {
      rawOrderData.eventId = eventId;
    } else {
      console.warn('No event ID found for order, using default');
      rawOrderData.eventId = 'default-event-id';
    }

    // Normalize payload to canonical DB column names
    const orderData = normalizeOrderForDb(rawOrderData);

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
      const createPayload = sanitizeDbPayload({ ...orderData, createdAt: new Date().toISOString() });
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert(createPayload)
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
    console.log('Processing payment_intent.succeeded for payment intent:', paymentIntent.id);
    
    // Create supabase client per-request
    const supabase = await getSupabaseClient();

    // Find the order by payment intent ID in the metadata
    // First try exact match, then fallback to like search
    let orders = [];
    let fetchError = null;
    
    // Try to find by exact paymentIntent match
    const { data: exactOrders, error: exactError } = await supabase
      .from('orders')
      .select('*')
      .contains('metadata', { paymentIntent: paymentIntent.id });
    
    if (exactOrders && exactOrders.length > 0) {
      orders = exactOrders;
    } else {
      // Fallback to like search
      const { data: likeOrders, error: likeError } = await supabase
        .from('orders')
        .select('*')
        .like('metadata', `%"paymentIntent":"${paymentIntent.id}"%`);
      
      orders = likeOrders || [];
      fetchError = likeError;
    }

    if (fetchError || !orders || orders.length === 0) {
      console.error('Order not found for payment intent:', paymentIntent.id, fetchError);
      console.log('Searched for payment intent:', paymentIntent.id);
      console.log('Available orders:', orders);
      return;
    }

    const order = orders[0]; // Take the first matching order
    console.log('Found order for payment intent:', order.id, 'Current status:', order.status, 'Payment status:', order.paymentStatus);

    // Only proceed if payment isn't already marked as paid
    if (order.paymentStatus !== 'paid') {
      console.log(`Updating order ${order.id} to paid status`);
      
      const updates = {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentIntentId: paymentIntent.id,
        updatedAt: new Date().toISOString(),
        metadata: JSON.stringify({
          ...(order.metadata ? JSON.parse(order.metadata) : {}),
          paymentIntentStatus: paymentIntent.status,
          paymentIntentId: paymentIntent.id,
          webhookSource: 'payment_intent.succeeded'
        })
      };

      const { error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating order with payment intent:', updateError);
        return;
      }

      console.log(`Successfully updated order ${order.id} to paid status`);
      
      // Only send confirmation email if it hasn't been sent yet
      if (!order.confirmation_sent) {
        console.log(`Sending confirmation email for order ${order.id}`);
        await sendConfirmationEmail(
          order.customerEmail,
          order.customerName,
          order.id,
          order.ticketType,
          order.amount
        );
        
        // Mark confirmation as sent
        await supabase
          .from('orders')
          .update({ confirmation_sent: true })
          .eq('id', order.id);
      }
    } else {
      console.log(`Order ${order.id} is already marked as paid`);
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
): Promise<any> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set — skipping sending email (development mode)');
      return { success: false, error: 'RESEND_API_KEY not set' };
    }

    console.log(`Sending confirmation email to: ${to}`);

    const resend = new Resend(process.env.RESEND_API_KEY);
    // Create a server-side Supabase client for DB operations
    const supabase = await getSupabaseClient();

    // First, get the order details to find the event ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single<OrderData>();

    if (orderError || !order) {
      console.error('Error fetching order details:', orderError);
      throw new Error('Could not find order details');
    }

    // Get the event details from the database
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', order.eventId)
      .single<EventData>();

    if (eventError || !event) {
      console.error('Error fetching event details:', eventError);
      throw new Error('Could not find event details');
    }

    // Parse ticket prices from the event data
    let ticketPrices: TicketPrices = {
      gate: 0,
      early_bird: 0,
      currency: 'GBP'
    };

    try {
      if (event.ticket_prices && typeof event.ticket_prices === 'string') {
        ticketPrices = { ...ticketPrices, ...JSON.parse(event.ticket_prices) };
      } else if (typeof event.ticket_prices === 'object') {
        ticketPrices = { ...ticketPrices, ...event.ticket_prices };
      }
    } catch (e) {
      console.error('Error parsing ticket prices:', e);
    }

    // Format the event details
    if (!event) {
      throw new Error('Event data is missing');
    }
    const eventData: EventData = event;
    
    // Parse the date from the database format (YYYY-MM-DD) and time (HH:MM:SS)
    let eventDateTime: Date;
    
    try {
      if (!eventData.date) {
        throw new Error('Event date is missing');
      }
      
      // Parse the date parts (YYYY-MM-DD)
      const [year, month, day] = eventData.date.split('-').map(Number);
      
      // Parse the time parts (HH:MM:SS)
      let hours = 0, minutes = 0, seconds = 0;
      if (eventData.time_start) {
        const [h, m, s] = eventData.time_start.split(':').map(Number);
        hours = h || 0;
        minutes = m || 0;
        seconds = s || 0;
      }
      
      // Create date in local timezone
      eventDateTime = new Date(year, month - 1, day, hours, minutes, seconds);
      
      // Validate the date
      if (isNaN(eventDateTime.getTime())) {
        throw new Error('Failed to create valid date');
      }
      
      // Final validation
      if (isNaN(eventDateTime.getTime())) {
        throw new Error('Invalid date format');
      }
      
    } catch (error) {
      console.error('Error parsing date:', error);
      console.error('Date string:', eventData.date);
      console.error('Time string:', eventData.time_start);
      throw new Error('Could not parse event date');
    }
    
    const location = [eventData.address, eventData.city, eventData.country]
      .filter(Boolean)
      .join(', ');

    // Format the date for display in UK format with time
    const formatDate = (date: Date): string => {
      return date.toLocaleString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/London'
      });
    };
    
    const formattedDate = formatDate(eventDateTime);
    
    // Format the currency
    const formatCurrency = (amount: number, currency: string = 'GBP'): string => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };
    
    const formattedAmount = formatCurrency(
      ticketPrices.early_bird || ticketPrices.gate || 0,
      ticketPrices.currency || 'GBP'
    );
    
    const eventDetails: EventDetails = {
      name: eventData.title || 'Global Kontakt Empire Event',
      date: eventDateTime.toISOString(),
      location: location || 'Location not specified',
      currency: ticketPrices.currency || 'GBP',
      price: ticketPrices.early_bird || ticketPrices.gate || 0,
    };
    
    // Generate QR code for the ticket
    const qrData = JSON.stringify({
      orderId: orderId,
      email: to,
      ticketType: ticketType,
      timestamp: new Date().toISOString(),
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    
    // Build attachment payload using actual order data
    const ticketPayload = {
      eventName: eventDetails.name,
      eventDate: formattedDate,
      eventLocation: eventDetails.location,
      ticketType,
      orderId,
      attendeeName: name || 'Guest',
      priceText: `£${order.amount}`, // Use actual order amount instead of ticket price
      quantity: order.quantity || 1, // Add quantity information
      qrData: JSON.stringify({ orderId, email: to, ts: new Date().toISOString() })
    };

    // Generate attachments with robust fallback: PNG is required, PDF is optional
    const qrPng = await generateTicketQRPNG(ticketPayload);
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await generateTicketPDF(ticketPayload);
    } catch (e) {
      console.error('PDF generation failed, sending email without PDF attachment:', e);
    }

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
        quantity: order.quantity || 1,
        totalAmount: `£${order.amount}`,
        attendeeName: name || 'Guest',
        qrCode: qrCode,
      }),
      attachments: (
        [
          pdfBuffer ? { filename: `ticket-${orderId}.pdf`, content: pdfBuffer, contentType: 'application/pdf' } : null,
          { filename: `ticket-qr-${orderId}.png`, content: qrPng, contentType: 'image/png' },
        ].filter(Boolean) as any[]
      ),
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
