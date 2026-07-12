"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import { DropdownPanel } from "@/components/ui/dropdown-panel";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Pill } from "@/components/ui/pill";
import {
    maintenanceStatusLabel,
    maintenanceStatusVariant,
    type MaintenanceRecord,
    type MaintenanceVehicle,
} from "@/features/maintenance/types";

const statusFilterOptions = [
    { value: "", label: "All" },
    { value: "in-shop", label: "In Shop" },
    { value: "completed", label: "Completed" },
];

function formatDate(iso: string) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

type MaintenanceLogTableProps = {
    records: MaintenanceRecord[];
    vehicles: MaintenanceVehicle[];
    onAddRecord: () => void;
    onEditRecord: (record: MaintenanceRecord) => void;
};

export function MaintenanceLogTable({
    records,
    vehicles,
    onAddRecord,
    onEditRecord,
}: MaintenanceLogTableProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const limit = 10;

    const vehicleNameById = useMemo(() => new Map(vehicles.map((v) => [v.id, v.name])), [vehicles]);

    const columns: DataTableColumn<MaintenanceRecord>[] = useMemo(
        () => [
            {
                key: "vehicle",
                header: "Vehicle",
                render: (row) => <span className="font-medium">{vehicleNameById.get(row.vehicleId) ?? "—"}</span>,
            },
            { key: "serviceType", header: "Service", render: (row) => row.serviceType },
            { key: "cost", header: "Cost", render: (row) => row.cost.toLocaleString("en-IN") },
            { key: "date", header: "Date", render: (row) => formatDate(row.date) },
            {
                key: "status",
                header: "Status",
                render: (row) => (
                    <Pill variant={maintenanceStatusVariant[row.status]}>{maintenanceStatusLabel[row.status]}</Pill>
                ),
            },
            {
                key: "actions",
                header: "",
                className: "w-16 text-right",
                render: (row) => (
                    <div className="flex justify-end">
                        <DropdownPanel
                            triggerLabel={`Edit ${vehicleNameById.get(row.vehicleId) ?? "record"}`}
                            actions={[
                                {
                                    label: "Edit",
                                    icon: <PencilSimpleIcon size={16} />,
                                    onSelect: () => onEditRecord(row),
                                },
                            ]}
                        />
                    </div>
                ),
            },
        ],
        [vehicleNameById, onEditRecord],
    );

    const filteredRecords = useMemo(() => {
        const query = search.trim().toLowerCase();
        return records.filter((record) => {
            const vehicleName = vehicleNameById.get(record.vehicleId) ?? "";
            const matchesQuery = !query || `${vehicleName} ${record.serviceType}`.toLowerCase().includes(query);
            const matchesStatus = !statusFilter || record.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
    }, [records, search, statusFilter, vehicleNameById]);

    return (
        <>
            <ResourceListPage
                title="Service Log"
                columns={columns}
                items={filteredRecords}
                total={filteredRecords.length}
                page={page}
                limit={limit}
                onPageChange={setPage}
                getRowKey={(row) => row.id}
                emptyMessage="No service records yet."
                searchPlaceholder="Search vehicle, service…"
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={
                    <FilterDropdown
                        label="Status: All"
                        value={statusFilter}
                        options={statusFilterOptions}
                        onChange={(value) => {
                            setStatusFilter(value);
                            setPage(1);
                        }}
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
