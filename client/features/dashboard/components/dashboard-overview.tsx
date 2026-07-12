"use client";

import { useState } from "react";
import { HorizontalScrollRow } from "@/components/ui/horizontal-scroll-row";
import { KPICard } from "@/components/ui/kpi-card";
import { DashboardFilters } from "@/features/dashboard/components/dashboard-filters";
import { useDashboard } from "@/features/dashboard/use-dashboard";
import type { DashboardKpis } from "@/features/dashboard/api";

type KpiTile = {
    label: string;
    key: keyof DashboardKpis;
    suffix?: string;
    maximumFractionDigits?: number;
};

const kpiTiles: KpiTile[] = [
    { label: "Active Vehicles", key: "active_vehicles" },
    { label: "Available Vehicles", key: "available_vehicles" },
    { label: "Vehicles in Maintenance", key: "vehicles_in_maintenance" },
    { label: "Active Trips", key: "active_trips" },
    { label: "Pending Trips", key: "pending_trips" },
    { label: "Drivers on Duty", key: "drivers_on_duty" },
    { label: "Fleet Utilization", key: "fleet_utilization_pct", suffix: "%", maximumFractionDigits: 1 },
];

export function DashboardOverview() {
    const [vehicleType, setVehicleType] = useState("");
    const [vehicleStatus, setVehicleStatus] = useState("");
    const [region, setRegion] = useState("");

    const { data, isLoading } = useDashboard({
        vehicle_type: vehicleType || undefined,
        vehicle_status: vehicleStatus || undefined,
        region: region || undefined,
    });

    const kpis = data?.kpis;

    return (
        <div className="flex min-w-0 flex-col gap-6 px-4 sm:px-6">
            <DashboardFilters
                vehicleType={vehicleType}
                status={vehicleStatus}
                region={region}
                onVehicleTypeChange={setVehicleType}
                onStatusChange={setVehicleStatus}
                onRegionChange={setRegion}
            />

            <HorizontalScrollRow className="flex min-w-0 gap-4">
                {kpiTiles.map((tile) => (
                    <div key={tile.label} className="min-w-50 flex-1">
                        <KPICard
                            label={tile.label}
                            value={kpis ? kpis[tile.key] : 0}
                            suffix={tile.suffix}
                            maximumFractionDigits={tile.maximumFractionDigits}
                            isLoading={isLoading}
                        />
                    </div>
                ))}
            </HorizontalScrollRow>
        </div>
    );
}
