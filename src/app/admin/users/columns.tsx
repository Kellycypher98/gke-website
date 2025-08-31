import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.name || 'No name'}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      const roleColors = {
        ADMIN: 'bg-purple-100 text-purple-800',
        USER: 'bg-blue-100 text-blue-800',
        ORGANIZER: 'bg-green-100 text-green-800',
      }
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
          {role}
        </span>
      )
    },
  },
  {
    accessorKey: "_count.orders",
    header: "Orders",
  },
  {
    accessorKey: "_count.tickets",
    header: "Tickets",
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div className="text-sm text-muted-foreground">{format(date, "MMM d, yyyy")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Link href={`/admin/users/${row.original.id}`}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    },
  },
]
