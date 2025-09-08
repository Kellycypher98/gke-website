import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { handleCheckoutSession } from '../stripe/route'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// This is a test endpoint to simulate a Payment Link webhook
export async function GET() {
  try {
    const testSessionId = `test_sess_${Date.now()}`;
    const testPaymentLinkId = `https://buy.stripe.com/test_4gMfZi9JscazcklasX2sM00`;
    const testEventId = 'test-event-123';
    const testTicketType = 'test';
    const testEmail = 'test@example.com';
    const testName = 'Test User';
    const testAmount = 1000;

    // 1. First, simulate the checkout.session.completed event
    const checkoutSession = {
      id: testSessionId,
      object: 'checkout.session',
      payment_intent: `pi_${Date.now()}`,
      payment_link: testPaymentLinkId,
      mode: 'payment',
      metadata: {
        eventId: testEventId,
        ticketType: testTicketType
      },
      customer_details: {
        email: testEmail,
        name: testName
      },
      customer_email: testEmail,
      amount_total: testAmount,
      currency: 'usd',
      payment_status: 'paid',
      status: 'complete',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cancel`,
      created: Math.floor(Date.now() / 1000)
    };

    // 2. Simulate the payment_intent.succeeded event
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      object: 'payment_intent',
      amount: testAmount,
      currency: 'usd',
      metadata: {
        eventId: testEventId,
        ticketType: testTicketType,
        stripe_session_id: testSessionId
      },
      payment_method: 'pm_card_visa',
      status: 'succeeded',
      receipt_email: testEmail,
      created: Math.floor(Date.now() / 1000)
    };

    // Directly call the webhook handler with the checkout.session.completed event
    try {
      await handleCheckoutSession(checkoutSession as any);
      console.log('Successfully processed checkout session');
      
      // In a real scenario, the payment_intent.succeeded would come from Stripe
      // For testing, we can simulate it by calling the handler directly
      try {
        // Update the booking status to paid
        const { data: booking, error } = await supabase
          .from('bookings')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_intent_id: paymentIntent.id,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_session_id', testSessionId)
          .select()
          .single();
          
        if (error) throw error;
        
        return NextResponse.json({
          success: true,
          message: 'Test completed successfully',
          bookingId: booking?.id,
          sessionId: testSessionId,
          paymentIntentId: paymentIntent.id
        });
      } catch (updateError) {
        console.error('Error updating booking:', updateError);
        throw updateError;
      }
    } catch (error) {
      console.error('Error in test webhook:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
