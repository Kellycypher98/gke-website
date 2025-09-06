import { createServerSupabaseClient } from './server'
import { Database } from '@/types/database.types'

// Helper function to handle Supabase queries with error handling
async function querySupabase(query: Promise<any>) {
  const { data, error } = await query
  if (error) throw error
  return data
}

type Event = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']
type TicketTier = Database['public']['Tables']['ticket_tiers']['Row']

type EventWithTiers = Event & {
  ticket_tiers: TicketTier[]
}

// Core event operations
export const eventsDb = {
  async getEvents(): Promise<Event[]> {
    return querySupabase(
      createServerSupabaseClient()
        .from('events')
        .select('*')
        .order('date', { ascending: true })
    ) || []
  },
  
  async getEventById(id: string): Promise<EventWithTiers> {
    return querySupabase(
      createServerSupabaseClient()
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
    
    return querySupabase(
      createServerSupabaseClient()
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
    
    return querySupabase(
      createServerSupabaseClient()
        .from('events')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single()
    )
  },
  
  async deleteEvent(id: string): Promise<boolean> {
    await querySupabase(
      createServerSupabaseClient()
        .from('events')
        .delete()
        .eq('id', id)
    )
    return true
  }
}
