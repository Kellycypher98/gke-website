import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    const supabase = createServerSupabaseClient()
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('status', 'PUBLISHED')
      .order('featured', { ascending: false })
      .order('date', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to)

    // Apply filters
    if (category) query = query.eq('category', category)
    if (brand) query = query.eq('brand', brand)
    if (featured === 'true') query = query.eq('featured', true)
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    // Execute query
    const { data: events, count, error } = await query

    if (error) throw error

    // Get ticket tiers for the events
    const eventIds = events?.map(event => event.id) || []
    const { data: ticketTiers, error: tiersError } = await supabase
      .from('ticket_tiers')
      .select('*')
      .in('event_id', eventIds)
      .eq('available', true)

    if (tiersError) throw tiersError

    // Attach ticket tiers to events
    const eventsWithTiers = events?.map(event => ({
      ...event,
      ticketTiers: ticketTiers?.filter(tier => tier.event_id === event.id) || []
    })) || []

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      events: eventsWithTiers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
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
    const body = await request.json()
    const {
      title,
      description,
      content,
      image,
      gallery = [],
      brand,
      category,
      tags = [],
      date,
      time,
      location,
      address,
      city,
      country,
      capacity,
      ticketTiers = [],
      metaTitle,
      metaDescription,
      metaKeywords,
    } = body

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const supabase = createServerSupabaseClient()

    // Start a transaction
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        slug,
        description,
        content,
        image,
        gallery,
        brand,
        category,
        tags,
        date: new Date(date).toISOString(),
        time,
        location,
        address,
        city,
        country,
        capacity,
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
        status: 'DRAFT',
      })
      .select()
      .single()

    if (eventError) throw eventError

    // Insert ticket tiers if any
    if (ticketTiers.length > 0) {
      const tiersToInsert = ticketTiers.map((tier: any) => ({
        event_id: event.id,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        currency: tier.currency || 'GBP',
        quantity: tier.quantity,
        available: true,
      }))

      const { error: tiersError } = await supabase
        .from('ticket_tiers')
        .insert(tiersToInsert)

      if (tiersError) throw tiersError

      // Fetch the event with its ticket tiers
      const { data: eventWithTiers, error: fetchError } = await supabase
        .from('events')
        .select('*, ticket_tiers(*)')
        .eq('id', event.id)
        .single()

      if (fetchError) throw fetchError
      return NextResponse.json(eventWithTiers, { status: 201 })
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}






