import { apiFetch } from "@/lib/api-client";
import type { Pagination, VehicleStatus } from "@/features/fleet/api";

export const MAINTENANCE_STATUSES = ["open", "closed"] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export type MaintenanceRecord = {
    id: string;
    vehicle: {
        id: string;
        registration_number: string;
        name: string;
    };
    title: string;
    description: string | null;
    cost: number;
    status: MaintenanceStatus;
    opened_at: string;
    closed_at: string | null;
    created_by: string;
    created_at: string;
};

export type MaintenanceSummary = {
    open_count: number;
    total_cost_this_month: number;
};

export type MaintenanceListResult = {
    maintenance_records: MaintenanceRecord[];
    pagination: Pagination;
    summary: MaintenanceSummary;
};

export type MaintenanceListParams = {
    status?: MaintenanceStatus | "";
    vehicle_id?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

export function listMaintenance(params: MaintenanceListParams) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.vehicle_id) query.set("vehicle_id", params.vehicle_id);
    if (params.search) query.set("search", params.search);
    if (params.from_date) query.set("from_date", params.from_date);
    if (params.to_date) query.set("to_date", params.to_date);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.sort_order) query.set("sort_order", params.sort_order);
    const qs = query.toString();
    return apiFetch<MaintenanceListResult>(`/api/v1/maintenance${qs ? `?${qs}` : ""}`);
}

export type MaintenanceWithVehicleStatus = {
    maintenance: MaintenanceRecord;
    vehicle_status: VehicleStatus;
};

export type CreateMaintenanceInput = {
    vehicle_id: string;
    title: string;
    description: string | null;
    cost: number;
};

export function createMaintenance(input: CreateMaintenanceInput) {
    return apiFetch<MaintenanceWithVehicleStatus>("/api/v1/maintenance", {
        method: "POST",
        body: input,
    });
}

export type UpdateMaintenanceInput = {
    title?: string;
    description?: string | null;
    cost?: number;
};

export function updateMaintenance(id: string, input: UpdateMaintenanceInput) {
    return apiFetch<{ maintenance: MaintenanceRecord }>(`/api/v1/maintenance/${id}`, {
        method: "PATCH",
        body: input,
    });
}

export type CloseMaintenanceInput = {
    cost?: number;
};

export function closeMaintenance(id: string, input: CloseMaintenanceInput) {
    return apiFetch<MaintenanceWithVehicleStatus>(`/api/v1/maintenance/${id}/close`, {
        method: "POST",
        body: input,
    });
}
