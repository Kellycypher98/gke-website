import { Stripe } from 'stripe'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_SECRET_KEY: string
      STRIPE_WEBHOOK_SECRET: string
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
      // Add other environment variables as needed
    }
  }
}

// Extend the Request interface to include the rawBody for webhook verification
declare module 'http' {
  interface IncomingMessage {
    rawBody?: Buffer | string
  }
}

// Type definitions for webhook events
export interface StripeWebhookEvent extends Stripe.Event {
  data: {
    object: Stripe.Checkout.Session | Stripe.PaymentIntent | any // Extend with other object types as needed
  }
}

// Type for the metadata you'll pass to the checkout session
export interface CheckoutSessionMetadata {
  eventId: string
  ticketType: 'early_bird' | 'standard'
  // Add any other metadata fields you need
}
