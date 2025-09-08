import { createServerSupabaseClient } from './server'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type Order = Tables['orders']['Row']
type OrderInsert = Tables['orders']['Insert']
type OrderUpdate = Tables['orders']['Update']
type NewsletterSubscription = Tables['newsletter_subscriptions']['Row']
type NewsletterSubscriptionInsert = Tables['newsletter_subscriptions']['Insert']
type NewsletterSubscriptionUpdate = Tables['newsletter_subscriptions']['Update']

export const writeOperations = {
  // Handle ticket purchase
  async createOrder(orderData: Omit<OrderInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await (supabase as SupabaseClient<Database>)
      .from('orders')
      .insert({
        ...orderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .select()
      .single()
    
    if (error) throw error
    return data as Order
  },

  // Handle newsletter subscription
  async subscribeToNewsletter(email: string): Promise<NewsletterSubscription> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await (supabase as SupabaseClient<Database>)
      .from('newsletter_subscriptions')
      .insert({
        email,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .select()
      .single()
    
    if (error) throw error
    return data as NewsletterSubscription
  },


  //TODO:fix this
  // Update order status (e.g., after payment confirmation)
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await (supabase as SupabaseClient<Database>)
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      } as never)
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data as Order
  },

  // Unsubscribe from newsletter
  async unsubscribeFromNewsletter(email: string): Promise<NewsletterSubscription> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await (supabase as SupabaseClient<Database>)
      .from('newsletter_subscriptions')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      } as never)
      .eq('email', email)
      .select()
      .single()
    
    if (error) throw error
    return data as NewsletterSubscription
  },
}
