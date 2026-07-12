import { apiFetch } from "@/lib/api-client";

export type ReportPeriod = {
    from: string | null;
    to: string | null;
};

export type FuelEfficiencyRow = {
    vehicle: { id: string; registration_number: string; name: string; type: string };
    total_distance_km: number;
    total_fuel_liters: number;
    fuel_efficiency_km_per_liter: number | null;
    total_fuel_cost: number;
    completed_trips: number;
};

export type FuelEfficiencyReport = {
    period: ReportPeriod;
    vehicles: FuelEfficiencyRow[];
    fleet_average_km_per_liter: number | null;
};

export type OperationalCostRow = {
    vehicle: { id: string; registration_number: string; name: string };
    fuel_cost: number;
    maintenance_cost: number;
    operational_cost: number;
    other_expenses: number;
};

export type OperationalCostsReport = {
    period: ReportPeriod;
    vehicles: OperationalCostRow[];
    totals: {
        fuel_cost: number;
        maintenance_cost: number;
        operational_cost: number;
        other_expenses: number;
    };
};

export type VehicleRoiRow = {
    vehicle: {
        id: string;
        registration_number: string;
        name: string;
        acquisition_cost: number;
    };
    total_revenue: number;
    fuel_cost: number;
    maintenance_cost: number;
    operational_cost: number;
    net_return: number;
    roi: number | null;
    roi_pct: number | null;
};

export type VehicleRoiReport = {
    period: ReportPeriod;
    vehicles: VehicleRoiRow[];
};

export type UtilizationTrend = {
    series: {
        date: string;
        vehicles_utilized: number;
        fleet_size: number;
        utilization_pct: number;
    }[];
};

export type CostTrend = {
    series: { month: string; fuel_cost: number; maintenance_cost: number }[];
};

export function getFuelEfficiencyReport() {
    return apiFetch<FuelEfficiencyReport>("/api/v1/reports/fuel-efficiency");
}

export function getOperationalCostsReport() {
    return apiFetch<OperationalCostsReport>("/api/v1/reports/operational-costs");
}

export function getVehicleRoiReport() {
    return apiFetch<VehicleRoiReport>("/api/v1/reports/vehicle-roi");
}

export function getUtilizationTrend(days = 14) {
    return apiFetch<UtilizationTrend>(
        `/api/v1/reports/utilization-trend?days=${days}`,
    );
}

export function getCostTrend(months = 6) {
    return apiFetch<CostTrend>(`/api/v1/reports/cost-trend?months=${months}`);
}
