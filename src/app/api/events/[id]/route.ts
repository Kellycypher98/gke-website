import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type EventWithTiers = Database['public']['Tables']['events']['Row'] & {
  ticket_tiers: Database['public']['Tables']['ticket_tiers']['Row'][]
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the event with its ticket tiers
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('id', params.id)
      .single() as { data: EventWithTiers | null, error: any }

    if (eventError) throw eventError
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Filter available ticket tiers
    const eventWithFilteredTiers = {
      ...event,
      ticketTiers: (event.ticket_tiers || []).filter(tier => tier.available)
    }

    return NextResponse.json(eventWithFilteredTiers)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
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

    const supabase = createServerSupabaseClient()

    // Update event
    const { data: event, error: updateError } = await supabase
      .from('events')
      .update({
        title,
        description,
        content,
        image,
        gallery: gallery || [],
        brand,
        category,
        tags: tags || [],
        date: date ? new Date(date).toISOString() : undefined,
        time,
        location,
        address,
        city,
        country,
        capacity,
        featured,
        status,
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select('*, ticket_tiers(*)')
      .single()

    if (updateError) throw updateError

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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    
    // First, delete related ticket tiers
    const { error: tiersError } = await supabase
      .from('ticket_tiers')
      .delete()
      .eq('event_id', params.id)

    if (tiersError) throw tiersError

    // Then delete the event
    const { error: eventError } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)

    if (eventError) throw eventError

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}






