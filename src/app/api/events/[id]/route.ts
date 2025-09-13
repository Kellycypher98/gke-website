import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  console.log(`[${new Date().toISOString()}] Fetching event with ID:`, eventId);
  
  // Set response timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    console.error('Request timeout reached');
    controller.abort();
  }, 10000);

  // Set default headers
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-store, max-age=0');

  try {
    // Validate event ID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)) {
      console.error('Invalid event ID format:', eventId);
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        }
      }
    });
    
    // Get the event with timeout
    const eventPromise = supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    // Add timeout to the query
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 8000)
    );
    
    const { data: event, error: eventError } = await Promise.race([
      eventPromise,
      timeoutPromise
    ]);

    console.log(`[${new Date().toISOString()}] Event query completed for ID:`, eventId);

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