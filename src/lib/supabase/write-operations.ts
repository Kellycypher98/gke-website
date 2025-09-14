import { createServerSupabaseClient } from './server'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type Order = Tables['orders']['Row']
type OrderInsert = Tables['orders']['Insert']
type OrderUpdate = Tables['orders']['Update']

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
}
