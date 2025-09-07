import 'server-only'

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
  meta_title: string
  meta_description: string
  meta_keywords: string[]
  created_at: string
  updated_at: string
  early_bird?: number
  gate?: number
  currency?: string
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    console.log(`Fetching event with ID: ${id}`)
    const url = new URL(`/api/events/${id}`, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
    
    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    })
    
    if (!res.ok) {
      console.error(`Failed to fetch event: ${res.status} ${res.statusText}`)
      const errorData = await res.json().catch(() => ({}))
      console.error('Error response:', errorData)
      return null
    }
    
    const data = await res.json()
    console.log('Event data received:', data)
    
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
      currency: data.currency
    }
    
    console.log('Transformed event data:', transformedData)
    return transformedData
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}
