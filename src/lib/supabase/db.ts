import { Database } from '@/types/supabase'
import { createServerSupabaseClient } from './server'
import { createClient } from './client'

// Server-side database operations
export const db = {
  // Events
  async getEvents() {
    const { data, error } = await createServerSupabaseClient()
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  },
  
  async getEventById(id: string) {
    const { data, error } = await createServerSupabaseClient()
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },
  
  // Users
  async getUserById(id: string) {
    const { data, error } = await createServerSupabaseClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },
  
  // Add more database operations as needed
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
