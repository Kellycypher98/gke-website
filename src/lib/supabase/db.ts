import { Database } from '@/types/database.types'
import { createServerSupabaseClient } from './server'
import { createClient } from './client'

type Tables = Database['public']['Tables']
type Event = Tables['events']['Row']
type EventInsert = Tables['events']['Insert']
type EventUpdate = Tables['events']['Update']
type TicketTier = Tables['ticket_tiers']['Row']
type TicketTierInsert = Tables['ticket_tiers']['Insert']

type EventWithTiers = Event & {
  ticket_tiers: TicketTier[]
}

// Server-side database operations
export const db = {
  // Events
  async getEvents() {
    const { data, error } = await createServerSupabaseClient()
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as Event[]
  },
  
  async getEventById(id: string): Promise<EventWithTiers> {
    const { data, error } = await createServerSupabaseClient()
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as unknown as EventWithTiers
  },

  // Read-only operation - createEvent is disabled
  async createEvent(eventData: EventInsert) {
    throw new Error('Creating events is not allowed')
  },

  // Read-only operation - updateEvent is disabled
  async updateEvent(id: string, eventData: Partial<EventUpdate>) {
    throw new Error('Updating events is not allowed')
  },

  // Read-only operation - deleteEvent is disabled
  async deleteEvent(id: string) {
    throw new Error('Deleting events is not allowed')
  },

  // Ticket Tiers
  // Read-only operation - createTicketTiers is disabled
  async createTicketTiers(ticketTiers: TicketTierInsert[]) {
    throw new Error('Creating ticket tiers is not allowed')
  },

  async getEventTicketTiers(eventId: string): Promise<TicketTier[]> {
    const { data, error } = await createServerSupabaseClient()
      .from('ticket_tiers')
      .select('*')
      .eq('event_id', eventId)
    
    if (error) throw error
    return data as TicketTier[]
  }

// Client-side database operations
export const clientDb = {
  // Events
  async getEvents() {
    const { data, error } = await createClient()
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  },
  
  // Add more client-side operations as needed
}

export type Tables = Database['public']['Tables']
