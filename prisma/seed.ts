import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.ticket.deleteMany()
  await prisma.order.deleteMany()
  await prisma.ticketTier.deleteMany()
  await prisma.event.deleteMany()

  // Create Afro Splash Summer Festival 2024
  const afroSplashEvent = await prisma.event.create({
    data: {
      title: 'Afro Splash Summer Festival 2024',
      slug: 'afro-splash-summer-festival-2024',
      description: 'The biggest celebration of Afro-Caribbean culture this summer! Join us for live music, dance performances, and an unforgettable night of cultural celebration.',
      content: 'Experience the vibrant energy of Afro-Caribbean culture at our premier summer festival. This year\'s event promises to be bigger and better than ever, featuring top-tier performers, authentic cuisine, and an atmosphere that celebrates our rich heritage.',
      image: '/images/event-afro-splash.jpg',
      gallery: [
        '/images/gallery/afro-splash-1.jpg',
        '/images/gallery/afro-splash-2.jpg',
        '/images/gallery/afro-splash-3.jpg'
      ],
      brand: 'Afro Splash Night',
      category: 'Cultural Festival',
      tags: ['Live Music', 'Dance', 'Food', 'Networking', 'Culture', 'Summer'],
      date: new Date('2024-07-15'),
      time: '18:00',
      location: 'Brixton Academy, London',
      address: '211 Stockwell Road, Brixton',
      city: 'London',
      country: 'United Kingdom',
      capacity: 2000,
      sold: 1800,
      featured: true,
      status: 'PUBLISHED',
      metaTitle: 'Afro Splash Summer Festival 2024 - London',
      metaDescription: 'Join us for the biggest Afro-Caribbean cultural celebration this summer in London. Live music, dance, food, and networking.',
      metaKeywords: 'afro splash, summer festival, london, afro-caribbean, culture, music, dance'
    }
  })

  // Create ticket tiers for Afro Splash
  await prisma.ticketTier.createMany({
    data: [
      {
        name: 'Early Bird',
        description: 'Limited early bird tickets at discounted price',
        price: 35.00,
        currency: 'GBP',
        quantity: 200,
        sold: 180,
        available: true,
        eventId: afroSplashEvent.id
      },
      {
        name: 'Standard',
        description: 'General admission tickets',
        price: 45.00,
        currency: 'GBP',
        quantity: 1500,
        sold: 1350,
        available: true,
        eventId: afroSplashEvent.id
      },
      {
        name: 'VIP',
        description: 'Premium experience with exclusive access and amenities',
        price: 85.00,
        currency: 'GBP',
        quantity: 300,
        sold: 270,
        available: true,
        eventId: afroSplashEvent.id
      }
    ]
  })

  // Create Kente Business Summit 2024
  const kenteSummitEvent = await prisma.event.create({
    data: {
      title: 'Kente Business Summit 2024',
      slug: 'kente-business-summit-2024',
      description: 'Connect with leading African entrepreneurs and business leaders. Features keynote speakers, networking sessions, and investment opportunities.',
      content: 'The Kente Business Summit brings together the brightest minds in African business and entrepreneurship. This year\'s theme focuses on "Building Bridges: Connecting African Innovation with Global Markets."',
      image: '/images/event-kente-summit.jpg',
      gallery: [
        '/images/gallery/kente-summit-1.jpg',
        '/images/gallery/kente-summit-2.jpg',
        '/images/gallery/kente-summit-3.jpg'
      ],
      brand: 'Kente Banquet',
      category: 'Business Summit',
      tags: ['Networking', 'Investment', 'Workshops', 'Keynotes', 'Business', 'Entrepreneurship'],
      date: new Date('2024-08-22'),
      time: '09:00',
      location: 'The Business Design Centre, London',
      address: '52 Upper Street, Islington',
      city: 'London',
      country: 'United Kingdom',
      capacity: 500,
      sold: 320,
      featured: true,
      status: 'PUBLISHED',
      metaTitle: 'Kente Business Summit 2024 - London',
      metaDescription: 'Connect with leading African entrepreneurs and business leaders at our premier business summit in London.',
      metaKeywords: 'kente business summit, african entrepreneurs, business networking, london, investment'
    }
  })

  // Create ticket tiers for Kente Summit
  await prisma.ticketTier.createMany({
    data: [
      {
        name: 'Standard',
        description: 'Full access to all summit sessions and networking',
        price: 120.00,
        currency: 'GBP',
        quantity: 300,
        sold: 200,
        available: true,
        eventId: kenteSummitEvent.id
      },
      {
        name: 'Premium',
        description: 'Includes exclusive workshops and VIP networking',
        price: 180.00,
        currency: 'GBP',
        quantity: 150,
        sold: 100,
        available: true,
        eventId: kenteSummitEvent.id
      },
      {
        name: 'VIP',
        description: 'All-access pass with private meetings and premium seating',
        price: 250.00,
        currency: 'GBP',
        quantity: 50,
        sold: 20,
        available: true,
        eventId: kenteSummitEvent.id
      }
    ]
  })

  // Create GBU-UK Investment Forum
  const gbuForumEvent = await prisma.event.create({
    data: {
      title: 'GBU-UK Investment Forum',
      slug: 'gbu-uk-investment-forum-2024',
      description: 'Exclusive investment forum connecting African entrepreneurs with UK investors. Pitch your business and secure funding opportunities.',
      content: 'The GBU-UK Investment Forum is the premier platform for African entrepreneurs seeking investment and UK investors looking for promising opportunities. This exclusive event features pitch competitions, one-on-one meetings, and strategic networking.',
      image: '/images/event-gbu-forum.jpg',
      gallery: [
        '/images/gallery/gbu-forum-1.jpg',
        '/images/gallery/gbu-forum-2.jpg',
        '/images/gallery/gbu-forum-3.jpg'
      ],
      brand: 'GBU-UK',
      category: 'Investment Forum',
      tags: ['Investment', 'Pitching', 'Networking', 'Funding', 'Startups', 'Entrepreneurs'],
      date: new Date('2024-09-10'),
      time: '14:00',
      location: 'Canary Wharf, London',
      address: 'One Canada Square, Canary Wharf',
      city: 'London',
      country: 'United Kingdom',
      capacity: 200,
      sold: 150,
      featured: true,
      status: 'PUBLISHED',
      metaTitle: 'GBU-UK Investment Forum 2024 - London',
      metaDescription: 'Connect African entrepreneurs with UK investors at our exclusive investment forum in London.',
      metaKeywords: 'gbu-uk, investment forum, african entrepreneurs, uk investors, funding, pitching'
    }
  })

  // Create ticket tiers for GBU Forum
  await prisma.ticketTier.createMany({
    data: [
      {
        name: 'Attendee',
        description: 'Access to all forum sessions and networking',
        price: 200.00,
        currency: 'GBP',
        quantity: 120,
        sold: 90,
        available: true,
        eventId: gbuForumEvent.id
      },
      {
        name: 'Investor',
        description: 'Investor access with priority networking and pitch meetings',
        price: 350.00,
        currency: 'GBP',
        quantity: 50,
        sold: 40,
        available: true,
        eventId: gbuForumEvent.id
      },
      {
        name: 'Pitcher',
        description: 'Entrepreneur pitching package with presentation slot',
        price: 500.00,
        currency: 'GBP',
        quantity: 30,
        sold: 20,
        available: true,
        eventId: gbuForumEvent.id
      }
    ]
  })

  // Create Afro Beats & Business Mixer
  const afroMixerEvent = await prisma.event.create({
    data: {
      title: 'Afro Beats & Business Mixer',
      slug: 'afro-beats-business-mixer-2024',
      description: 'A unique blend of Afro beats music and business networking. Enjoy great music while building valuable business connections.',
      content: 'Experience the perfect fusion of entertainment and business at our Afro Beats & Business Mixer. Network with professionals while enjoying the best in Afro music and culture.',
      image: '/images/event-mixer.jpg',
      gallery: [
        '/images/gallery/mixer-1.jpg',
        '/images/gallery/mixer-2.jpg'
      ],
      brand: 'Afro Splash Night',
      category: 'Networking',
      tags: ['Music', 'Networking', 'Drinks', 'Business', 'Culture', 'Social'],
      date: new Date('2024-07-28'),
      time: '19:00',
      location: 'Shoreditch, London',
      address: 'Various venues in Shoreditch',
      city: 'London',
      country: 'United Kingdom',
      capacity: 300,
      sold: 280,
      featured: false,
      status: 'PUBLISHED',
      metaTitle: 'Afro Beats & Business Mixer - London',
      metaDescription: 'Network with professionals while enjoying Afro music at our unique business mixer in Shoreditch.',
      metaKeywords: 'afro beats, business mixer, networking, shoreditch, london, music'
    }
  })

  // Create ticket tiers for Afro Mixer
  await prisma.ticketTier.createMany({
    data: [
      {
        name: 'General',
        description: 'Access to mixer and networking',
        price: 35.00,
        currency: 'GBP',
        quantity: 200,
        sold: 180,
        available: true,
        eventId: afroMixerEvent.id
      },
      {
        name: 'Premium',
        description: 'Includes drinks package and priority networking',
        price: 55.00,
        currency: 'GBP',
        quantity: 100,
        sold: 100,
        available: true,
        eventId: afroMixerEvent.id
      }
    ]
  })

  // Create Cultural Dance Workshop
  const danceWorkshopEvent = await prisma.event.create({
    data: {
      title: 'Cultural Dance Workshop',
      slug: 'cultural-dance-workshop-2024',
      description: 'Learn traditional African dance moves from professional instructors. Perfect for beginners and experienced dancers alike.',
      content: 'Immerse yourself in the rich traditions of African dance with our expert instructors. This workshop covers various styles and techniques suitable for all skill levels.',
      image: '/images/event-dance-workshop.jpg',
      gallery: [
        '/images/gallery/dance-workshop-1.jpg',
        '/images/gallery/dance-workshop-2.jpg'
      ],
      brand: 'Afro Splash Night',
      category: 'Workshop',
      tags: ['Dance', 'Education', 'Culture', 'Fitness', 'Workshop', 'Traditional'],
      date: new Date('2024-08-05'),
      time: '15:00',
      location: 'Dance Studio, Camden',
      address: 'Camden Dance Centre, Camden High Street',
      city: 'London',
      country: 'United Kingdom',
      capacity: 50,
      sold: 35,
      featured: false,
      status: 'PUBLISHED',
      metaTitle: 'Cultural Dance Workshop - London',
      metaDescription: 'Learn traditional African dance moves from professional instructors in our cultural workshop.',
      metaKeywords: 'african dance, cultural workshop, london, camden, traditional dance'
    }
  })

  // Create ticket tiers for Dance Workshop
  await prisma.ticketTier.createMany({
    data: [
      {
        name: 'Student',
        description: 'Discounted rate for students with valid ID',
        price: 20.00,
        currency: 'GBP',
        quantity: 20,
        sold: 15,
        available: true,
        eventId: danceWorkshopEvent.id
      },
      {
        name: 'Standard',
        description: 'Regular workshop admission',
        price: 25.00,
        currency: 'GBP',
        quantity: 30,
        sold: 20,
        available: true,
        eventId: danceWorkshopEvent.id
      }
    ]
  })

  // Create African Fashion Week
  const fashionWeekEvent = await prisma.event.create({
    data: {
      title: 'African Fashion Week',
      slug: 'african-fashion-week-2024',
      description: 'Celebrate African fashion and design with runway shows, designer showcases, and networking opportunities.',
      content: 'Experience the creativity and innovation of African fashion at our annual showcase. Featuring emerging and established designers, this event celebrates the diversity and beauty of African fashion.',
      image: '/images/event-fashion-week.jpg',
      gallery: [
        '/images/gallery/fashion-week-1.jpg',
        '/images/gallery/fashion-week-2.jpg',
        '/images/gallery/fashion-week-3.jpg'
      ],
      brand: 'Kente Banquet',
      category: 'Fashion Show',
      tags: ['Fashion', 'Design', 'Networking', 'Culture', 'Runway', 'African Design'],
      date: new Date('2024-09-15'),
      time: '18:00',
      location: 'Fashion District, London',
      address: 'Various venues in London Fashion District',
      city: 'London',
      country: 'United Kingdom',
      capacity: 400,
      sold: 250,
      featured: false,
      status: 'PUBLISHED',
      metaTitle: 'African Fashion Week - London',
      metaDescription: 'Celebrate African fashion and design with runway shows and designer showcases in London.',
      metaKeywords: 'african fashion week, fashion show, london, african design, runway, networking'
    }
  })

  // Create ticket tiers for Fashion Week
  await prisma.ticketTier.createMany({
    data: [
      {
        name: 'General',
        description: 'Access to runway shows and exhibitions',
        price: 75.00,
        currency: 'GBP',
        quantity: 250,
        sold: 150,
        available: true,
        eventId: fashionWeekEvent.id
      },
      {
        name: 'Front Row',
        description: 'Premium seating at runway shows',
        price: 120.00,
        currency: 'GBP',
        quantity: 100,
        sold: 70,
        available: true,
        eventId: fashionWeekEvent.id
      },
      {
        name: 'VIP',
        description: 'All-access pass with exclusive events and networking',
        price: 180.00,
        currency: 'GBP',
        quantity: 50,
        sold: 30,
        available: true,
        eventId: fashionWeekEvent.id
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📅 Created ${await prisma.event.count()} events`)
  console.log(`🎫 Created ${await prisma.ticketTier.count()} ticket tiers`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
