import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    })

    if (existingSubscription) {
      if (existingSubscription.active) {
        return NextResponse.json(
          { error: 'Email is already subscribed' },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        const subscription = await prisma.newsletterSubscription.update({
          where: { email },
          data: { active: true },
        })
        return NextResponse.json({
          message: 'Newsletter subscription reactivated successfully',
          subscription,
        })
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email,
        userId,
        active: true,
      },
    })

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
    await prisma.newsletterSubscription.update({
      where: { email },
      data: { active: false },
    })

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






