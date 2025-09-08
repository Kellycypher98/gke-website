import { createServerSupabaseClient } from './server'
import { createClient } from './client'
import type { Database } from '@/types/database.types'

type DbTables = Database['public']['Tables']
type Event = DbTables['events']['Row']
type EventInsert = DbTables['events']['Insert']
type EventUpdate = DbTables['events']['Update']
type TicketTier = DbTables['ticket_tiers']['Row']
type TicketTierInsert = DbTables['ticket_tiers']['Insert']

interface EventWithTiers extends Event {
  ticket_tiers: TicketTier[]
}

// Server-side database operations
export const db = {
  // Events
  async getEvents() {
    const { data, error } = await (await createServerSupabaseClient())
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as Event[]
  },
  
  async getEventById(id: string): Promise<EventWithTiers> {
    const { data, error } = await (await createServerSupabaseClient())
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as EventWithTiers
  },

  // Read-only operation - createEvent is disabled
  createEvent(eventData: EventInsert) {
    throw new Error('Create event operation is disabled in read-only mode')
  },

  // Read-only operation - updateEvent is disabled
  updateEvent(id: string, eventData: Partial<EventUpdate>) {
    throw new Error('Update event operation is disabled in read-only mode')
  },

  // Read-only operation - deleteEvent is disabled
  deleteEvent(id: string) {
    throw new Error('Delete event operation is disabled in read-only mode')
  },

  // Ticket Tiers
  // Read-only operation - createTicketTiers is disabled
  createTicketTiers(ticketTiers: TicketTierInsert[]) {
    throw new Error('Create ticket tiers operation is disabled in read-only mode')
  },

  async getEventTicketTiers(eventId: string): Promise<TicketTier[]> {
    const { data, error } = await (await createServerSupabaseClient())
      .from('ticket_tiers')
      .select('*')
      .eq('event_id', eventId)
    
    if (error) throw error
    return data as TicketTier[]
  },
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
    return data as Event[]
  },
  // Add more client-side operations as needed
}

// Export types for use in other files
export type { Database } from '@/types/database.types'
export type Tables = DbTables
