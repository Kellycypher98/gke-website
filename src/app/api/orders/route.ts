import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../../types/database.types'
import type { EventWithTiers, TicketTier } from '../../../../types/db.types'

// Using types from db.types.ts

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CreateOrderSchema = z.object({
  eventId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  currency: z.string().default('GBP'),
  items: z.array(
    z.object({
      tierId: z.string().min(1),
      quantity: z.number().int().min(1)
    })
  ).min(1)
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const parsed = CreateOrderSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { eventId, customerName, customerEmail, customerPhone, currency, items } = parsed.data

    // Fetch event and tiers in one go and validate
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('id', eventId)
      .single<EventWithTiers>()
    
    if (eventError) throw eventError

    if (!event || event.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Event not available' }, { status: 404 })
    }

    // Map tiers for lookup with proper typing
    const tierById = new Map<string, TicketTier>(
      event.ticket_tiers.map((t: TicketTier) => [t.id, t])
    )

    // Validate items and compute subtotal
    let subtotal = 0
    for (const item of items) {
      const tier = tierById.get(item.tierId)
      if (!tier) {
        return NextResponse.json(
          { error: `Invalid ticket tier: ${item.tierId}` },
          { status: 400 }
        )
      }
      // Type-safe property access with null checks
      const tierQuantity = (tier as unknown as { quantity?: number }).quantity || 0
      const tierSold = (tier as unknown as { sold?: number }).sold || 0
      const tierName = (tier as unknown as { name?: string }).name || 'Unknown Tier'
      
      const remaining = tierQuantity - tierSold
      if (remaining <= 0 || item.quantity > remaining) {
        return NextResponse.json(
          { error: `Insufficient availability for tier ${tierName}` },
          { status: 400 }
        )
      }
      const tierPrice = (tier as unknown as { price?: number }).price || 0
      subtotal += Number(tierPrice) * item.quantity
    }

    const tax = 0 // TODO: add tax rules if needed
    const totalPrice = subtotal + tax

    // Create order number simple generator (YYYYMMDD-XXXX)
    const suffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${suffix}`

    // Start a transaction
    type OrderInsert = Database['public']['Tables']['orders']['Insert']
    
    const newOrder: OrderInsert = {
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      total_amount: totalPrice,
      currency,
      status: 'pending',
      event_id: eventId,
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single()
    
    if (orderError) throw orderError

    // Insert order items with proper typing
    type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
    
    const orderItems: OrderItemInsert[] = items.map((item) => {
      const tier = tierById.get(item.tierId)
      if (!tier) {
        throw new Error(`Invalid tier ID: ${item.tierId}`)
      }
      const tierPrice = (tier as unknown as { price?: number }).price || 0
      
      return {
        order_id: order.id,
        ticket_tier_id: item.tierId,
        quantity: item.quantity,
        price: tierPrice,
      } as OrderItemInsert
    })

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError

    // Fetch the complete order with relationships
    type OrderWithRelations = Database['public']['Tables']['orders']['Row'] & {
      order_items: Array<Database['public']['Tables']['order_items']['Row']>,
      events: Database['public']['Tables']['events']['Row']
    }

    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        events(*)
      `)
      .eq('id', order.id)
      .single<OrderWithRelations>()
    
    if (fetchError) throw fetchError

    return NextResponse.json(completeOrder, { status: 201 })
  } catch (err) {
    console.error('Error creating order:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
