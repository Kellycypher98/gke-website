import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

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
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { ticketTiers: true },
    })

    if (!event || event.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Event not available' }, { status: 404 })
    }

    // Map tiers for lookup
    const tierById = new Map(event.ticketTiers.map(t => [t.id, t]))

    // Validate items and compute subtotal
    let subtotal = 0
    for (const item of items) {
      const tier = tierById.get(item.tierId)
      if (!tier || !tier.available) {
        return NextResponse.json({ error: `Tier not available: ${item.tierId}` }, { status: 400 })
      }
      // Optional: soft capacity check (not reserving here)
      const remaining = tier.quantity - tier.sold
      if (remaining <= 0 || item.quantity > remaining) {
        return NextResponse.json({ error: `Insufficient availability for tier ${tier.name}` }, { status: 400 })
      }
      subtotal += Number(tier.price) * item.quantity
    }

    const tax = 0 // TODO: add tax rules if needed
    const total = subtotal + tax

    // Create order number simple generator (YYYYMMDD-XXXX)
    const suffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${suffix}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        subtotal,
        tax,
        total,
        currency,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        event: { connect: { id: event.id } },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error('Error creating order:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
