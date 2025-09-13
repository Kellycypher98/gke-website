import { NextResponse } from 'next/server'
import { writeOperations } from '@/lib/supabase/write-operations'

import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Subscribe the user to the newsletter
    const subscription = await writeOperations.subscribeToNewsletter(email)

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter', subscription },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error)
    
    // Handle duplicate email error
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
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

    // Unsubscribe the user from the newsletter
    const subscription = await writeOperations.unsubscribeFromNewsletter(email)

    return NextResponse.json(
      { message: 'Successfully unsubscribed from newsletter', subscription },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    )
  }
}
