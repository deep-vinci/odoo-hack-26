"use client";

import { FilterDropdown } from "@/components/ui/filter-dropdown";

const vehicleTypeOptions = [
    { value: "", label: "All" },
    { value: "truck", label: "Truck" },
    { value: "van", label: "Van" },
    { value: "mini_truck", label: "Mini Truck" },
    { value: "trailer", label: "Trailer" },
    { value: "other", label: "Other" },
];

const statusOptions = [
    { value: "", label: "All" },
    { value: "available", label: "Available" },
    { value: "on_trip", label: "On Trip" },
    { value: "in_shop", label: "In Shop" },
    { value: "retired", label: "Retired" },
];

const regionOptions = [
    { value: "", label: "All" },
    { value: "North", label: "North" },
    { value: "South", label: "South" },
    { value: "East", label: "East" },
    { value: "West", label: "West" },
];

type DashboardFiltersProps = {
    vehicleType: string;
    status: string;
    region: string;
    onVehicleTypeChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onRegionChange: (value: string) => void;
};

export function DashboardFilters({
    vehicleType,
    status,
    region,
    onVehicleTypeChange,
    onStatusChange,
    onRegionChange,
}: DashboardFiltersProps) {
    return (
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-3">
            <FilterDropdown
                label="Vehicle Type: All"
                value={vehicleType}
                options={vehicleTypeOptions}
                onChange={onVehicleTypeChange}
                selectedLabel={`Vehicle Type: ${vehicleTypeOptions.find((o) => o.value === vehicleType)?.label ?? "All"}`}
            />
            <FilterDropdown
                label="Status: All"
                value={status}
                options={statusOptions}
                onChange={onStatusChange}
                selectedLabel={`Status: ${statusOptions.find((o) => o.value === status)?.label ?? "All"}`}
            />
            <FilterDropdown
                label="Region: All"
                value={region}
                options={regionOptions}
                onChange={onRegionChange}
                selectedLabel={`Region: ${regionOptions.find((o) => o.value === region)?.label ?? "All"}`}
                align="end"
            />
        </div>
    );
}
