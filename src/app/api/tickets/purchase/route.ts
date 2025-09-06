import { NextResponse } from 'next/server'
import { writeOperations } from '@/lib/supabase/write-operations'

export async function POST(request: Request) {
  try {
    const { eventId, ticketTierId, quantity, userId, paymentDetails } = await request.json()
    
    // Validate input
    if (!eventId || !ticketTierId || !quantity || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the order
    const order = await writeOperations.createOrder({
      user_id: userId,
      event_id: eventId,
      ticket_tier_id: ticketTierId,
      quantity,
      total_amount: 0, // Calculate based on ticket price
      status: 'pending_payment',
      payment_intent_id: paymentDetails?.paymentIntentId,
      payment_status: paymentDetails?.status || 'pending',
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error processing ticket purchase:', error)
    return NextResponse.json(
      { error: 'Failed to process ticket purchase' },
      { status: 500 }
    )
  }
}
