"use client";

import { useState } from "react";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { Pill } from "@/components/ui/pill";
import {
    tripStatusLabel,
    tripStatusVariant,
    type TripListItem,
} from "@/features/trips/api";
import { useTrips } from "@/features/trips/use-trips";

const LIMIT = 10;

const columns: DataTableColumn<TripListItem>[] = [
    {
        key: "trip_number",
        header: "Trip",
        render: (row) => <span className="font-medium">{row.trip_number}</span>,
    },
    {
        key: "vehicle",
        header: "Vehicle",
        render: (row) =>
            row.vehicle?.registration_number || (
                <span className="text-gray-400">None</span>
            ),
    },
    {
        key: "driver",
        header: "Driver",
        render: (row) =>
            row.driver?.name || <span className="text-gray-400">None</span>,
    },
    {
        key: "status",
        header: "Status",
        render: (row) => (
            <Pill variant={tripStatusVariant[row.status]}>
                {tripStatusLabel[row.status]}
            </Pill>
        ),
    },
    {
        key: "planned_distance_km",
        header: "Distance",
        render: (row) =>
            row.planned_distance_km ? (
                `${row.planned_distance_km.toLocaleString("en-IN")} km`
            ) : (
                <span className="text-gray-400">None</span>
            ),
    },
];

export function RecentTripsTable() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const { data, isLoading, isError, error } = useTrips({
        page,
        limit: LIMIT,
        search: search.trim() || undefined,
        sort_by: "created_at",
        sort_order: "desc",
    });

    const trips = data?.trips ?? [];
    const total = data?.pagination.total ?? 0;
    const emptyMessage = isError ? error.message : "No recent trips.";

    return (
        <ResourceListPage
            title="Recent Trips"
            columns={columns}
            items={trips}
            total={total}
            page={page}
            limit={LIMIT}
            isLoading={isLoading}
            onPageChange={setPage}
            getRowKey={(row) => row.id}
            emptyMessage={emptyMessage}
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
