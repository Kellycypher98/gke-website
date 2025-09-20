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
          title: string
          description: string | null
          content: string | null
          image: string | null
          brand: string | null
          category: 'CLUB_NIGHT' | 'MUSIC_FESTIVAL' | 'CONCERT' | 'CONFERENCE' | 'WORKSHOP' | 'EXHIBITION' | 'SPORTS' | 'OTHER' | null
          tags: string[] | null
          date: string | null
          time: string | null
          location: string | null
          address: string | null
          city: string | null
          country: string | null
          capacity: number | null
          sold: number | null
          featured: boolean | null
          status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | null
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          created_at: string
          updated_at: string
          gallery: Json | null
          idx: number | null
          first_event_date: string | null
          recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'FIRST_DAY_MONTHLY' | 'LAST_DAY_MONTHLY' | 'FIRST_WEEKDAY_MONTHLY' | 'LAST_WEEKDAY_MONTHLY' | 'FIRST_FRIDAY_MONTHLY' | 'LAST_FRIDAY_MONTHLY' | 'CUSTOM' | null
          time_start: string | null
          time_end: string | null
          ticket_prices: {
            early_bird?: number
            gate?: number
            currency?: string
          } | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          image?: string | null
          brand?: string | null
          category?: 'CLUB_NIGHT' | 'MUSIC_FESTIVAL' | 'CONCERT' | 'CONFERENCE' | 'WORKSHOP' | 'EXHIBITION' | 'SPORTS' | 'OTHER' | null
          tags?: string[] | null
          date?: string | null
          time?: string | null
          location?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          capacity?: number | null
          sold?: number | null
          featured?: boolean | null
          status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          gallery?: Json | null
          idx?: number | null
          first_event_date?: string | null
          recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'FIRST_DAY_MONTHLY' | 'LAST_DAY_MONTHLY' | 'FIRST_WEEKDAY_MONTHLY' | 'LAST_WEEKDAY_MONTHLY' | 'FIRST_FRIDAY_MONTHLY' | 'LAST_FRIDAY_MONTHLY' | 'CUSTOM' | null
          time_start?: string | null
          time_end?: string | null
          ticket_prices?: {
            early_bird?: number
            gate?: number
            currency?: string
          } | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          image?: string | null
          brand?: string | null
          category?: 'CLUB_NIGHT' | 'MUSIC_FESTIVAL' | 'CONCERT' | 'CONFERENCE' | 'WORKSHOP' | 'EXHIBITION' | 'SPORTS' | 'OTHER' | null
          tags?: string[] | null
          date?: string | null
          time?: string | null
          location?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          capacity?: number | null
          sold?: number | null
          featured?: boolean | null
          status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          gallery?: Json | null
          idx?: number | null
          first_event_date?: string | null
          recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'FIRST_DAY_MONTHLY' | 'LAST_DAY_MONTHLY' | 'FIRST_WEEKDAY_MONTHLY' | 'LAST_WEEKDAY_MONTHLY' | 'FIRST_FRIDAY_MONTHLY' | 'LAST_FRIDAY_MONTHLY' | 'CUSTOM' | null
          time_start?: string | null
          time_end?: string | null
          ticket_prices?: {
            early_bird?: number
            gate?: number
            currency?: string
          } | null
        }
      }
    }
    Enums: {
      event_category: 'CLUB_NIGHT' | 'MUSIC_FESTIVAL' | 'CONCERT' | 'CONFERENCE' | 'WORKSHOP' | 'EXHIBITION' | 'SPORTS' | 'OTHER'
      event_status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
      event_recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'FIRST_DAY_MONTHLY' | 'LAST_DAY_MONTHLY' | 'FIRST_WEEKDAY_MONTHLY' | 'LAST_WEEKDAY_MONTHLY' | 'FIRST_FRIDAY_MONTHLY' | 'LAST_FRIDAY_MONTHLY' | 'CUSTOM'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]