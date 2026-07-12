"use client";

import { useState, type ReactNode } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import { CaretDown, MagnifyingGlassIcon } from "@phosphor-icons/react";

export type FilterDropdownOption = {
    value: string;
    label: string;
};

export type FilterDropdownProps = {
    label: string;
    value: string;
    options: FilterDropdownOption[];
    onChange: (value: string) => void;
    id?: string;
    disabled?: boolean;
    align?: "start" | "end";
    triggerClassName?: string;
    menuClassName?: string;
    itemClassName?: string;
    leadingIcon?: ReactNode;
    selectedLabel?: string;
    searchable?: boolean;
};

export function FilterDropdown({
    label,
    value,
    options,
    onChange,
    id,
    disabled = false,
    align = "start",
    triggerClassName,
    menuClassName,
    itemClassName,
    leadingIcon,
    selectedLabel,
    searchable = false,
}: FilterDropdownProps) {
    const [search, setSearch] = useState("");

    const selected =
        selectedLabel ??
        options.find((option) => option.value === value)?.label ??
        label;

    const visibleOptions =
        searchable && search.trim()
            ? options.filter((o) =>
                  o.label.toLowerCase().includes(search.trim().toLowerCase()),
              )
            : options;

    return (
        <DropdownMenu
            onOpenChange={(open) => {
                if (!open) setSearch("");
            }}
        >
            <DropdownMenuTrigger
                id={id}
                disabled={disabled}
                className={cn(design.dropdownTrigger, triggerClassName)}
            >
                {leadingIcon}
                <span className="truncate text-left">{selected}</span>
                <CaretDown size={14} className="shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={align}
                className={cn(
                    design.dropdownMenu,
                    "min-w-[200px]",
                    menuClassName,
                )}
            >
                {searchable ? (
                    <div className="border-b border-gray-100 px-2 py-1.5">
                        <div className="relative">
                            <MagnifyingGlassIcon
                                size={14}
                                className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                placeholder="Search…"
                                className="h-7 w-full rounded-[4px] border border-gray-200 bg-[#fafafa] pl-7 pr-2 text-xs text-[#1f2430] outline-none placeholder:text-gray-400 focus:border-[#2b7fd3] focus:bg-white focus:ring-2 focus:ring-[#2b7fd3]/15"
                            />
                        </div>
                    </div>
                ) : null}
                {visibleOptions.length === 0 ? (
                    <p className="px-2 py-1.5 text-sm text-gray-400">
                        {searchable && search.trim()
                            ? "No results"
                            : "No options available"}
                    </p>
                ) : (
                    <DropdownMenuRadioGroup
                        value={value}
                        onValueChange={onChange}
                    >
                        {visibleOptions.map((option) => (
                            <DropdownMenuRadioItem
                                key={option.value || "all"}
                                value={option.value}
                                className={cn("truncate", itemClassName)}
                            >
                                {option.label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
