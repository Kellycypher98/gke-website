import { createServerSupabaseClient } from './server'

export type TicketTier = {
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

export type Event = {
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
  meta_keywords: string[] | null
  created_at: string
  updated_at: string
  ticket_tiers?: TicketTier[]
}

// Client-side functions for the browser
export const eventsClient = {
  async getEvents(): Promise<Event[]> {
    const response = await fetch('/api/events')
    if (!response.ok) {
      throw new Error('Failed to fetch events')
    }
    const data = await response.json()
    return data.events || []
  },

  async getEventById(id: string): Promise<Event & { ticket_tiers: TicketTier[] }> {
    const response = await fetch(`/api/events/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch event')
    }
    return response.json()
  },
}
