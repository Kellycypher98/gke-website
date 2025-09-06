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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          password: string | null
          role: string
          emailVerified: Date | null
          image: string | null
          lastLoginAt: Date | null
          lastActiveAt: Date | null
          hasBoughtTicket: boolean
          lastEventAttendedId: string | null
          attendedLastEvent: boolean
          hasRequestedRefund: boolean
          refundRequestedAt: Date | null
          hasBeenRefunded: boolean
          refundedAt: Date | null
          authExternalId: string | null
          stripeCustomerId: string | null
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          password?: string | null
          role?: string
          emailVerified?: Date | null
          image?: string | null
          lastLoginAt?: Date | null
          lastActiveAt?: Date | null
          hasBoughtTicket?: boolean
          lastEventAttendedId?: string | null
          attendedLastEvent?: boolean
          hasRequestedRefund?: boolean
          refundRequestedAt?: Date | null
          hasBeenRefunded?: boolean
          refundedAt?: Date | null
          authExternalId?: string | null
          stripeCustomerId?: string | null
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          password?: string | null
          role?: string
          emailVerified?: Date | null
          image?: string | null
          lastLoginAt?: Date | null
          lastActiveAt?: Date | null
          hasBoughtTicket?: boolean
          lastEventAttendedId?: string | null
          attendedLastEvent?: boolean
          hasRequestedRefund?: boolean
          refundRequestedAt?: Date | null
          hasBeenRefunded?: boolean
          refundedAt?: Date | null
          authExternalId?: string | null
          stripeCustomerId?: string | null
          createdAt?: Date
          updatedAt?: Date
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: Date
          location: string
          imageUrl: string | null
          isActive: boolean
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: Date
          location: string
          imageUrl?: string | null
          isActive?: boolean
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: Date
          location?: string
          imageUrl?: string | null
          isActive?: boolean
          createdAt?: Date
          updatedAt?: Date
        }
      }
      ticket_tiers: {
        Row: {
          id: string
          eventId: string
          name: string
          description: string | null
          price: number
          currency: string
          quantity: number
          sold: number
          isActive: boolean
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          eventId: string
          name: string
          description?: string | null
          price: number
          currency?: string
          quantity: number
          sold?: number
          isActive?: boolean
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          eventId?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          quantity?: number
          sold?: number
          isActive?: boolean
          createdAt?: Date
          updatedAt?: Date
        }
      }
      orders: {
        Row: {
          id: string
          userId: string
          eventId: string
          status: string
          total: number
          currency: string
          paymentIntentId: string | null
          paymentStatus: string | null
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          userId: string
          eventId: string
          status?: string
          total: number
          currency?: string
          paymentIntentId?: string | null
          paymentStatus?: string | null
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          userId?: string
          eventId?: string
          status?: string
          total?: number
          currency?: string
          paymentIntentId?: string | null
          paymentStatus?: string | null
          createdAt?: Date
          updatedAt?: Date
        }
      }
      tickets: {
        Row: {
          id: string
          orderId: string
          ticketTierId: string
          userId: string
          eventId: string
          status: string
          checkedIn: boolean
          checkedInAt: Date | null
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          orderId: string
          ticketTierId: string
          userId: string
          eventId: string
          status?: string
          checkedIn?: boolean
          checkedInAt?: Date | null
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          orderId?: string
          ticketTierId?: string
          userId?: string
          eventId?: string
          status?: string
          checkedIn?: boolean
          checkedInAt?: Date | null
          createdAt?: Date
          updatedAt?: Date
        }
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          isActive: boolean
          userId: string | null
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          email: string
          isActive?: boolean
          userId?: string | null
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          email?: string
          isActive?: boolean
          userId?: string | null
          createdAt?: Date
          updatedAt?: Date
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
      // User roles have been removed
    }
  }
}
