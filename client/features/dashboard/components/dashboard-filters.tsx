"use client";

import { useState } from "react";
import { FilterDropdown } from "@/components/ui/filter-dropdown";

const vehicleTypeOptions = [
    { value: "", label: "All" },
    { value: "van", label: "Van" },
    { value: "truck", label: "Truck" },
    { value: "mini", label: "Mini" },
];

const statusOptions = [
    { value: "", label: "All" },
    { value: "active", label: "Active" },
    { value: "on-trip", label: "On Trip" },
    { value: "in-shop", label: "In Shop" },
    { value: "retired", label: "Retired" },
];

const regionOptions = [
    { value: "", label: "All" },
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
];

export function DashboardFilters() {
    const [vehicleType, setVehicleType] = useState("");
    const [status, setStatus] = useState("");
    const [region, setRegion] = useState("");

    return (
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-3">
            <FilterDropdown
                label="Vehicle Type: All"
                value={vehicleType}
                options={vehicleTypeOptions}
                onChange={setVehicleType}
                selectedLabel={`Vehicle Type: ${vehicleTypeOptions.find((o) => o.value === vehicleType)?.label ?? "All"}`}
            />
            <FilterDropdown
                label="Status: All"
                value={status}
                options={statusOptions}
                onChange={setStatus}
                selectedLabel={`Status: ${statusOptions.find((o) => o.value === status)?.label ?? "All"}`}
            />
            <FilterDropdown
                label="Region: All"
                value={region}
                options={regionOptions}
                onChange={setRegion}
                selectedLabel={`Region: ${regionOptions.find((o) => o.value === region)?.label ?? "All"}`}
                align="end"
            />
        </div>
    );
}
