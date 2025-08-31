import { DataTable } from '@/components/admin/data-table'
import { columns } from './columns'
import { Event } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    include: {
      ticketTiers: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Events</h2>
          <p className="text-sm text-muted-foreground">
            Manage your events and their details
          </p>
        </div>
        <a href="/admin/events/new" className="btn-primary">
          Add Event
        </a>
      </div>
      <DataTable columns={columns} data={events} />
    </div>
  )
}
