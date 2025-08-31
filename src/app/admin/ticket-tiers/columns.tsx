import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import Link from "next/link"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.name}
        <div className="text-sm text-muted-foreground">
          {row.original.event.title}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: row.original.currency || 'GBP',
      }).format(price)
      
      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "quantity",
    header: "Available / Total",
    cell: ({ row }) => {
      const available = row.original.quantity - row.original.sold
      return `${available} / ${row.original.quantity}`
    },
  },
  {
    accessorKey: "sold",
    header: "Sold",
  },
  {
    accessorKey: "available",
    header: "Status",
    cell: ({ row }) => {
      const available = row.original.available
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {available ? 'Available' : 'Sold Out'}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Link href={`/admin/ticket-tiers/${row.original.id}`}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    },
  },
]
