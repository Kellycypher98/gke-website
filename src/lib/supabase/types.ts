import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type Event = Database['public']['Tables']['events']['Row']
type TicketTier = Database['public']['Tables']['ticket_tiers']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type Ticket = Database['public']['Tables']['tickets']['Row']
type NewsletterSubscription = Database['public']['Tables']['newsletter_subscriptions']['Row']

// Export UserRole as a const object with type
export const UserRole = {
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  USER: 'USER'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

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
