import { NextRequest, NextResponse } from 'next/server'
import { eventsClient } from '@/lib/supabase/events-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const featured = searchParams.get('featured')
    
    // Get all events
    const events = await eventsClient.getEvents()
    
    // Filter events based on query parameters
    const filteredEvents = events.filter(event => {
      // Only show published events
      if (event.status !== 'PUBLISHED') return false
      
      // Apply filters
      if (category && event.category !== category) return false
      if (brand && event.brand !== brand) return false
      if (featured === 'true' && !event.featured) return false
      
      return true
    })

    return NextResponse.json({
      events: filteredEvents,
      pagination: {
        page: 1,
        limit: filteredEvents.length,
        total: filteredEvents.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    // Create the event using the events client
    const newEvent = await eventsClient.createEvent({
      ...eventData,
      status: 'DRAFT', // Default status
    })
    
    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
