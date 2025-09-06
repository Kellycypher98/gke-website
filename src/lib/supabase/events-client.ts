import { createServerSupabaseClient } from './server'

type TicketTier = {
  id: string
  event_id: string
  name: string
  description: string | null
  price: number
  currency: string
  quantity: number
  sold: number
  available: boolean
  created_at: string
  updated_at: string
}

type Event = {
  id: string
  title: string
  description: string
  content: string | null
  image: string | null
  gallery: string[] | null
  brand: string
  category: string
  tags: string[] | null
  date: string
  time: string
  location: string
  address: string | null
  city: string
  country: string
  capacity: number
  sold: number
  featured: boolean
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  created_at: string
  updated_at: string
  ticket_tiers?: TicketTier[]
}

export const eventsClient = {
  async getEvents(): Promise<Event[]> {
    const { data, error } = await createServerSupabaseClient()
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    return (data as Event[]) || []
  },
  
  async getEventById(id: string): Promise<Event & { ticket_tiers: TicketTier[] }> {
    const { data, error } = await createServerSupabaseClient()
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as unknown as Event & { ticket_tiers: TicketTier[] }
  },
  
  // Read-only operation - createEvent is disabled
  async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    throw new Error('Creating events is not allowed')
  },
  
  // Read-only operation - updateEvent is disabled
  async updateEvent(id: string, updateData: Partial<Event>): Promise<Event> {
    throw new Error('Updating events is not allowed')
  },
  
  // Read-only operation - deleteEvent is disabled
  async deleteEvent(id: string): Promise<boolean> {
    throw new Error('Deleting events is not allowed')
  }
}
