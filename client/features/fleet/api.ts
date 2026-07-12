import { apiFetch } from "@/lib/api-client";

export const VEHICLE_TYPES = [
    "truck",
    "van",
    "mini_truck",
    "trailer",
    "other",
] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const VEHICLE_STATUSES = [
    "available",
    "on_trip",
    "in_shop",
    "retired",
] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export type Vehicle = {
    id: string;
    registration_number: string;
    name: string;
    type: VehicleType;
    max_load_capacity_kg: number;
    odometer_km: number;
    acquisition_cost: number;
    region: string | null;
    status: VehicleStatus;
    created_at: string;
    updated_at: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type VehicleListResult = {
    vehicles: Vehicle[];
    pagination: Pagination;
};

export type VehicleListParams = {
    status?: VehicleStatus | "";
    type?: VehicleType | "";
    region?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

export function listVehicles(params: VehicleListParams) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.type) query.set("type", params.type);
    if (params.region) query.set("region", params.region);
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.sort_order) query.set("sort_order", params.sort_order);
    const qs = query.toString();
    return apiFetch<VehicleListResult>(`/api/v1/vehicles${qs ? `?${qs}` : ""}`);
}

export type VehicleDetail = {
    vehicle: Vehicle;
    active_trip: {
        id: string;
        trip_number: string;
        source: string;
        destination: string;
        status: string;
        dispatched_at: string | null;
    } | null;
    open_maintenance: {
        id: string;
        title: string;
        opened_at: string;
    } | null;
    stats: {
        total_trips: number;
        total_fuel_cost: number;
        total_maintenance_cost: number;
        operational_cost: number;
    };
};

export function getVehicle(id: string) {
    return apiFetch<VehicleDetail>(`/api/v1/vehicles/${id}`);
}

export type CreateVehicleInput = {
    registration_number: string;
    name: string;
    type: VehicleType;
    max_load_capacity_kg: number;
    odometer_km: number;
    acquisition_cost: number;
    region: string | null;
};

export function createVehicle(input: CreateVehicleInput) {
    return apiFetch<{ vehicle: Vehicle }>("/api/v1/vehicles", {
        method: "POST",
        body: input,
    });
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export function updateVehicle(id: string, input: UpdateVehicleInput) {
    return apiFetch<{ vehicle: Vehicle }>(`/api/v1/vehicles/${id}`, {
        method: "PATCH",
        body: input,
    });
}

export function changeVehicleStatus(id: string, status: VehicleStatus) {
    return apiFetch<{ vehicle: Vehicle }>(`/api/v1/vehicles/${id}/status`, {
        method: "PATCH",
        body: { status },
    });
}

export function deleteVehicle(id: string) {
    return apiFetch<{ message: string }>(`/api/v1/vehicles/${id}`, {
        method: "DELETE",
    });
}
