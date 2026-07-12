"use client";

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  items: T[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  /** Render without the outer panel wrapper (parent supplies the card). */
  unstyled?: boolean;
  /** 4px corner radius on the header row ends (left/right on first/last cells). */
  roundedTableHeader?: boolean;
  /** Force equal-width columns via table-fixed layout. */
  tableFixed?: boolean;
  /** Key of the currently expanded row. */
  expandedKey?: string | null;
  /** Called when the user clicks a row to toggle expansion. */
  onToggleExpand?: (key: string) => void;
  /** Content rendered below an expanded row (full-width). */
  expandContent?: (row: T) => ReactNode;
};

function CaretLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function CaretRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function Pagination({
  page,
  limit,
  total,
  onPageChange,
}: {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-3">
      <div className="w-full border-b border-gray-200" />
      <p className="text-xs text-gray-500">
        {total === 0
          ? "No results"
          : `Showing ${from} to ${to} of ${total.toLocaleString()} total`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-[4px] border border-gray-200 bg-white px-2.5 text-sm text-[#1f2430] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CaretLeft />
          Previous
        </button>
        <span className="min-w-[4.5rem] text-center text-sm text-gray-600">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-[4px] border border-gray-200 bg-white px-2.5 text-sm text-[#1f2430] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <CaretRight />
        </button>
      </div>
    </div>
  );
}

export function DataTable<T>({
  columns,
  items,
  total,
  page,
  limit,
  onPageChange,
  getRowKey,
  isLoading = false,
  emptyMessage = "No records found.",
  onRowClick,
  unstyled = false,
  roundedTableHeader = false,
  tableFixed = false,
  expandedKey,
  onToggleExpand,
  expandContent,
}: DataTableProps<T>) {
  const table = (
    <div className="flex flex-col">
      <div className="px-8">
        <div className={cn("min-w-0 overflow-x-auto", roundedTableHeader && "px-px pb-px")}>
          <table
            className={cn(
              "w-full min-w-[640px] text-left text-sm",
              roundedTableHeader ? "border-separate border-spacing-0" : "border-collapse",
              tableFixed && "table-fixed",
            )}
          >
            <thead>
              <tr className="bg-[#F2F2F2]">
                {columns.map((column, columnIndex) => (
                  <th
                    key={column.key}
                    className={cn(
                      "border-b border-gray-100 px-3 py-3 text-xs font-medium tracking-wide text-gray-600 uppercase",
                      roundedTableHeader && columnIndex === 0 && "rounded-l-[4px]",
                      roundedTableHeader && columnIndex === columns.length - 1 && "rounded-r-[4px]",
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((column) => (
                      <td key={column.key} className={cn("h-14 px-3 py-3", column.className)}>
                        <div className="h-4 w-3/4 animate-pulse rounded-[4px] bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                items.map((row, rowIndex) => {
                  const key = getRowKey(row);
                  const isExpanded = expandedKey === key;
                  const isLast = rowIndex === items.length - 1;
                  return (
                    <Fragment key={key}>
                      <tr
                        onClick={
                          onRowClick
                            ? () => onRowClick(row)
                            : onToggleExpand
                              ? () => onToggleExpand(key)
                              : undefined
                        }
                        className={cn(
                          "group transition",
                          !roundedTableHeader && "border-b border-gray-200 last:border-0",
                          (onRowClick || onToggleExpand) && "cursor-pointer",
                        )}
                      >
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={cn(
                              "h-14 max-w-75 overflow-hidden px-3 py-3 text-[#1f2430] transition group-hover:bg-[#FAFAFA] group-hover:first:rounded-l-[6px] group-hover:last:rounded-r-[6px]",
                              roundedTableHeader && !(isLast && !isExpanded) && "border-b border-gray-200",
                              column.className,
                            )}
                          >
                            {column.render(row)}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && expandContent ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className={cn("px-3 pt-1", !isLast && "border-b border-gray-200")}
                          >
                            {expandContent(row)}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} limit={limit} total={total} onPageChange={onPageChange} />
    </div>
  );

  if (unstyled) {
    return table;
  }

  return (
    <div className={cn("overflow-hidden rounded-[4px] bg-white shadow-[0_2px_6px_#1a181e0a]")}>
      {table}
    </div>
  );
}
