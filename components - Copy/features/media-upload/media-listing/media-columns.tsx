"use client"

import { EditIcon, SortingChevron, TrashIcon } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/types_db"
import { ColumnDef } from "@tanstack/react-table"
// Use a normal <img> for thumbnails to avoid Next/Image loader/domain issues for dynamic URLs
import { Checkbox } from "@/components/ui/checkbox"

type Media = Tables<'media_items'>


export const createColumns = (onMediaClick?: (media: Media) => void, onDeleteMedia?: (id: string) => void, onEditMedia?: (media: Media) => void): ColumnDef<Media>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "file_url",
        header: ({ column }) => {
            return (
                <div
                    className="ml-6 gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Media
                    {/* <SortingChevron className="w-3 h-3 ml-1" /> */}
                </div>
            )
        },
        cell: ({ row }) => {
            const media = row.original;
            return (
                <div className="flex items-center gap-2 ml-6">
                    {/* <span className="font-medium">{media.file_url}</span> */}
                    <img
                        src={media.file_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=face"}
                        alt="Media thumbnail"
                   
                        className="object-cover rounded-lg w-14 h-14"
                        onError={(e) => {
                            // show fallback if image fails to load
                            const target = e.currentTarget as HTMLImageElement;
                            if (target.src !== "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=face") {
                                target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=face";
                            }
                        }}
                    />
                </div>
            );
        },
    }, {
        accessorKey: "category",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Category
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const media = row.original;
            return <span>{media.category}</span>;
        },
    },
    {
        accessorKey: "tag_creators",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tag Creators
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const media = row.original;
            return (
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(media.tag_creators)
                        ? media.tag_creators.map((creator, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-md"
                            >
                                {creator}
                            </span>
                        ))
                        : media.tag_creators}
                </div>
            );
        },
    },
    {
        accessorKey: "hashtags",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Hashtags
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const media = row.original;
            return (
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(media.hashtags)
                        ? media.hashtags.map((hashtag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-md"
                            >
                                {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                            </span>
                        ))
                        : media.hashtags}
                </div>
            );
        },
    },
    {
        accessorKey: "caption",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Caption
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const media = row.original;
            return (
                <span>
                    {media.caption}
                </span>
            );
        },
    },
    {
        accessorKey: "notes",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Notes
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const media = row.original;
            return (
                <span>
                    {media.notes}
                </span>
            );
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
            const media = row.original;
            return (
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => onEditMedia?.(media)}
                        className="p-2 transition-opacity hover:opacity-70"
                    >
                        <EditIcon />
                    </button>
                    <button
                        onClick={() => onDeleteMedia?.(media.id)}
                        className="p-2 transition-opacity hover:opacity-70"
                    >
                        <TrashIcon />
                    </button>
                </div>
            );
        },
    },
];

// Default export for backward compatibility
export const columns = createColumns();