"use client"

import { SortingChevron, TrashIcon } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { formatdDateTime } from "@/lib/utils/helpers"
import { Tables } from "@/types_db"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"

type ScheduledSFS = Tables<'scheduled_sfs'>

 
export const createColumns = (onScheduledSFSClick?: (scheduledSFS: ScheduledSFS) => void, onDelete?: (scheduledSFS: ScheduledSFS) => void): ColumnDef<ScheduledSFS>[] => [
    {
        accessorKey: "media_id",
        header: ({ column }) => {
            return (
                <div
                    className="ml-6 gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                    Media
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original as any;
            return (
                <div className="flex items-center ml-6">
          
                    <Image
                        src={scheduledSFS.media?.thumbnail_url || scheduledSFS.media?.file_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=face"}
                        alt="Media thumbnail"
                        width={80}
                        height={80}
                        className="object-cover w-20 h-20 rounded-lg"
                    />
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
            const scheduledSFS = row.original;
            return <span>{formatdDateTime(scheduledSFS.scheduled_date, scheduledSFS.scheduled_time)}</span>;
        },
    },
    {
        accessorKey: "user_id",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Creator
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original as any;
            return <span>{scheduledSFS.model?.name || scheduledSFS.model?.username || 'N/A'}</span>;
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
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original;
            return <span>{scheduledSFS.content_slot}</span>;
        },
    }, 
    {
        accessorKey: "promo_link",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Promo Link
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original as any;
            const promo = scheduledSFS.promo_links;
            const url = promo?.url;
            return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{url}</a> : <span>N/A</span>;
        },
    }, 
    {
        accessorKey: "status",
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
            const scheduledSFS = row.original;
            let badgeStatus: "info" | "success" | "destructive" | "warning" | "default";
            let badgeText: string;

            switch (scheduledSFS.status) {
                case "scheduled":
                    badgeStatus = "info";
                    badgeText = "Scheduled";
                    break;
                case "done":
                    badgeStatus = "success";
                    badgeText = "Done";
                    break;
                case "cancelled":
                    badgeStatus = "default";
                    badgeText = "Cancelled";
                    break;
                case "flagged":
                    badgeStatus = "warning";
                    badgeText = "Flagged";
                    break;
                default:
                    badgeStatus = "default";
                    badgeText = scheduledSFS.status ? scheduledSFS.status.charAt(0).toUpperCase() + scheduledSFS.status.slice(1) : "Unknown";
            }

            return <Badge status={badgeStatus} text={badgeText} />;
        },
    }, 
    {
        id: "actions",
        header: ({ column }) => {
            return (
                <div className="mr-6">
                </div>
            )
        },
        cell: ({ row }) => {
            const scheduledSFS = row.original;
            return (
                <div className="mr-6 cursor-pointer hover:text-red-600 transition-colors" onClick={() => onDelete?.(scheduledSFS)}>
                    <TrashIcon/>
                </div>
            );
        },
    },
];

// Default export for backward compatibility
export const columns = createColumns();