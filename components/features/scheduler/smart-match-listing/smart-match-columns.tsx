"use client"

import { ExpandIcon, SortingChevron, TrashIcon } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { formatdDateTime } from "@/lib/utils/helpers"
import { Tables } from "@/types_db"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"

type ScheduledSFS = Tables<'scheduled_sfs'>


export const createSmartMatchColumns = (onMediaExpand?: (media: any) => void): ColumnDef<ScheduledSFS>[] => [
    {
        accessorKey: "media_id",
        header: ({ column }) => {
            return (
                <div
                    className="ml-2 gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Media
                    <SortingChevron className="h-3 w-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original;
            return (
                <div className="ml-2 flex items-center">
                    <span className="font-medium">{scheduledSFS.media_id}</span>
                    <div className="relative h-20 w-20">
                        <Image
                            src={scheduledSFS.media_id || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=face"}
                            alt="Media thumbnail"
                            width={80}
                            height={80}
                            className="h-20 w-20 rounded-lg object-cover"
                        />
                        <button
                            onClick={() => onMediaExpand?.(scheduledSFS.media_id)}
                            className="absolute bottom-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            <ExpandIcon className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "creator",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Creator
                    <SortingChevron className="h-3 w-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original;
            return <span>{scheduledSFS.user_id}</span>;
        },
    },
    {
        accessorKey: "fan_count",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Fan Count
                    <SortingChevron className="h-3 w-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original;
            return <span>{scheduledSFS.fan_count || 10}</span>;
        },
    },
    {
        accessorKey: "tags",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tags
                    <SortingChevron className="h-3 w-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original;
            return <span>{scheduledSFS.tags?.join(" ") || "No tags"}</span>;
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                   Date
                    <SortingChevron className="h-3 w-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original;
            return <span>{formatdDateTime(scheduledSFS.scheduled_date, scheduledSFS.scheduled_time)}</span>;
        },
    },
    {
        accessorKey: "content_slot",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Content Slot
                    <SortingChevron className="h-3 w-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original; 
            return <span>{scheduledSFS.content_slot || 1}</span>;
        },
    },
    {
        id: "actions",
        header: ({ column }) => {
            return (
                <div className="mr-6">
                    Actions
                </div>
            )
        },
        cell: ({ row }) => {
            // const model = row.original;
            return (
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="h-10 px-3 py-1 rounded-xl bg-success-bg font-semibold text-success-text hover:bg-success-bg/80 transition"
                    >
                        Approve
                    </button>
                    <button
                        type="button"
                        className="h-10 px-3 py-1 rounded-xl bg-alert-bg font-semibold text-alert-border-hover hover:bg-alert-bg/80 transition"
                    >
                        Decline
                    </button>
                </div>
            );
        },
    },
];

// Default export for backward compatibility
export const columns = createSmartMatchColumns();