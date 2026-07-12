"use client";

import { useMemo, useState } from "react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import type { FuelExpenseVehicle, FuelLog } from "@/features/fuel-expenses/types";

function formatDate(iso: string) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

type FuelLogTableProps = {
    logs: FuelLog[];
    vehicles: FuelExpenseVehicle[];
    onRecordCost: () => void;
};

export function FuelLogTable({ logs, vehicles, onRecordCost }: FuelLogTableProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const limit = 10;

    const vehicleNameById = useMemo(() => new Map(vehicles.map((v) => [v.id, v.name])), [vehicles]);

    const columns: DataTableColumn<FuelLog>[] = useMemo(
        () => [
            {
                key: "vehicle",
                header: "Vehicle",
                render: (row) => <span className="font-medium">{vehicleNameById.get(row.vehicleId) ?? "—"}</span>,
            },
            { key: "trip", header: "Trip", render: (row) => row.tripId ?? "—" },
            { key: "date", header: "Date", render: (row) => formatDate(row.date) },
            { key: "liters", header: "Liters", render: (row) => `${row.liters.toLocaleString("en-IN")} L` },
            {
                key: "cost",
                header: "Fuel Cost",
                render: (row) => <span className="tabular-nums">{row.cost.toLocaleString("en-IN")}</span>,
            },
        ],
        [vehicleNameById],
    );

    const filteredLogs = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return logs;
        return logs.filter((log) =>
            `${vehicleNameById.get(log.vehicleId) ?? ""} ${log.tripId ?? ""}`.toLowerCase().includes(query),
        );
    }, [logs, search, vehicleNameById]);

    return (
        <>
            <ResourceListPage
                title="Fuel Logs"
                columns={columns}
                items={filteredLogs}
                total={filteredLogs.length}
                page={page}
                limit={limit}
                onPageChange={setPage}
                getRowKey={(row) => row.id}
                emptyMessage="No fuel logs yet."
                searchPlaceholder="Search vehicle, trip…"
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                primaryAction={{ label: "Record Cost", onClick: onRecordCost }}
                hideHeader
            />
            <p className="px-8 pb-6 text-xs text-gray-500">
                Total Operational Cost is computed automatically from Fuel + Expenses + linked Maintenance.
            </p>
        </>
    );
}
