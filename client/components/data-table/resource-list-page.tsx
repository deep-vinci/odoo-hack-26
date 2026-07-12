"use client";

import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import { DataTable, type DataTableColumn } from "./data-table";

type ResourceListPageProps<T> = {
    title: string;
    description?: string;
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
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    filters?: ReactNode;
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    toolbar?: ReactNode;
    embedded?: boolean;
    hideHeader?: boolean;
    fullWidth?: boolean;
    tableFixed?: boolean;
    expandedKey?: string | null;
    onToggleExpand?: (key: string) => void;
    expandContent?: (row: T) => ReactNode;
};

export function ResourceListPage<T>({
    title,
    description,
    columns,
    items,
    total,
    page,
    limit,
    onPageChange,
    getRowKey,
    isLoading,
    emptyMessage,
    onRowClick,
    searchPlaceholder = "Search…",
    searchValue,
    onSearchChange,
    filters,
    primaryAction,
    toolbar,
    embedded = false,
    hideHeader = false,
    fullWidth = true,
    tableFixed = false,
    expandedKey,
    onToggleExpand,
    expandContent,
}: ResourceListPageProps<T>) {
    const [localSearch, setLocalSearch] = useState(searchValue ?? "");
    const onSearchChangeRef = useRef(onSearchChange);
    onSearchChangeRef.current = onSearchChange;

    useEffect(() => {
        setLocalSearch(searchValue ?? "");
    }, [searchValue]);

    useEffect(() => {
        if (!onSearchChangeRef.current) {
            return;
        }

        const timer = window.setTimeout(() => {
            onSearchChangeRef.current?.(localSearch);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [localSearch]);

    const titleClass = embedded
        ? "text-lg font-medium text-gray-900"
        : "text-[22px] font-semibold text-gray-900";
    const TitleTag = embedded ? "h2" : "h1";
    const compactList = embedded && hideHeader;

    const searchBar = onSearchChange ? (
        <div className="relative min-w-0 flex-1">
            <MagnifyingGlass
                size={18}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            />
            <Input
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className={cn(design.searchInput, "pl-10")}
            />
        </div>
    ) : null;

    const content = (
        <div className={embedded ? undefined : "bg-[#F7F7F7]"}>
            <div
                className={cn(
                    "flex flex-wrap items-start justify-between gap-4",
                    hideHeader ? "mb-4" : "mb-6",
                )}
            >
                {hideHeader ? (
                    <div className="min-w-0 flex-1" />
                ) : (
                    <div className="pl-8">
                        <TitleTag className={titleClass}>{title}</TitleTag>
                        {description ? (
                            <p className="mt-1 text-sm text-gray-500">
                                {description}
                            </p>
                        ) : null}
                    </div>
                )}
                {primaryAction ? (
                    <button
                        type="button"
                        onClick={primaryAction.onClick}
                        className={cn(
                            design.primaryButton,
                            "w-auto! gap-2 py-0 px-8 mr-8 mt-4",
                        )}
                    >
                        <Plus size={16} weight="bold" />
                        {primaryAction.label}
                    </button>
                ) : null}
            </div>

            {compactList ? (
                <div className={cn(design.panel, "overflow-hidden")}>
                    {searchBar || filters || toolbar ? (
                        <div className="flex flex-col gap-3 px-8 py-4 lg:flex-row lg:items-center">
                            {searchBar}
                            {filters}
                            {toolbar}
                        </div>
                    ) : null}
                    <DataTable
                        unstyled
                        roundedTableHeader
                        tableFixed={tableFixed}
                        columns={columns}
                        items={items}
                        total={total}
                        page={page}
                        limit={limit}
                        onPageChange={onPageChange}
                        getRowKey={getRowKey}
                        isLoading={isLoading}
                        emptyMessage={emptyMessage}
                        onRowClick={onRowClick}
                        expandedKey={expandedKey}
                        onToggleExpand={onToggleExpand}
                        expandContent={expandContent}
                    />
                </div>
            ) : (
                <>
                    <div className={cn(design.panel, "mb-0 px-8 py-4")}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            {searchBar}
                            {filters}
                            {toolbar}
                        </div>
                    </div>

                    <DataTable
                        roundedTableHeader
                        tableFixed={tableFixed}
                        columns={columns}
                        items={items}
                        total={total}
                        page={page}
                        limit={limit}
                        onPageChange={onPageChange}
                        getRowKey={getRowKey}
                        isLoading={isLoading}
                        emptyMessage={emptyMessage}
                        onRowClick={onRowClick}
                        expandedKey={expandedKey}
                        onToggleExpand={onToggleExpand}
                        expandContent={expandContent}
                    />
                </>
            )}
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <div className={design.pageShell}>
            <div className={fullWidth ? "w-full" : design.pageContainer}>
                {content}
            </div>
        </div>
    );
}
