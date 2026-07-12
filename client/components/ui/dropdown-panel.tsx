"use client";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type DropdownPanelAction = {
    label: string;
    icon?: ReactNode;
    onSelect: () => void;
    variant?: "default" | "destructive";
    disabled?: boolean;
};

type DropdownPanelProps = {
    actions: DropdownPanelAction[];
    align?: ComponentProps<typeof DropdownMenuContent>["align"];
    triggerLabel?: string;
    triggerClassName?: string;
    menuClassName?: string;
};

export function DropdownPanel({
    actions,
    align = "end",
    triggerLabel = "Open actions",
    triggerClassName,
    menuClassName,
}: DropdownPanelProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={triggerLabel}
                className={cn(
                    "inline-flex size-8 cursor-pointer items-center justify-center rounded-[4px] border border-transparent text-gray-500 transition hover:border-gray-200 hover:bg-gray-50 hover:text-[#1f2430] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fd3]/20 data-popup-open:border-gray-200 data-popup-open:bg-gray-50",
                    triggerClassName,
                )}
            >
                <DotsThreeVerticalIcon size={18} weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={align}
                className={cn("min-w-[168px]", menuClassName)}
            >
                {actions.map((action) => (
                    <DropdownMenuItem
                        key={action.label}
                        variant={action.variant}
                        disabled={action.disabled}
                        onClick={action.onSelect}
                    >
                        {action.icon}
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
