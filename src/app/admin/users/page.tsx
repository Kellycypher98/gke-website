import { DataTable } from '@/components/admin/data-table'
import { columns } from './columns'
import { prisma } from '@/lib/prisma'

// Define the type for the raw SQL query result
type RawUser = {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: Date | null
  image: string | null
  createdAt: Date
  updatedAt: Date
  password: string | null
  lastLoginAt: Date | null
  lastActiveAt: Date | null
  hasBoughtTicket: boolean
  lastEventAttendedId: string | null
  attendedLastEvent: boolean
  hasRequestedRefund: boolean
  refundRequestedAt: Date | null
  hasBeenRefunded: boolean
  refundedAt: Date | null
  authExternalId: string | null
  stripeCustomerId: string | null
  lastEventTitle: string | null
  lastEventDate: Date | null
  ordersCount: number
  ticketsCount: number
}

export default async function UsersPage() {
  const users = await prisma.$queryRaw<RawUser[]>`
    SELECT 
      u.id,
      u.email,
      u.name,
      u.role,
      u."emailVerified",
      u.image,
      u."createdAt",
      u."updatedAt",
      u.password,
      u."lastLoginAt",
      u."lastActiveAt",
      u."hasBoughtTicket",
      u."lastEventAttendedId",
      u."attendedLastEvent",
      u."hasRequestedRefund",
      u."refundRequestedAt",
      u."hasBeenRefunded",
      u."refundedAt",
      u."authExternalId",
      u."stripeCustomerId",
      e.id as "lastEventAttendedId",
      e.title as "lastEventTitle",
      e.date as "lastEventDate",
      (SELECT COUNT(*) FROM "Order" o WHERE o."userId" = u.id) as "ordersCount",
      (SELECT COUNT(*) FROM "Ticket" t WHERE t."userId" = u.id) as "ticketsCount"
    FROM "User" u
    LEFT JOIN "Event" e ON u."lastEventAttendedId" = e.id
    ORDER BY u."createdAt" DESC
  `
  
  // Transform data for the table
  const formattedUsers = users.map(user => ({
    ...user,
    _count: {
      orders: user.ordersCount,
      tickets: user.ticketsCount
    },
    lastEventAttendedTitle: user.lastEventTitle || 'N/A',
    lastEventDate: user.lastEventDate || null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={formattedUsers} />
    </div>
  )
}
