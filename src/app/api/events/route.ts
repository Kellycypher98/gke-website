import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
    }

    if (category) where.category = category
    if (brand) where.brand = brand
    if (featured === 'true') where.featured = true
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ]
    }

    // Get events with pagination
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          ticketTiers: {
            where: { available: true },
            select: {
              id: true,
              name: true,
              price: true,
              currency: true,
              quantity: true,
              sold: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { date: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ])

    // Calculate total pages
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      content,
      image,
      gallery,
      brand,
      category,
      tags,
      date,
      time,
      location,
      address,
      city,
      country,
      capacity,
      ticketTiers,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = body

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        content,
        image,
        gallery: gallery || [],
        brand,
        category,
        tags: tags || [],
        date: new Date(date),
        time,
        location,
        address,
        city,
        country,
        capacity,
        metaTitle,
        metaDescription,
        metaKeywords,
        ticketTiers: {
          create: ticketTiers.map((tier: any) => ({
            name: tier.name,
            description: tier.description,
            price: tier.price,
            currency: tier.currency || 'GBP',
            quantity: tier.quantity,
          })),
        },
      },
      include: {
        ticketTiers: true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}






