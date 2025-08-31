import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Check, X, MoreHorizontal, Ticket, Calendar, RefreshCw, User } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <div className="font-medium">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <User className="h-5 w-5" />
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
      </div>
    ),
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
    accessorKey: "activity",
    header: "Activity",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="flex items-center text-sm">
          <Ticket className="h-4 w-4 mr-1 text-blue-500" />
          <span className={row.original.hasBoughtTicket ? 'text-green-600' : 'text-gray-500'}>
            {row.original.hasBoughtTicket ? 'Purchased' : 'No purchases'}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-1 text-blue-500" />
          <span className={row.original.attendedLastEvent ? 'text-green-600' : 'text-gray-500'}>
            {row.original.attendedLastEvent ? 'Attended' : 'Not attended'}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "lastEvent",
    header: "Last Event",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">{row.original.lastEventAttendedTitle}</div>
        {row.original.lastEventDate && (
          <div className="text-muted-foreground">
            {format(new Date(row.original.lastEventDate), "MMM d, yyyy")}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "refunds",
    header: "Refunds",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="flex items-center">
          {row.original.hasRequestedRefund ? (
            <>
              <RefreshCw className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="text-yellow-600">Requested</span>
              {row.original.refundRequestedAt && (
                <span className="text-xs text-muted-foreground ml-1">
                  {format(new Date(row.original.refundRequestedAt), "MM/dd")}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-500">No request</span>
          )}
        </div>
        <div className="flex items-center">
          {row.original.hasBeenRefunded ? (
            <>
              <Check className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-600">Refunded</span>
              {row.original.refundedAt && (
                <span className="text-xs text-muted-foreground ml-1">
                  {format(new Date(row.original.refundedAt), "MM/dd")}
                </span>
              )}
            </>
          ) : row.original.hasRequestedRefund ? (
            <span className="text-amber-600 text-sm">Pending</span>
          ) : null}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div className="text-sm">
          <div>{format(date, "MMM d, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {format(date, "h:mm a")}
          </div>
        </div>
      )
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
