"use client";

import { SortingChevron, ThreeDotsIcon } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tables } from "@/types_db";
import { ColumnDef } from "@tanstack/react-table";

type PromoLinks = Tables<"promo_links">;

export const createColumns = (
  onPromoLinkClick?: (promoLink: PromoLinks) => void
): ColumnDef<PromoLinks>[] => [
  // MODEL
  {
    accessorKey: "model_id",
    header: ({ column }) => (
      <div
        className="ml-6 gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Model
        <SortingChevron className="h-3 w-3 ml-1" />
      </div>
    ),
    cell: ({ row }) => {
      const promo = row.original;
      const model = (promo as any).models;

      return (
        <div className="ml-6 flex items-center gap-2">
          {model?.display_picture_url && (
            <img
              src={model.display_picture_url}
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          <span className="font-medium">
            {model?.name || "—"}
          </span>
        </div>
      );
    },
  },

  // PROMO NAME
  {
    accessorKey: "promo_name",
    header: ({ column }) => (
      <div
        className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Promo Name
        <SortingChevron className="h-3 w-3 ml-1" />
      </div>
    ),
    cell: ({ row }) => <span>{row.original.promo_name}</span>,
  },

  // PLATFORM
  {
    accessorKey: "platform",
    header: ({ column }) => (
      <div
        className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Platform
        <SortingChevron className="h-3 w-3 ml-1" />
      </div>
    ),
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.platform || "—"}
      </span>
    ),
  },

  // SHORT CODE
  {
    accessorKey: "short_code",
    header: ({ column }) => (
      <div
        className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Code
        <SortingChevron className="h-3 w-3 ml-1" />
      </div>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
        {row.original.short_code || "—"}
      </span>
    ),
  },

  // FANS GAINED
  {
    accessorKey: "fans_gained",
    header: ({ column }) => (
      <div
        className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Fans
        <SortingChevron className="h-3 w-3 ml-1" />
      </div>
    ),
    cell: ({ row }) => <span>{row.original.fans_gained}</span>,
  },

  // RENEWALS
  {
    accessorKey: "renewals",
    header: ({ column }) => (
      <div
        className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Renewals
        <SortingChevron className="h-3 w-3 ml-1" />
      </div>
    ),
    cell: ({ row }) => <span>{row.original.renewals}</span>,
  },

  // STATUS
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div
        className="gap-0.5 text-canvas-text cursor-pointer inline-flex items-center rounded hover:bg-canvas-bg-hover transition-colors"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Status
        <SortingChevron className="h-3 w-3 ml-1" />
      </div>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          status={status === "Active" ? "success" : "warning"}
          text={status}
        />
      );
    },
  },

  // ACTIONS
  {
    id: "actions",
    header: () => <div className="mr-6"></div>,
    cell: ({ row }) => {
      const promoLink = row.original;

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="ml-auto flex items-center justify-end rounded-md text-sm font-medium text-canvas-text hover:bg-gray-100 p-2">
            <ThreeDotsIcon />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="p-0 z-50 bg-canvas-base" align="end">
            <DropdownMenuItem
              onSelect={() => onPromoLinkClick?.(promoLink)}
            >
              View promo link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Default export
export const columns = createColumns();
