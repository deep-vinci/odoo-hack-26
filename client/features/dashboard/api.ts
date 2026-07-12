import { apiFetch } from "@/lib/api-client";

export type DashboardKpis = {
    active_vehicles: number;
    available_vehicles: number;
    vehicles_in_maintenance: number;
    vehicles_on_trip: number;
    retired_vehicles: number;
    active_trips: number;
    pending_trips: number;
    drivers_on_duty: number;
    drivers_on_trip: number;
    fleet_utilization_pct: number;
};

export type DashboardAlerts = {
    expired_licenses: number;
    licenses_expiring_30_days: number;
    open_maintenance: number;
};

export type Dashboard = {
    kpis: DashboardKpis;
    alerts: DashboardAlerts;
    filters_applied: {
        vehicle_type: string | null;
        vehicle_status: string | null;
        region: string | null;
    };
};

export type DashboardFilterParams = {
    vehicle_type?: string;
    vehicle_status?: string;
    region?: string;
    from_date?: string;
    to_date?: string;
};

export function getDashboard(params: DashboardFilterParams) {
    const query = new URLSearchParams();
    if (params.vehicle_type) query.set("vehicle_type", params.vehicle_type);
    if (params.vehicle_status) query.set("vehicle_status", params.vehicle_status);
    if (params.region) query.set("region", params.region);
    if (params.from_date) query.set("from_date", params.from_date);
    if (params.to_date) query.set("to_date", params.to_date);
    const qs = query.toString();
    return apiFetch<Dashboard>(`/api/v1/dashboard${qs ? `?${qs}` : ""}`);
}
