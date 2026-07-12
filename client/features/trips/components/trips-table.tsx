"use client";

import { useMemo, useState } from "react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Pill } from "@/components/ui/pill";
import {
    tripStatusLabel,
    tripStatusVariant,
    type DispatchDriver,
    type DispatchVehicle,
    type Trip,
} from "@/features/trips/types";

const statusFilterOptions = [
    { value: "", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "dispatched", label: "Dispatched" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

type TripsTableProps = {
    trips: Trip[];
    vehicles: DispatchVehicle[];
    drivers: DispatchDriver[];
    onDispatchTrip: () => void;
    onSelectTrip: (trip: Trip) => void;
};

export function TripsTable({ trips, vehicles, drivers, onDispatchTrip, onSelectTrip }: TripsTableProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const limit = 10;

    const nameLookup = useMemo(() => {
        const vehicleById = new Map(vehicles.map((v) => [v.id, v.name]));
        const driverById = new Map(drivers.map((d) => [d.id, d.name]));
        return { vehicleById, driverById };
    }, [vehicles, drivers]);

    const columns: DataTableColumn<Trip>[] = useMemo(
        () => [
            { key: "id", header: "Trip", render: (row) => <span className="font-medium">{row.id}</span> },
            {
                key: "route",
                header: "Route",
                render: (row) => `${row.source} → ${row.destination}`,
            },
            {
                key: "vehicle",
                header: "Vehicle",
                render: (row) => (row.vehicleId ? nameLookup.vehicleById.get(row.vehicleId) ?? "—" : "—"),
            },
            {
                key: "driver",
                header: "Driver",
                render: (row) => (row.driverId ? nameLookup.driverById.get(row.driverId) ?? "—" : "—"),
            },
            {
                key: "cargo",
                header: "Cargo",
                render: (row) => (row.cargoWeightKg ? `${row.cargoWeightKg.toLocaleString("en-IN")} kg` : "—"),
            },
            {
                key: "distance",
                header: "Distance",
                render: (row) => (row.plannedDistanceKm ? `${row.plannedDistanceKm.toLocaleString("en-IN")} km` : "—"),
            },
            {
                key: "status",
                header: "Status",
                render: (row) => <Pill variant={tripStatusVariant[row.status]}>{tripStatusLabel[row.status]}</Pill>,
            },
        ],
        [nameLookup],
    );

    const filteredTrips = useMemo(() => {
        const query = search.trim().toLowerCase();
        return trips.filter((trip) => {
            const matchesQuery =
                !query ||
                [trip.id, trip.source, trip.destination]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            const matchesStatus = !statusFilter || trip.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
    }, [trips, search, statusFilter]);

    return (
        <>
            <ResourceListPage
                title="All Trips"
                columns={columns}
                items={filteredTrips}
                total={filteredTrips.length}
                page={page}
                limit={limit}
                onPageChange={setPage}
                getRowKey={(row) => row.id}
                onRowClick={onSelectTrip}
                emptyMessage="No trips found."
                searchPlaceholder="Search trip, source, destination…"
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
                primaryAction={{ label: "Dispatch Trip", onClick: onDispatchTrip }}
                hideHeader
            />
            <p className="px-8 pb-6 text-xs text-gray-500">
                Rule: A vehicle or driver can be on at most one Dispatched trip at a time
            </p>
        </>
    );
}
