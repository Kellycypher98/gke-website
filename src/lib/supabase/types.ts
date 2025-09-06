import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type Event = Database['public']['Tables']['events']['Row']
type TicketTier = Database['public']['Tables']['ticket_tiers']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type Ticket = Database['public']['Tables']['tickets']['Row']
type NewsletterSubscription = Database['public']['Tables']['newsletter_subscriptions']['Row']

// User roles have been removed as they're no longer needed for this application

export type {
  User,
  Event,
  TicketTier,
  Order,
  Ticket,
  NewsletterSubscription
}

export type TableTypes = {
  users: User
  events: Event
  ticket_tiers: TicketTier
  orders: Order
  tickets: Ticket
  newsletter_subscriptions: NewsletterSubscription
}
