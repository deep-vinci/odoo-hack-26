"use client";

import { useMemo, useState } from "react";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { Pill, type PillVariant } from "@/components/ui/pill";

type TripStatus = "on-trip" | "completed" | "dispatched" | "draft";

type Trip = {
    id: string;
    vehicle: string;
    driver: string;
    status: TripStatus;
    eta: string;
};

const statusLabel: Record<TripStatus, string> = {
    "on-trip": "On Trip",
    completed: "Completed",
    dispatched: "Dispatched",
    draft: "Draft",
};

const statusVariant: Record<TripStatus, PillVariant> = {
    "on-trip": "info",
    completed: "active",
    dispatched: "brand-accent",
    draft: "draft",
};

const trips: Trip[] = [
    { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "on-trip", eta: "45 min" },
    { id: "TR002", vehicle: "TRK-12", driver: "John", status: "completed", eta: "" },
    { id: "TR003", vehicle: "MINI-08", driver: "Priya", status: "dispatched", eta: "1h 10m" },
    { id: "TR006", vehicle: "", driver: "", status: "draft", eta: "Awaiting vehicle" },
];

const columns: DataTableColumn<Trip>[] = [
    { key: "id", header: "Trip", render: (row) => <span className="font-medium">{row.id}</span> },
    {
        key: "vehicle",
        header: "Vehicle",
        render: (row) => row.vehicle || <span className="text-gray-400">None</span>,
    },
    {
        key: "driver",
        header: "Driver",
        render: (row) => row.driver || <span className="text-gray-400">None</span>,
    },
    {
        key: "status",
        header: "Status",
        render: (row) => (
            <Pill variant={statusVariant[row.status]}>{statusLabel[row.status]}</Pill>
        ),
    },
    {
        key: "eta",
        header: "ETA",
        render: (row) => row.eta || <span className="text-gray-400">None</span>,
    },
];

export function RecentTripsTable() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const limit = 10;

    const filteredTrips = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return trips;
        return trips.filter((trip) =>
            [trip.id, trip.vehicle, trip.driver, statusLabel[trip.status]]
                .join(" ")
                .toLowerCase()
                .includes(query),
        );
    }, [search]);

    return (
        <ResourceListPage
            title="Recent Trips"
            columns={columns}
            items={filteredTrips}
            total={filteredTrips.length}
            page={page}
            limit={limit}
            onPageChange={setPage}
            getRowKey={(row) => row.id}
            emptyMessage="No recent trips."
            searchPlaceholder="Search trips…"
            searchValue={search}
            onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
            }}
            embedded
            hideHeader
        />
    );
}
