import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email)
      .single()

    if (existingSubscription) {
      if (existingSubscription.active) {
        return NextResponse.json(
          { success: false, message: 'This email is already subscribed.' },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        const { data: subscription, error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({ active: true })
          .eq('email', email)
          .select()
          .single()

        if (updateError) throw updateError

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated.',
          subscription,
        })
      }
    }

    // Create new subscription
    const { data: subscription, error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert([
        {
          email,
          user_id: userId,
          active: true,
        }
      ])
      .select()
      .single()
    
    if (insertError) throw insertError

    return NextResponse.json({
      message: 'Newsletter subscription created successfully',
      subscription,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating newsletter subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create newsletter subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Deactivate subscription
    const { error: updateError } = await supabase
      .from('newsletter_subscriptions')
      .update({ active: false })
      .eq('email', email)
    
    if (updateError) throw updateError

    return NextResponse.json({
      message: 'Newsletter subscription cancelled successfully',
    })
  } catch (error) {
    console.error('Error cancelling newsletter subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel newsletter subscription' },
      { status: 500 }
      )
  }
}






