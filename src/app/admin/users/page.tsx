import { DataTable } from '@/components/admin/data-table'
import { columns } from './columns'
import { prisma } from '@/lib/prisma'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: {
          orders: true,
          tickets: true,
        },
      },
      lastEventAttended: {
        select: {
          id: true,
          title: true,
          date: true,
        },
      },
    },
  })
  
  // Transform data for the table
  const formattedUsers = users.map(user => ({
    ...user,
    lastEventAttendedTitle: user.lastEventAttended?.title || 'N/A',
    lastEventDate: user.lastEventAttended?.date || null,
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
