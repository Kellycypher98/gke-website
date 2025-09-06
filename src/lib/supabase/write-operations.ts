import { createServerSupabaseClient } from './server'
import { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type Order = Tables['orders']['Row']
type OrderInsert = Tables['orders']['Insert']
type NewsletterSubscription = Tables['newsletter_subscriptions']['Row']
type NewsletterSubscriptionInsert = Tables['newsletter_subscriptions']['Insert']

export const writeOperations = {
  // Handle ticket purchase
  async createOrder(orderData: Omit<OrderInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const { data, error } = await createServerSupabaseClient()
      .from('orders')
      .insert({
        ...orderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Order
  },

  // Handle newsletter subscription
  async subscribeToNewsletter(email: string): Promise<NewsletterSubscription> {
    const { data, error } = await createServerSupabaseClient()
      .from('newsletter_subscriptions')
      .insert({
        email,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return data as NewsletterSubscription
  },

  // Update order status (e.g., after payment confirmation)
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const { data, error } = await createServerSupabaseClient()
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data as Order
  },

  // Unsubscribe from newsletter
  async unsubscribeFromNewsletter(email: string): Promise<NewsletterSubscription> {
    const { data, error } = await createServerSupabaseClient()
      .from('newsletter_subscriptions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .select()
      .single()
    
    if (error) throw error
    return data as NewsletterSubscription
  },
}
