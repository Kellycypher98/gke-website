import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type RouteParams = {
  params: {
    id: string;
  };
};

type OrderItem = {
  id: string;
  order_id: string;
  ticket_tier_id: string;
  quantity: number;
  price: number;
  ticket_tiers: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    event_id: string;
    available_quantity: number;
    sales_start: string | null;
    sales_end: string | null;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
};

type Order = {
  id: string;
  user_id: string;
  event_id: string;
  status: string;
  total_amount: number;
  payment_status: string;
  payment_intent_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  events: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string | null;
    location: string;
    address: string | null;
    city: string | null;
    country: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
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
    const { order_items, events, ...orderData } = order as unknown as Order;
    
    const transformedOrder = {
      ...orderData,
      items: (order_items || []).map((item) => ({
        ...item,
        ticketTier: item.ticket_tiers
      })),
      event: events
    }

    return NextResponse.json(transformedOrder)
  } catch (err) {
    console.error('Error fetching order:', err)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
