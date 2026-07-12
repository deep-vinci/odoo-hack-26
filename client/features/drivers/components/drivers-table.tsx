"use client";

import { useMemo, useState } from "react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Pill, type PillVariant } from "@/components/ui/pill";

type DriverCategory = "LMV" | "HMV";
type DriverStatus = "available" | "on-trip" | "off-duty" | "suspended";

type Driver = {
    id: string;
    name: string;
    licenseNo: string;
    category: DriverCategory;
    expiry: string;
    expired: boolean;
    contact: string;
    tripCompletion: number;
    status: DriverStatus;
};

const statusLabel: Record<DriverStatus, string> = {
    available: "Available",
    "on-trip": "On Trip",
    "off-duty": "Off Duty",
    suspended: "Suspended",
};

const statusVariant: Record<DriverStatus, PillVariant> = {
    available: "available",
    "on-trip": "info",
    "off-duty": "inactive",
    suspended: "danger",
};

const drivers: Driver[] = [
    { id: "1", name: "Alex", licenseNo: "DL-88213", category: "LMV", expiry: "12/2028", expired: false, contact: "98765xxxxx", tripCompletion: 96, status: "available" },
    { id: "2", name: "John", licenseNo: "DL-44120", category: "HMV", expiry: "03/2025", expired: true, contact: "98220xxxxx", tripCompletion: 81, status: "suspended" },
    { id: "3", name: "Priya", licenseNo: "DL-77031", category: "LMV", expiry: "08/2027", expired: false, contact: "99110xxxxx", tripCompletion: 99, status: "on-trip" },
    { id: "4", name: "Suresh", licenseNo: "DL-90045", category: "HMV", expiry: "01/2027", expired: false, contact: "97440xxxxx", tripCompletion: 88, status: "off-duty" },
];

function safetyForDriver(driver: Driver): DriverStatus {
    return driver.expired || driver.status === "suspended" ? "suspended" : "available";
}

const statusFilterOptions = [
    { value: "", label: "All" },
    { value: "available", label: "Available" },
    { value: "on-trip", label: "On Trip" },
    { value: "off-duty", label: "Off Duty" },
    { value: "suspended", label: "Suspended" },
];

const columns: DataTableColumn<Driver>[] = [
    {
        key: "name",
        header: "Driver",
        render: (row) => <span className="font-medium">{row.name}</span>,
    },
    { key: "licenseNo", header: "License No.", render: (row) => row.licenseNo },
    { key: "category", header: "Category", render: (row) => row.category },
    {
        key: "expiry",
        header: "Expiry",
        render: (row) =>
            row.expired ? (
                <span className="font-medium text-red-600">{row.expiry} Expired</span>
            ) : (
                row.expiry
            ),
    },
    { key: "contact", header: "Contact", render: (row) => row.contact },
    {
        key: "tripCompletion",
        header: "Trip Compl.",
        render: (row) => `${row.tripCompletion}%`,
    },
    {
        key: "safety",
        header: "Safety",
        render: (row) => {
            const safety = safetyForDriver(row);
            return <Pill variant={statusVariant[safety]}>{statusLabel[safety]}</Pill>;
        },
    },
    {
        key: "status",
        header: "Status",
        render: (row) => <Pill variant={statusVariant[row.status]}>{statusLabel[row.status]}</Pill>,
    },
];

export function DriversTable() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const limit = 10;

    const filteredDrivers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return drivers.filter((driver) => {
            const matchesQuery =
                !query ||
                [driver.name, driver.licenseNo, driver.category, driver.contact]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            const matchesStatus = !statusFilter || driver.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
    }, [search, statusFilter]);

    return (
        <>
            <ResourceListPage
                title="Drivers"
                columns={columns}
                items={filteredDrivers}
                total={filteredDrivers.length}
                page={page}
                limit={limit}
                onPageChange={setPage}
                getRowKey={(row) => row.id}
                emptyMessage="No drivers found."
                searchPlaceholder="Search drivers…"
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
                        triggerClassName="w-[180px]"
                    />
                }
                primaryAction={{ label: "Add Driver", onClick: () => {} }}
                hideHeader
            />
            <p className="px-8 pb-6 text-xs text-gray-500">
                Rule: Expired license or Suspended status → blocked from trip assignment
            </p>
        </>
    );
}
