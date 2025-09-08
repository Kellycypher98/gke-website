'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import getStripe from '@/lib/stripe-client'

export async function createCheckoutSession(params: {
  amount: number
  currency: string
  eventId: string
  ticketType: string
  quantity: number
  successUrl: string
  cancelUrl: string
}) {
  try {
    const stripeInstance = await stripe;
    if (!stripeInstance) {
      throw new Error('Stripe is not initialized');
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: `Event Ticket - ${params.ticketType.replace('_', ' ').toUpperCase()}`,
            },
            unit_amount: Math.round(params.amount * 100), // Convert to cents
          },
          quantity: params.quantity,
        },
      ],
      mode: 'payment',
      success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl,
      metadata: {
        eventId: params.eventId,
        ticketType: params.ticketType,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return { sessionId: session.id, url: session.url };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}
