"use client"

import { SortingChevron, TrashIcon } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/types_db"
import { ColumnDef } from "@tanstack/react-table"
import { getRelativeTime } from "@/lib/utils/formatTime"

type Notifications = Tables<'notifications'>

export const createColumns = (
  onNotificationClick?: (notification: Notifications) => void,
  onDeleteNotification?: (id: string) => void
): ColumnDef<Notifications>[] => [
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <div
                    className="ml-6 gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                    Notifications
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const notification = row.original;
            return (
                <div
                  className="flex flex-col gap-1 ml-6 cursor-pointer"
                  onClick={() => onNotificationClick?.(notification)}
                >
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-sm text-gray-600">{notification.message}</span>
                </div>
            );
        },
    },    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Time   
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const notification = row.original;
            return <span className="text-sm text-gray-600">{getRelativeTime(notification.created_at)}</span>;
        },
    },
    {
        accessorKey: "is_read",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const notification = row.original;
            return <Badge status={notification.is_read ? 'default' : 'info'} text={notification.is_read ? 'Read' : 'Unread'} />;
        },
    }, 
    {
        id: "actions",
        header: ({ column }) => {
            return (
                 <div
                    className="flex items-center justify-center gap-1 text-center text-canvas-text"
                >
                    <span>Action</span>
                     <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const notification = row.original;
            return (
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => onDeleteNotification?.(notification.id)}
                    className="p-2 transition-opacity hover:opacity-70"
                  >
                      <TrashIcon/>
                  </button>
                </div>
            );
        },
    },
];

export const columns = createColumns();