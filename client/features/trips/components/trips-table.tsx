"use client";

import { useMemo } from "react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Pill } from "@/components/ui/pill";
import {
    TRIP_STATUSES,
    tripStatusLabel,
    tripStatusVariant,
    type TripListItem,
} from "@/features/trips/api";

const numberFormat = new Intl.NumberFormat("en-IN");

const statusFilterOptions = [
    { value: "", label: "All" },
    ...TRIP_STATUSES.map((status) => ({
        value: status,
        label: tripStatusLabel[status],
    })),
];

type TripsTableProps = {
    trips: TripListItem[];
    total: number;
    page: number;
    limit: number;
    isLoading: boolean;
    search: string;
    statusFilter: string;
    onPageChange: (page: number) => void;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onSelectTrip: (trip: TripListItem) => void;
    onNewTrip?: () => void;
};

export function TripsTable({
    trips,
    total,
    page,
    limit,
    isLoading,
    search,
    statusFilter,
    onPageChange,
    onSearchChange,
    onStatusChange,
    onSelectTrip,
    onNewTrip,
}: TripsTableProps) {
    const columns: DataTableColumn<TripListItem>[] = useMemo(
        () => [
            {
                key: "trip_number",
                header: "Trip",
                render: (row) => <span className="font-medium">{row.trip_number}</span>,
            },
            {
                key: "route",
                header: "Route",
                render: (row) => `${row.source} → ${row.destination}`,
            },
            {
                key: "vehicle",
                header: "Vehicle",
                render: (row) => row.vehicle.name,
            },
            {
                key: "driver",
                header: "Driver",
                render: (row) => row.driver.name,
            },
            {
                key: "cargo",
                header: "Cargo",
                render: (row) => `${numberFormat.format(row.cargo_weight_kg)} kg`,
            },
            {
                key: "distance",
                header: "Distance",
                render: (row) => `${numberFormat.format(row.planned_distance_km)} km`,
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
        ],
        [],
    );

    return (
        <>
            <ResourceListPage
                title="All Trips"
                columns={columns}
                items={trips}
                total={total}
                page={page}
                limit={limit}
                onPageChange={onPageChange}
                getRowKey={(row) => row.id}
                isLoading={isLoading}
                onRowClick={onSelectTrip}
                emptyMessage="No trips found."
                searchPlaceholder="Search trip, source, destination…"
                searchValue={search}
                onSearchChange={onSearchChange}
                filters={
                    <FilterDropdown
                        label="Status: All"
                        value={statusFilter}
                        options={statusFilterOptions}
                        onChange={onStatusChange}
                        selectedLabel={`Status: ${statusFilterOptions.find((o) => o.value === statusFilter)?.label ?? "All"}`}
                        triggerClassName="w-[160px]"
                    />
                }
                primaryAction={onNewTrip ? { label: "New Trip", onClick: onNewTrip } : undefined}
                hideHeader
            />
            <p className="px-8 pb-6 text-xs text-gray-500">
                Rule: A vehicle or driver can be on at most one Dispatched trip at a time
            </p>
        </>
    );
}
