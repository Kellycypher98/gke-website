'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'

interface CreateCheckoutSessionParams {
  priceId: string
  eventId: string
  ticketType: string
  quantity: number
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
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
    })

    if (!session.url) {
      throw new Error('Failed to create checkout session')
    }

    redirect(session.url)
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}
