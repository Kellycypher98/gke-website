import { createServerSupabaseClient } from './server'

// Helper function to handle Supabase queries with error handling
async function querySupabase(queryBuilder: any) {
  const { data, error } = await queryBuilder
  if (error) throw error
  return data
}

// Define types based on expected structure
type Event = {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
  category?: string
  brand?: string
  featured?: boolean
  created_at?: string
  updated_at?: string
  [key: string]: any
}

type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'>
type EventUpdate = Partial<EventInsert>

type TicketTier = {
  id: string
  event_id: string
  name: string
  price: number
  quantity_available?: number
  description?: string
  created_at?: string
  updated_at?: string
}

type EventWithTiers = Event & {
  ticket_tiers: TicketTier[]
}

// Core event operations
export const eventsDb = {
  async getEvents(): Promise<Event[]> {
    const supabase = await createServerSupabaseClient()
    return querySupabase(
      supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
    ) || []
  },
  
  async getEventById(id: string): Promise<EventWithTiers> {
    const supabase = await createServerSupabaseClient()
    return querySupabase(
      supabase
        .from('events')
        .select('*, ticket_tiers(*)')
        .eq('id', id)
        .single()
    )
  },
  
  async createEvent(eventData: Omit<EventInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const newEvent = {
      ...eventData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    const supabase = await createServerSupabaseClient()
    return querySupabase(
      supabase
        .from('events')
        .insert([newEvent] as any)
        .select()
        .single()
    )
  },
  
  async updateEvent(id: string, updates: Partial<EventUpdate>): Promise<Event> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }
    
    const supabase = await createServerSupabaseClient()
    return querySupabase(
      supabase
        .from('events')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single()
    )
  },
  
  async deleteEvent(id: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()
    await querySupabase(
      supabase
        .from('events')
        .delete()
        .eq('id', id)
    )
    return true
  }
}
