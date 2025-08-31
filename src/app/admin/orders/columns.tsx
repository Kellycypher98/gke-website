import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.orderNumber}
      </div>
    ),
  },
  {
    accessorKey: "event.title",
    header: "Event",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.event?.title || 'N/A'}</div>
        <div className="text-sm text-muted-foreground">
          {row.original._count.tickets} ticket(s)
        </div>
      </div>
    ),
  },
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.user?.name || 'Guest'}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.user?.email || row.original.customerEmail}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ row }) => {
      const total = parseFloat(row.original.total)
      const formatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: row.original.currency || 'GBP',
      }).format(total)
      
      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const statusColors = {
        PAID: 'bg-green-100 text-green-800',
        PENDING: 'bg-yellow-100 text-yellow-800',
        CANCELLED: 'bg-red-100 text-red-800',
        REFUNDED: 'bg-gray-100 text-gray-800',
      }
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return <div className="text-sm">{format(date, "MMM d, yyyy")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Link href={`/admin/orders/${row.original.id}`}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    },
  },
]
