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
import { Button, Pagination } from "@/components/ui"
import { useState } from "react"

type PromoLinks = Tables<'promo_links'>

interface DataTableProps<PromoLinks, TValue> {
    columns: ColumnDef<PromoLinks, TValue>[]
    data: PromoLinks[]
    onPromoLinkClick: (promoLink: PromoLinks) => void
}

export function PromoLinksDataTable<PromoLinks, TValue>({
    columns,
    data,
    onPromoLinkClick,
}: DataTableProps<PromoLinks, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    })

    return (
        <div className="h-full flex flex-col overflow-hidden gap-8">
            {/* Table with scrollable content */}
            <div className="flex-1 overflow-auto rounded-2xl border bg-canvas-on-canvas">
                <Table>
                    <TableHeader className="bg-canvas-bg-hover px-6 h-12 z-10"> {/* removed rounded-2xl from TableHeader */}
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {/* removed rounded-2xl from TableRow */}
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-canvas-text font-semibold">
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
                                    className="px-6 h-16"
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
                itemLabel="promo links"
            />
        </div>
    )
}