import { DataTable } from '@/components/admin/data-table'
import { columns } from './columns'
import { prisma } from '@/lib/prisma'

export default async function TicketTiersPage() {
  const ticketTiers = await prisma.ticketTier.findMany({
    include: {
      event: {
        select: {
          title: true,
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
      event: {
        date: 'asc',
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Ticket Tiers</h2>
          <p className="text-sm text-muted-foreground">
            Manage ticket pricing and availability
          </p>
        </div>
        <a href="/admin/ticket-tiers/new" className="btn-primary">
          Add Ticket Tier
        </a>
      </div>
      <DataTable columns={columns} data={ticketTiers} />
    </div>
  )
}
