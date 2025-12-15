"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tables } from "@/types_db"
import { Button, EditIcon, IconButton, Pagination, TrashIcon } from "@/components/ui"
import { useState } from "react"

type Media = Tables<'media_items'>

interface DataTableProps<Media, TValue> {
    columns: ColumnDef<Media, TValue>[]
    data: Media[]
    selectedItems?: Set<string>
    onSelectionChange?: (selectedIds: Set<string>) => void
}

export function MediaDataTable({
    columns,
    data,
    selectedItems = new Set(),
    onSelectionChange,
}: DataTableProps<Tables<'media_items'>, any>) {
    const [sorting, setSorting] = useState<SortingState>([])

    // Convert selectedItems Set to rowSelection object
    const rowSelection = Object.fromEntries(
        Array.from(selectedItems).map(id => [data.findIndex((item: any) => item.id === id), true])
    );

    const handleRowSelectionChange = (updaterOrValue: any) => {
        const newRowSelection = typeof updaterOrValue === 'function' 
            ? updaterOrValue(rowSelection) 
            : updaterOrValue;
        
        // Convert back to Set of IDs
        const selectedIds = new Set(
            Object.keys(newRowSelection)
                .filter(key => newRowSelection[key])
                .map(key => (data[parseInt(key)] as any)?.id)
                .filter(Boolean)
        );
        
        onSelectionChange?.(selectedIds);
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: handleRowSelectionChange,

        state: {
            sorting,
            rowSelection,
        },
    })

    return (
        <div className="flex flex-col h-full gap-8 overflow-hidden">
            {/* Table with scrollable content */}
            <div className="flex-1 overflow-auto border rounded-2xl">
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader className="z-10 h-12 px-6"> {/* removed rounded-2xl from TableHeader */}
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {/* removed rounded-2xl from TableRow */}
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="font-semibold text-canvas-text">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="h-16 px-6"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}

                        </TableBody>
                    </Table>
                </div>
            </div>

            <Pagination
                currentPage={table.getState().pagination.pageIndex + 1}
                totalPages={table.getPageCount()}
                onPageChange={(page) => table.setPageIndex(page - 1)}
                showInfo={true}
                totalItems={data.length}
                itemsPerPage={table.getState().pagination.pageSize}
                // itemsPerPage={3}
                currentItemsStart={(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + 1}
                currentItemsEnd={Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)}
                itemLabel="media"
            />
        </div>
    )
}