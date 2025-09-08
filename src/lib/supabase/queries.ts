import { createServerSupabaseClient } from './server'
import { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

type EventWithTiers = Database['public']['Tables']['events']['Row'] & {
  ticket_tiers: Database['public']['Tables']['ticket_tiers']['Row'][]
}

export async function getEventWithTiers(eventId: string): Promise<EventWithTiers> {
  const supabase = await createServerSupabaseClient()
  
  const { data: event, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('id', eventId)
    .single()
    
  if (error) throw error
  if (!event) throw new Error('Event not found')
  
  return event as EventWithTiers
}

type GetEventsOptions = {
  limit?: number
  offset?: number
  where?: Record<string, any>
  search?: string
}

export async function getEventsWithTiers(options: GetEventsOptions = {}) {
  const { 
    limit = 10, 
    offset = 0, 
    where = {},
    search
  } = options
  
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('events')
    .select('*, ticket_tiers(*)', { count: 'exact' })
    .order('featured', { ascending: false })
    .order('date', { ascending: true })
    .range(offset, offset + limit - 1)
    
  // Apply filters
  Object.entries(where).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value)
    }
  })
  
  // Apply search if provided
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }
  
  const { data: events, error, count } = await query
  
  if (error) throw error
  
  return {
    events: (events || []) as EventWithTiers[],
    count: count || 0
  }
}
