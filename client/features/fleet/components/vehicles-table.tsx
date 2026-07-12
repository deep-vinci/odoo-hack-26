"use client";

import { useMemo, useState } from "react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Pill, type PillVariant } from "@/components/ui/pill";

type VehicleType = "van" | "truck" | "mini";
type VehicleStatus = "available" | "on-trip" | "in-shop" | "retired";

type Vehicle = {
    id: string;
    regNo: string;
    name: string;
    type: VehicleType;
    capacity: string;
    odometer: number;
    acqCost: number;
    status: VehicleStatus;
};

const typeLabel: Record<VehicleType, string> = {
    van: "Van",
    truck: "Truck",
    mini: "Mini",
};

const statusLabel: Record<VehicleStatus, string> = {
    available: "Available",
    "on-trip": "On Trip",
    "in-shop": "In Shop",
    retired: "Retired",
};

const statusVariant: Record<VehicleStatus, PillVariant> = {
    available: "available",
    "on-trip": "info",
    "in-shop": "pending",
    retired: "danger",
};

const vehicles: Vehicle[] = [
    { id: "1", regNo: "GJ01AB4521", name: "VAN-05", type: "van", capacity: "500 kg", odometer: 74_000, acqCost: 620_000, status: "available" },
    { id: "2", regNo: "GJ01AB9981", name: "TRUCK-11", type: "truck", capacity: "5 Ton", odometer: 182_000, acqCost: 2_450_000, status: "on-trip" },
    { id: "3", regNo: "GJ01AB1120", name: "MINI-03", type: "mini", capacity: "1 Ton", odometer: 66_000, acqCost: 410_000, status: "in-shop" },
    { id: "4", regNo: "GJ01AB0081", name: "VAN-09", type: "van", capacity: "750 kg", odometer: 241_900, acqCost: 590_000, status: "retired" },
];

const typeFilterOptions = [
    { value: "", label: "All" },
    { value: "van", label: "Van" },
    { value: "truck", label: "Truck" },
    { value: "mini", label: "Mini" },
];

const statusFilterOptions = [
    { value: "", label: "All" },
    { value: "available", label: "Available" },
    { value: "on-trip", label: "On Trip" },
    { value: "in-shop", label: "In Shop" },
    { value: "retired", label: "Retired" },
];

const columns: DataTableColumn<Vehicle>[] = [
    {
        key: "regNo",
        header: "Reg. No. (Unique)",
        render: (row) => <span className="font-medium">{row.regNo}</span>,
    },
    { key: "name", header: "Name/Model", render: (row) => row.name },
    { key: "type", header: "Type", render: (row) => typeLabel[row.type] },
    { key: "capacity", header: "Capacity", render: (row) => row.capacity },
    {
        key: "odometer",
        header: "Odometer",
        render: (row) => row.odometer.toLocaleString("en-IN"),
    },
    {
        key: "acqCost",
        header: "Acq. Cost",
        render: (row) => row.acqCost.toLocaleString("en-IN"),
    },
    {
        key: "status",
        header: "Status",
        render: (row) => <Pill variant={statusVariant[row.status]}>{statusLabel[row.status]}</Pill>,
    },
];

export function VehiclesTable() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const limit = 10;

    const filteredVehicles = useMemo(() => {
        const query = search.trim().toLowerCase();
        return vehicles.filter((vehicle) => {
            const matchesQuery = !query || vehicle.regNo.toLowerCase().includes(query);
            const matchesType = !typeFilter || vehicle.type === typeFilter;
            const matchesStatus = !statusFilter || vehicle.status === statusFilter;
            return matchesQuery && matchesType && matchesStatus;
        });
    }, [search, typeFilter, statusFilter]);

    return (
        <>
            <ResourceListPage
                title="Vehicle Registry"
                columns={columns}
                items={filteredVehicles}
                total={filteredVehicles.length}
                page={page}
                limit={limit}
                onPageChange={setPage}
                getRowKey={(row) => row.id}
                emptyMessage="No vehicles found."
                searchPlaceholder="Search reg. no…"
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={
                    <>
                        <FilterDropdown
                            label="Type: All"
                            value={typeFilter}
                            options={typeFilterOptions}
                            onChange={(value) => {
                                setTypeFilter(value);
                                setPage(1);
                            }}
                            selectedLabel={`Type: ${typeFilterOptions.find((o) => o.value === typeFilter)?.label ?? "All"}`}
                            triggerClassName="w-[160px]"
                        />
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
                    </>
                }
                primaryAction={{ label: "Add Vehicle", onClick: () => {} }}
                hideHeader
            />
            <p className="px-8 pb-6 text-xs text-gray-500">
                Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
            </p>
        </>
    );
}
