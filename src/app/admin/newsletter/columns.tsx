import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Mail, User } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "email",
    header: "Subscriber",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
          {row.original.name ? (
            <User className="h-5 w-5" />
          ) : (
            <Mail className="h-5 w-5" />
          )}
        </div>
        <div className="ml-4">
          <div className="font-medium">
            {row.original.name || 'No name'}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.original.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.original.active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Subscribed",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return <div className="text-sm">{format(date, "MMM d, yyyy")}</div>
    },
  },
  {
    accessorKey: "userId",
    header: "Account",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {row.original.userId ? 'Registered User' : 'Email Only'}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Link href={`/admin/newsletter/${row.original.id}`}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    },
  },
]
