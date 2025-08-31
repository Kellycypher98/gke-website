import { DataTable } from '@/components/admin/data-table'
import { columns } from './columns'
import { prisma } from '@/lib/prisma'

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      event: {
        select: {
          title: true,
          id: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          id: true,
        },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Orders</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all ticket orders
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={orders} />
    </div>
  )
}
