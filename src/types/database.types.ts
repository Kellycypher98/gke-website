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
      gallery_items: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          type: 'image' | 'video'
          image_path: string
          thumbnail_path: string | null
          views: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          type: 'image' | 'video'
          image_path: string
          thumbnail_path?: string | null
          views?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          type?: 'image' | 'video'
          image_path?: string
          thumbnail_path?: string | null
          views?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      },
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      ticket_tiers: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          price: number
          quantity: number
          sold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          price: number
          quantity: number
          sold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          price?: number
          quantity?: number
          sold?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          total_amount: number
          currency: string
          status: string
          event_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          total_amount: number
          currency: string
          status?: string
          event_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          total_amount?: number
          currency?: string
          status?: string
          event_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          ticket_tier_id: string
          quantity: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          ticket_tier_id: string
          quantity: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          ticket_tier_id?: string
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}