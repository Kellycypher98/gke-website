import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Define the Event type for better type safety
interface Event {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  category?: string;
  brand?: string;
  featured?: boolean;
  [key: string]: any; // Allow other properties
}

// Create a single instance of the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a server client that doesn't use cookies
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

export const dynamic = 'force-dynamic' // Ensure dynamic evaluation
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const featured = searchParams.get('featured')
    
    // Build the query
    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('date', { ascending: true })
    
    // Apply filters if provided
    if (category) {
      query = query.eq('category', category)
    }
    if (brand) {
      query = query.eq('brand', brand)
    }
    if (featured === 'true') {
      query = query.eq('featured', true)
    }
    const { data: events, error, status, statusText } = await query
    
    console.log('Query result:', { status, statusText, error, hasData: !!events })
    
    if (error) {
      console.error('Error fetching events:', error);
      const errorResponse: Record<string, any> = {
        error: 'Failed to fetch events',
        message: error.message
      };
      
      // Only add these fields if they exist
      if ('code' in error) errorResponse.code = error.code;
      if ('hint' in error) errorResponse.hint = error.hint;
      if ('details' in error) errorResponse.details = error.details;
      
      return NextResponse.json(errorResponse, { status: 500 });
    }
    
    if (!Array.isArray(events)) {
      console.error('Expected events to be an array, got:', typeof events, events)
      return NextResponse.json(
        { error: 'Invalid events data format', data: events },
        { status: 500 }
      )
    }
    
    // Filter events based on query parameters with proper type assertion
    const filteredEvents = (events as Event[]).filter((event: Event) => {
      if (!event) return false;
      
      // Only show published events
      if (event.status !== 'PUBLISHED') return false;
      
      // Apply filters
      if (category && event.category !== category) return false;
      if (brand && event.brand !== brand) return false;
      if (featured === 'true' && !event.featured) return false;
      
      return true;
    });

    console.log('Filtered events count:', filteredEvents.length)
    
    const response = {
      events: filteredEvents,
      pagination: {
        page: 1,
        limit: filteredEvents.length,
        total: filteredEvents.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }
    
    console.log('Sending response with', filteredEvents.length, 'events')
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error in GET /api/events:', error);
    const errorResponse: Record<string, any> = {
      error: 'Failed to fetch events',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      errorResponse.stack = error.stack;
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const eventData: Omit<Event, 'id' | 'status'> & { status?: Event['status'] } = await request.json()
    
    // Create the event directly with Supabase with proper typing
    const { data: newEvent, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        status: eventData.status || 'DRAFT', // Use provided status or default to DRAFT
      }] as const) // Use const assertion to help with type inference
      .select()
      .single<Event>()
    
    if (error) {
      console.error('Supabase error creating event:', error)
      throw error
    }
    
    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create event' },
      { status: 500 }
    )
  }
}
