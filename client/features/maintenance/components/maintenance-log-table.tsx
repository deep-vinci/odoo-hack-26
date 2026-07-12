"use client";

import { CheckCircleIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import { DropdownPanel } from "@/components/ui/dropdown-panel";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Pill } from "@/components/ui/pill";
import type { MaintenanceRecord, MaintenanceStatus } from "@/features/maintenance/api";
import {
    formatCost,
    formatMaintenanceDate,
    maintenanceStatusLabel,
    maintenanceStatusVariant,
} from "@/features/maintenance/types";

const statusFilterOptions = [
    { value: "", label: "All" },
    { value: "open", label: "In Shop" },
    { value: "closed", label: "Completed" },
];

type MaintenanceLogTableProps = {
    records: MaintenanceRecord[];
    total: number;
    page: number;
    limit: number;
    isLoading: boolean;
    emptyMessage: string;
    search: string;
    statusFilter: MaintenanceStatus | "";
    onPageChange: (page: number) => void;
    onSearchChange: (value: string) => void;
    onStatusFilterChange: (value: MaintenanceStatus | "") => void;
    onAddRecord: () => void;
    onEditRecord: (record: MaintenanceRecord) => void;
    onCompleteRecord: (record: MaintenanceRecord) => void;
};

export function MaintenanceLogTable({
    records,
    total,
    page,
    limit,
    isLoading,
    emptyMessage,
    search,
    statusFilter,
    onPageChange,
    onSearchChange,
    onStatusFilterChange,
    onAddRecord,
    onEditRecord,
    onCompleteRecord,
}: MaintenanceLogTableProps) {
    const columns: DataTableColumn<MaintenanceRecord>[] = useMemo(
        () => [
            {
                key: "vehicle",
                header: "Vehicle",
                render: (row) => (
                    <div className="flex flex-col">
                        <span className="font-medium">{row.vehicle.name}</span>
                        <span className="text-xs text-gray-500">
                            {row.vehicle.registration_number}
                        </span>
                    </div>
                ),
            },
            { key: "title", header: "Service", render: (row) => row.title },
            { key: "cost", header: "Cost", render: (row) => formatCost(row.cost) },
            {
                key: "opened_at",
                header: "Opened",
                render: (row) => formatMaintenanceDate(row.opened_at),
            },
            {
                key: "status",
                header: "Status",
                render: (row) => (
                    <Pill variant={maintenanceStatusVariant[row.status]}>
                        {maintenanceStatusLabel[row.status]}
                    </Pill>
                ),
            },
            {
                key: "actions",
                header: "",
                className: "w-16 text-right",
                render: (row) =>
                    row.status === "open" ? (
                        <div className="flex justify-end">
                            <DropdownPanel
                                triggerLabel={`Actions for ${row.vehicle.name}`}
                                actions={[
                                    {
                                        label: "Edit",
                                        icon: <PencilSimpleIcon size={16} />,
                                        onSelect: () => onEditRecord(row),
                                    },
                                    {
                                        label: "Mark Completed",
                                        icon: <CheckCircleIcon size={16} />,
                                        onSelect: () => onCompleteRecord(row),
                                    },
                                ]}
                            />
                        </div>
                    ) : null,
            },
        ],
        [onEditRecord, onCompleteRecord],
    );

    return (
        <>
            <ResourceListPage
                title="Service Log"
                columns={columns}
                items={records}
                total={total}
                page={page}
                limit={limit}
                onPageChange={onPageChange}
                isLoading={isLoading}
                getRowKey={(row) => row.id}
                emptyMessage={emptyMessage}
                searchPlaceholder="Search service…"
                searchValue={search}
                onSearchChange={onSearchChange}
                filters={
                    <FilterDropdown
                        label="Status: All"
                        value={statusFilter}
                        options={statusFilterOptions}
                        onChange={(value) =>
                            onStatusFilterChange(value as MaintenanceStatus | "")
                        }
                        selectedLabel={`Status: ${statusFilterOptions.find((o) => o.value === statusFilter)?.label ?? "All"}`}
                        triggerClassName="w-[160px]"
                    />
                }
                primaryAction={{ label: "Log Record", onClick: onAddRecord }}
                hideHeader
            />
            <p className="px-8 pb-6 text-xs text-gray-500">
                Rule: Only one open (In Shop) record per vehicle at a time
            </p>
        </>
    );
}
