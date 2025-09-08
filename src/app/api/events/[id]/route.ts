import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching event with ID:', params.id)
    
    const supabase = await createServerSupabaseClient()
    
    // Test the connection first
    const { data: testData, error: testError } = await supabase.auth.getSession()
    console.log('Supabase connection test:', { hasSession: !!testData.session, error: testError })
    
    // Get the event
    console.log('Querying events table...')
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single()

    console.log('Event query result:', { event, error: eventError })

    if (eventError) {
      console.error('Event error details:', {
        message: eventError.message,
        code: eventError.code,
        hint: eventError.hint,
        details: eventError.details
      })
      
      if (eventError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Database error', details: eventError.message },
        { status: 500 }
      )
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get the ticket tiers for this event
    console.log('Querying ticket_tiers table...')
    const { data: ticketTiers, error: tiersError } = await supabase
      .from('ticket_tiers')
      .select('*')
      .eq('event_id', params.id)
      .eq('available', true)

    console.log('Ticket tiers query result:', { ticketTiers, error: tiersError })

    if (tiersError) {
      console.error('Ticket tiers error details:', {
        message: tiersError.message,
        code: tiersError.code,
        hint: tiersError.hint,
        details: tiersError.details
      })
      
      // Don't fail the entire request if ticket tiers fail
      console.warn('Continuing without ticket tiers due to error')
    }

    // Create response with proper structure
    const responseData = {
      id: event.id,
      title: event.title,
      description: event.description,
      content: event.content,
      image: event.image,
      brand: event.brand,
      category: event.category,
      tags: event.tags || [],
      first_event_date: event.first_event_date || event.date,
      recurrence: event.recurrence || 'NONE',
      time_start: event.time_start || event.time,
      time_end: event.time_end || '',
      location: event.location,
      address: event.address,
      city: event.city,
      country: event.country,
      capacity: event.capacity || 0,
      sold: event.sold || 0,
      featured: event.featured || false,
      status: event.status || 'PUBLISHED',
      ticket_prices: event.ticket_prices || {
        early_bird: event.early_bird || 0,
        gate: event.gate || 0,
        currency: event.currency || 'GBP'
      },
      ticket_tiers: ticketTiers || [],
      created_at: event.created_at,
      updated_at: event.updated_at
    };
    
    console.log('Sending successful response:', responseData);
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in GET /api/events/[id]:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && error instanceof Error && { stack: error.stack })
      },
      { status: 500 }
    )
  }
}