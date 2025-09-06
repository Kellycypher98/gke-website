import { Database } from '@/types/database.types'

export type Tables = Database['public']['Tables']
export type TableName = keyof Tables

type Insertable<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>

export type Event = Tables['events']['Row']
export type EventInsert = Insertable<Tables['events']['Insert']>

export type TicketTier = Tables['ticket_tiers']['Row']
export type TicketTierInsert = Insertable<Tables['ticket_tiers']['Insert']>

export type EventWithTiers = Event & {
  ticket_tiers: TicketTier[]
}
