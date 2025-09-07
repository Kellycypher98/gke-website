import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { stripe, verifyWebhookSignature } from '@/lib/stripe'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Disable body parsing for webhook verification
// This is required to verify the raw body
// @ts-ignore - Next.js 13+ specific
// See: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming
// and: https://github.com/vercel/next.js/discussions/39999
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper to read the raw body as a string
async function getRawBody(readable: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!readable) {
    throw new Error('Request body is empty')
  }
  
  const reader = readable.getReader()
  const decoder = new TextDecoder()
  let result = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result += decoder.decode(value, { stream: true })
  }
  
  return result + decoder.decode()
}

export async function POST(req: Request) {
  try {
    // Read the raw body
    const rawBody = await getRawBody(req.body)
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
      return new NextResponse('No signature', { status: 400 })
    }

    let event: Stripe.Event

    try {
      // Verify the webhook signature
      event = verifyWebhookSignature(rawBody, signature)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return new NextResponse(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Received event type: ${event.type}`)

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Processing checkout.session.completed event for session:', session.id)
      await handleCheckoutSession(session)
    }
    // Handle payment_intent.succeeded for additional payment confirmation
    else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('PaymentIntent was successful:', paymentIntent.id)
      // You might want to update the booking status here if needed
    }
    // Handle other event types as needed
    // else if (event.type === 'payment_intent.succeeded') { ... }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error in webhook handler:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  try {
    // Get the metadata we passed to the Checkout Session
    const { eventId, ticketType } = session.metadata || {}
    
    if (!eventId || !ticketType) {
      console.error('Missing metadata in checkout session:', session.id)
      return
    }

    // Get the customer email and name from the session with proper type checking
    const customerEmail = session.customer_details?.email
    const customerName = session.customer_details?.name || undefined
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id
    
    if (!customerEmail) {
      throw new Error('Customer email is required')
    }

    console.log('Creating booking for event:', eventId, 'ticket type:', ticketType)

    // Insert the booking into your database
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([
        {
          event_id: eventId,
          ticket_type: ticketType,
          customer_email: customerEmail,
          customer_name: customerName,
          amount_paid: amountTotal,
          payment_status: 'paid',
          payment_intent_id: paymentIntentId,
          stripe_session_id: session.id,
          status: 'confirmed',
          // Include any other fields your bookings table requires
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      // Implement retry logic here if needed
      throw error
    }

    console.log('Booking created successfully:', booking)

    // Update the event's ticket count if needed
    await updateEventTicketCount(eventId, ticketType)

    // Send confirmation email (you'll need to implement this)
    await sendConfirmationEmail({
      to: customerEmail,
      name: customerName,
      eventId,
      ticketType,
      amount: amountTotal,
      bookingId: booking.id
    })

    return booking

  } catch (error) {
    console.error('Error in handleCheckoutSession:', error)
    // Implement proper error handling and retry logic
    throw error
  }
}

async function updateEventTicketCount(eventId: string, ticketType: string) {
  try {
    // Get current event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) throw eventError
    if (!event) throw new Error('Event not found')

    // Update the appropriate ticket count
    const updateField = ticketType === 'early_bird' 
      ? 'early_bird_tickets_sold' 
      : 'standard_tickets_sold'

    const { error: updateError } = await supabase
      .from('events')
      .update({
        [updateField]: (event[updateField] || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)

    if (updateError) throw updateError

    console.log(`Updated ${ticketType} ticket count for event ${eventId}`)
  } catch (error) {
    console.error('Error updating event ticket count:', error)
    // Consider implementing a retry mechanism for this
  }
}

// You'll need to implement this function based on your email service
type SendEmailParams = {
  to: string
  name?: string
  eventId: string
  ticketType: string
  amount: number
  bookingId: string
}

async function sendConfirmationEmail(params: SendEmailParams) {
  // Implement your email sending logic here
  // This could use SendGrid, Resend, or any other email service
  console.log('Sending confirmation email to:', params.to)
  
  // Example implementation (you'll need to replace this with your actual email service)
  /*
  const response = await fetch('https://api.your-email-service.com/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`
    },
    body: JSON.stringify({
      to: params.to,
      subject: `Your Ticket Confirmation - Booking #${params.bookingId}`,
      html: `
        <h1>Thank you for your purchase, ${params.name || 'there'}!</h1>
        <p>Your booking has been confirmed.</p>
        <p><strong>Event ID:</strong> ${params.eventId}</p>
        <p><strong>Ticket Type:</strong> ${params.ticketType}</p>
        <p><strong>Amount Paid:</strong> $${params.amount.toFixed(2)}</p>
        <p>You'll receive another email with your ticket details soon.</p>
      `
    })
  })

  if (!response.ok) {
    throw new Error('Failed to send confirmation email')
  }
  */
  
  console.log('Confirmation email sent to:', params.to)
}
