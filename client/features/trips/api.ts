import type { PillVariant } from "@/components/ui/pill";
import { apiFetch } from "@/lib/api-client";

export const TRIP_STATUSES = [
    "draft",
    "dispatched",
    "completed",
    "cancelled",
] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

export const tripStatusLabel: Record<TripStatus, string> = {
    draft: "Draft",
    dispatched: "Dispatched",
    completed: "Completed",
    cancelled: "Cancelled",
};

export const tripStatusVariant: Record<TripStatus, PillVariant> = {
    draft: "draft",
    dispatched: "brand-accent",
    completed: "completed",
    cancelled: "danger",
};

export type TripVehicleRef = {
    id: string;
    registration_number: string;
    name: string;
};

export type TripDriverRef = {
    id: string;
    name: string;
};

export type TripListItem = {
    id: string;
    trip_number: string;
    source: string;
    destination: string;
    vehicle: TripVehicleRef;
    driver: TripDriverRef;
    cargo_weight_kg: number;
    planned_distance_km: number;
    revenue: number | null;
    status: TripStatus;
    dispatched_at: string | null;
    created_at: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type TripListResult = {
    trips: TripListItem[];
    pagination: Pagination;
};

export type TripListParams = {
    status?: TripStatus | "";
    vehicle_id?: string;
    driver_id?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

export function listTrips(params: TripListParams) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.vehicle_id) query.set("vehicle_id", params.vehicle_id);
    if (params.driver_id) query.set("driver_id", params.driver_id);
    if (params.search) query.set("search", params.search);
    if (params.from_date) query.set("from_date", params.from_date);
    if (params.to_date) query.set("to_date", params.to_date);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.sort_order) query.set("sort_order", params.sort_order);
    const qs = query.toString();
    return apiFetch<TripListResult>(`/api/v1/trips${qs ? `?${qs}` : ""}`);
}

export type TripRecordVehicle = TripVehicleRef & {
    max_load_capacity_kg: number;
};

export type TripRecordDriver = TripDriverRef & {
    license_expiry_date: string;
};

export type TripRecord = {
    id: string;
    trip_number: string;
    source: string;
    destination: string;
    vehicle: TripRecordVehicle;
    driver: TripRecordDriver;
    cargo_weight_kg: number;
    planned_distance_km: number;
    revenue: number | null;
    status: TripStatus;
    start_odometer_km: number | null;
    end_odometer_km: number | null;
    dispatched_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    created_by: string;
    created_at: string;
};

export type TripFuelLog = {
    id: string;
    liters: number;
    cost: number;
    filled_at: string;
};

export type TripExpense = {
    id: string;
    type: string;
    amount: number;
    incurred_at: string;
};

export type TripDetail = {
    trip: TripRecord;
    actual_distance_km: number | null;
    fuel_logs: TripFuelLog[];
    expenses: TripExpense[];
};

export function getTrip(id: string) {
    return apiFetch<TripDetail>(`/api/v1/trips/${id}`);
}

export type CreateTripInput = {
    source: string;
    destination: string;
    vehicle_id: string;
    driver_id: string;
    cargo_weight_kg: number;
    planned_distance_km: number;
    revenue?: number;
};

export function createTrip(input: CreateTripInput) {
    return apiFetch<{ trip: TripRecord }>("/api/v1/trips", {
        method: "POST",
        body: input,
    });
}

export type DispatchTripInput = {
    start_odometer_km?: number;
};

export type DispatchTripResult = {
    trip: {
        id: string;
        trip_number: string;
        status: TripStatus;
        start_odometer_km: number;
        dispatched_at: string;
    };
    vehicle_status: string;
    driver_status: string;
};

export function dispatchTrip(id: string, input: DispatchTripInput) {
    return apiFetch<DispatchTripResult>(`/api/v1/trips/${id}/dispatch`, {
        method: "POST",
        body: input,
    });
}

export type CompleteTripInput = {
    end_odometer_km: number;
    fuel_consumed?: { liters: number; cost: number };
    revenue?: number;
};

export type CompleteTripResult = {
    trip: {
        id: string;
        trip_number: string;
        status: TripStatus;
        start_odometer_km: number;
        end_odometer_km: number;
        actual_distance_km: number;
        completed_at: string;
    };
    vehicle_status: string;
    driver_status: string;
    fuel_log_created: boolean;
};

export function completeTrip(id: string, input: CompleteTripInput) {
    return apiFetch<CompleteTripResult>(`/api/v1/trips/${id}/complete`, {
        method: "POST",
        body: input,
    });
}

export type CancelTripInput = {
    reason?: string;
};

export type CancelTripResult = {
    trip: {
        id: string;
        trip_number: string;
        status: TripStatus;
        cancelled_at: string;
    };
    vehicle_status: string;
    driver_status: string;
};

export function cancelTrip(id: string, input: CancelTripInput = {}) {
    return apiFetch<CancelTripResult>(`/api/v1/trips/${id}/cancel`, {
        method: "POST",
        body: input,
    });
}
