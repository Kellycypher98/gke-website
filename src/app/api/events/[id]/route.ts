import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        ticketTiers: {
          where: { available: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            quantity: true,
            sold: true,
            available: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      content,
      image,
      gallery,
      brand,
      category,
      tags,
      date,
      time,
      location,
      address,
      city,
      country,
      capacity,
      featured,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = body

    // Update event
    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        description,
        content,
        image,
        gallery: gallery || [],
        brand,
        category,
        tags: tags || [],
        date: date ? new Date(date) : undefined,
        time,
        location,
        address,
        city,
        country,
        capacity,
        featured,
        status,
        metaTitle,
        metaDescription,
        metaKeywords,
      },
      include: {
        ticketTiers: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}






