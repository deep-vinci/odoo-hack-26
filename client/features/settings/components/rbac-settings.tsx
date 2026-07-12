"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import { cn } from "@/lib/utils";
import {
    accessCycle,
    accessLabel,
    initialRbacRoles,
    rbacModules,
    type AccessLevel,
    type RbacRole,
} from "@/features/settings/types";

const textByAccess: Record<AccessLevel, string> = {
    manage: "text-emerald-600",
    view: "text-[#2b7fd3]",
    none: "text-gray-300",
};

function AccessCell({ level }: { level: AccessLevel }) {
    if (level === "manage") {
        return <CheckIcon size={16} weight="bold" aria-hidden="true" />;
    }
    if (level === "view") {
        return <span className="text-xs font-medium">View</span>;
    }
    return <span className="text-xs font-medium">None</span>;
}

function Legend() {
    return (
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
                <CheckIcon size={14} weight="bold" className="text-emerald-600" aria-hidden="true" />
                Manage
            </span>
            <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-[#2b7fd3]">View</span>
                Read-only
            </span>
            <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-gray-400">None</span>
                No access
            </span>
        </div>
    );
}

export function RbacSettingsPanel() {
    const [roles, setRoles] = useState<RbacRole[]>(initialRbacRoles);

    function cycleAccess(roleKey: string, moduleKey: string) {
        setRoles((prev) =>
            prev.map((role) =>
                role.key === roleKey
                    ? {
                          ...role,
                          access: {
                              ...role.access,
                              [moduleKey]: accessCycle[role.access[moduleKey]],
                          },
                      }
                    : role,
            ),
        );
    }

    const columns: DataTableColumn<RbacRole>[] = useMemo(
        () => [
            {
                key: "role",
                header: "Role",
                render: (role) => (
                    <span className="font-medium text-[#1f2430]">{role.label}</span>
                ),
            },
            ...rbacModules.map((module) => ({
                key: module.key,
                header: module.label,
                className: "text-center",
                render: (role: RbacRole) => {
                    const level = role.access[module.key];
                    return (
                        <button
                            type="button"
                            onClick={() => cycleAccess(role.key, module.key)}
                            aria-label={`${role.label}, ${module.label}: ${accessLabel[level]}. Click to change.`}
                            className={cn(
                                "inline-flex h-8 w-full min-w-14 cursor-pointer items-center justify-center border-0 bg-transparent transition hover:opacity-60",
                                textByAccess[level],
                            )}
                        >
                            <AccessCell level={level} />
                        </button>
                    );
                },
            })),
        ],
        [],
    );

    return (
        <ResourceListPage
            title="Role-Based Access (RBAC)"
            description="Click a cell to cycle a role's access to a module."
            columns={columns}
            items={roles}
            total={roles.length}
            page={1}
            limit={roles.length}
            onPageChange={() => {}}
            getRowKey={(role) => role.key}
            toolbar={<Legend />}
        />
    );
}
