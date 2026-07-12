"use client";

import { useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import {
    accessCycle,
    accessLabel,
    initialRbacRoles,
    rbacModules,
    type AccessLevel,
    type RbacRole,
} from "@/features/settings/types";

const cellClassByAccess: Record<AccessLevel, string> = {
    manage: "text-emerald-600 hover:bg-emerald-50",
    view: "text-[#2b7fd3] hover:bg-blue-50",
    none: "text-gray-300 hover:bg-gray-50",
};

function AccessCell({ level }: { level: AccessLevel }) {
    if (level === "manage") {
        return <CheckIcon size={16} weight="bold" aria-hidden="true" className="mx-auto" />;
    }
    if (level === "view") {
        return <span className="text-xs font-medium">View</span>;
    }
    return <span className="text-xs font-medium text-gray-400">None</span>;
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

    return (
        <div className={cn(design.card, "p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className={design.sectionTitle}>Role-Based Access (RBAC)</h2>
                    <p className={design.sectionSubtitle}>
                        Click a cell to cycle a role&apos;s access to a module.
                    </p>
                </div>
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
                        <span className="text-xs font-medium text-gray-400">None</span>
                        No access
                    </span>
                </div>
            </div>

            <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-left">
                            <th className="py-2 pr-4 font-medium text-gray-500">Role</th>
                            {rbacModules.map((module) => (
                                <th
                                    key={module.key}
                                    className="px-2 py-2 text-center font-medium text-gray-500"
                                >
                                    {module.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.key} className="border-b border-gray-100 last:border-0">
                                <td className="py-2 pr-4 font-medium text-[#1f2430]">{role.label}</td>
                                {rbacModules.map((module) => {
                                    const level = role.access[module.key];
                                    return (
                                        <td key={module.key} className="px-2 py-1.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => cycleAccess(role.key, module.key)}
                                                aria-label={`${role.label}, ${module.label}: ${accessLabel[level]}. Click to change.`}
                                                className={cn(
                                                    "inline-flex h-8 w-full min-w-14 cursor-pointer items-center justify-center rounded-[4px] transition",
                                                    cellClassByAccess[level],
                                                )}
                                            >
                                                <AccessCell level={level} />
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
