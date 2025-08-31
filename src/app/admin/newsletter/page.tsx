import { DataTable } from '@/components/admin/data-table'
import { columns } from './columns'
import { prisma } from '@/lib/prisma'

export default async function NewsletterPage() {
  const subscriptions = await prisma.newsletterSubscription.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Transform data to include user info directly
  const formattedData = subscriptions.map(sub => ({
    ...sub,
    name: sub.user?.name || '',
    email: sub.user?.email || sub.email,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Newsletter Subscriptions</h2>
          <p className="text-sm text-muted-foreground">
            Manage newsletter subscribers and subscriptions
          </p>
        </div>
        <div className="flex space-x-2">
          <a href="/admin/newsletter/export" className="btn-secondary">
            Export CSV
          </a>
          <a href="/admin/newsletter/new" className="btn-primary">
            Add Subscriber
          </a>
        </div>
      </div>
      <DataTable columns={columns} data={formattedData} />
    </div>
  )
}
