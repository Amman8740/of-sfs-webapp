"use client"

import { Button, SortingChevron, ThreeDotsIcon } from "@/components/ui"
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tables } from "@/types_db"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
type Models = Tables<'models'>

interface ModelsColumnsProps {
    onModelClick?: (modelId: string) => void;
}

export const createColumns = (onModelClick?: (modelId: string) => void): ColumnDef<Models>[] => [
    {
        accessorKey: "display_picture_url",
        header: ({ column }) => {
            return (
                <div
                    className="ml-6 gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Model
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const model = row.original;
            return (
                <div className="flex items-center gap-2 ml-6">
                    <span className="font-medium">{model.name}</span>
                </div>
            );
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
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const model = row.original;
            return <span>{model.fan_count!.toLocaleString()}</span>;
        },
    },
    {
        accessorKey: "subscription_type",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Subscription Type
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const model = row.original;
            return <Badge status={"success"} text={model.subscription_type!} />
        },
    },
    {
        accessorKey: "is_verified",
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
            const model = row.original;
            return <Badge status={model.is_verified ? 'success' : 'info'} text={model.is_verified ? "Verified" : "Not Verified"} />;
        },
    },
    {
        accessorKey: "verification_date",
        header: ({ column }) => {
            return (
                <div
                    className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Verified On
                    <SortingChevron className="w-3 h-3 ml-1" />
                </div>
            )
        },
        cell: ({ row }) => {
            const model = row.original;
            return model.verification_date ? (
                <span>
                    {new Date(model.verification_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            ) : (
                "-"
            );
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
            const model = row.original;
            return (
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="flex items-center justify-end p-2 ml-auto text-sm font-medium rounded-md text-canvas-text hover:bg-gray-100" style={{ marginRight: 0 }}>
                        <ThreeDotsIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-50 p-0 bg-canvas-base" align="end">
                        <DropdownMenuItem
                            className="hover:bg-canvas-bg-hover"
                            onSelect={() => onModelClick ? onModelClick(model.id) : window.location.href = `/models/${model.id}`}
                        >
                            View profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="hover:bg-canvas-bg-hover"
                            onSelect={() => console.log("Upload media:", model.id)}
                        >
                            Upload media
                        </DropdownMenuItem>
                        {/* <DropdownMenuSeparator /> */}
                        <DropdownMenuItem
                            onSelect={() => console.log("Delete:", model.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

// Default export for backward compatibility
export const columns = createColumns();