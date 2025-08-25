import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: any
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            date: true,
            time: true,
            location: true,
            image: true,
          },
        },
        tickets: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (err) {
    console.error('Error fetching order:', err)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
