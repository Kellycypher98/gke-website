import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: Request,
  { params }: any
) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          ticket_tiers(*)
        ),
        events(*)
      `)
      .eq('id', params.id)
      .single()

    if (orderError) throw orderError

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Transform the data to match the expected format
    const transformedOrder = {
      ...order,
      items: order.order_items.map(item => ({
        ...item,
        ticketTier: item.ticket_tiers
      })),
      event: order.events
    }

    // Remove the nested objects to avoid duplication
    delete transformedOrder.order_items
    delete transformedOrder.ticket_tiers
    delete transformedOrder.events

    return NextResponse.json(transformedOrder)
  } catch (err) {
    console.error('Error fetching order:', err)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
