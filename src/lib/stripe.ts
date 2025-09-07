import Stripe from 'stripe'
import { CheckoutSessionMetadata } from '@/types/stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Create a checkout session
export async function createCheckoutSession({
  priceId,
  eventId,
  ticketType,
  quantity = 1,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  priceId: string
  eventId: string
  ticketType: 'early_bird' | 'standard'
  quantity?: number
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      eventId,
      ticketType,
    },
  })

  return session
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
) {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    throw new Error('Webhook signature verification failed')
  }
}

// Get checkout session by ID
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  })
}
