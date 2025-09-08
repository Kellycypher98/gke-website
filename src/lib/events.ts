// This file contains utility functions for working with events
// It's designed to work in both server and client components

interface TicketPrices {
  early_bird?: number
  gate?: number
  currency?: string
  [key: string]: any
}

export interface Event {
  id: string
  title: string
  description: string
  content: string
  image: string
  gallery: string[] | null
  brand: string
  category: string
  tags: string[]
  first_event_date: string
  date?: string
  recurrence: string
  time_start: string
  time_end: string
  time?: string
  location: string
  address: string
  city: string
  country: string
  capacity: number
  sold: number
  featured: boolean
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
  ticket_prices?: TicketPrices
  // Stripe integration
  // Stripe price IDs are no longer needed with inline price data
  // Metadata
  meta_title: string
  meta_description: string
  meta_keywords: string[]
  created_at: string
  updated_at: string
  // Pricing information
  early_bird?: number
  gate?: number
  currency?: string
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    // In a real app, you might want to add authentication headers here
    // when making requests from the client
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const url = new URL(`/api/events/${id}`, baseUrl)
    
    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      },
      // Only add credentials for same-origin requests
      credentials: typeof window !== 'undefined' ? 'include' : 'same-origin'
    })
    
    if (!res.ok) {
      console.error(`Failed to fetch event: ${res.status} ${res.statusText}`)
      const errorData = await res.json().catch(() => ({}))
      console.error('Error response:', errorData)
      return null
    }
    
    const data = await res.json()
    console.log('Raw API response:', JSON.stringify(data, null, 2))
    
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format:', data)
      return null
    }
    
    // Transform the data to match our expected structure
    const transformedData: Event = {
      id: data.id,
      title: data.title || 'Untitled Event',
      description: data.description || '',
      content: data.content || '',
      image: data.image || '',
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      brand: data.brand || '',
      category: data.category || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      first_event_date: data.first_event_date || data.date || '',
      recurrence: data.recurrence || 'NONE',
      time_start: data.time_start || data.time || '',
      time_end: data.time_end || '',
      location: data.location || '',
      address: data.address || '',
      city: data.city || '',
      country: data.country || '',
      capacity: data.capacity || 0,
      sold: data.sold || 0,
      featured: data.featured || false,
      status: data.status || 'DRAFT',
      ticket_prices: data.ticket_prices || {
        early_bird: data.early_bird || 0,
        gate: data.gate || 0,
        currency: data.currency || 'GBP'
      },
      meta_title: data.meta_title || '',
      meta_description: data.meta_description || '',
      meta_keywords: Array.isArray(data.meta_keywords) ? data.meta_keywords : [],
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      early_bird: data.early_bird,
      gate: data.gate,
      currency: data.currency || 'GBP'
    }
    
    console.log('Transformed event data:', JSON.stringify(transformedData, null, 2))
    return transformedData
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}
