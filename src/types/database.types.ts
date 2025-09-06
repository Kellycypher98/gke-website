export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          slug: string
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
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          slug: string
          description: string
          content?: string | null
          image?: string | null
          gallery?: string[] | null
          brand: string
          category: string
          tags?: string[] | null
          date: string
          time: string
          location: string
          address?: string | null
          city: string
          country: string
          capacity: number
          sold?: number
          featured?: boolean
          status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          slug?: string
          description?: string
          content?: string | null
          image?: string | null
          gallery?: string[] | null
          brand?: string
          category?: string
          tags?: string[] | null
          date?: string
          time?: string
          location?: string
          address?: string | null
          city?: string
          country?: string
          capacity?: number
          sold?: number
          featured?: boolean
          status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
        }
      }
      ticket_tiers: {
        Row: {
          id: string
          created_at: string
          event_id: string
          name: string
          description: string | null
          price: number
          currency: string
          quantity: number
          sold: number
          available: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          name: string
          description?: string | null
          price: number
          currency?: string
          quantity: number
          sold?: number
          available?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          quantity?: number
          sold?: number
          available?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
