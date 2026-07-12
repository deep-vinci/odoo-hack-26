import { apiFetch } from "@/lib/api-client";

export const DRIVER_STATUSES = [
    "available",
    "on_trip",
    "off_duty",
    "suspended",
] as const;
export type DriverStatus = (typeof DRIVER_STATUSES)[number];

export type Driver = {
    id: string;
    name: string;
    license_number: string;
    license_category: string;
    license_expiry_date: string;
    contact_number: string;
    safety_score: number;
    status: DriverStatus;
    license_expired: boolean;
    created_at: string;
    updated_at: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type DriverListResult = {
    drivers: Driver[];
    pagination: Pagination;
};

export type DriverListParams = {
    status?: DriverStatus | "";
    search?: string;
    available_for_dispatch?: boolean;
    license_expiring_within_days?: number;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

export function listDrivers(params: DriverListParams) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    if (params.available_for_dispatch) query.set("available_for_dispatch", "true");
    if (params.license_expiring_within_days !== undefined)
        query.set(
            "license_expiring_within_days",
            String(params.license_expiring_within_days),
        );
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.sort_order) query.set("sort_order", params.sort_order);
    const qs = query.toString();
    return apiFetch<DriverListResult>(`/api/v1/drivers${qs ? `?${qs}` : ""}`);
}

export type ActiveTrip = {
    id: string;
    trip_number: string;
    source: string;
    destination: string;
    dispatched_at: string;
};

export type DriverStats = {
    total_trips: number;
    completed_trips: number;
    cancelled_trips: number;
};

export type DriverDetail = {
    driver: Driver;
    active_trip: ActiveTrip | null;
    stats: DriverStats;
};

export function getDriver(id: string) {
    return apiFetch<DriverDetail>(`/api/v1/drivers/${id}`);
}

export type CreateDriverInput = {
    name: string;
    license_number: string;
    license_category: string;
    license_expiry_date: string;
    contact_number: string;
    safety_score?: number;
};

export function createDriver(input: CreateDriverInput) {
    return apiFetch<{ driver: Driver }>("/api/v1/drivers", {
        method: "POST",
        body: input,
    });
}

export type UpdateDriverInput = {
    name?: string;
    license_number?: string;
    license_category?: string;
    license_expiry_date?: string;
    contact_number?: string;
};

export function updateDriver(id: string, input: UpdateDriverInput) {
    return apiFetch<{ driver: Driver }>(`/api/v1/drivers/${id}`, {
        method: "PATCH",
        body: input,
    });
}

export function changeDriverStatus(id: string, status: DriverStatus) {
    return apiFetch<{ driver: Driver }>(`/api/v1/drivers/${id}/status`, {
        method: "PATCH",
        body: { status },
    });
}

export function updateDriverSafetyScore(id: string, safety_score: number) {
    return apiFetch<{ driver: Driver }>(`/api/v1/drivers/${id}/safety-score`, {
        method: "PATCH",
        body: { safety_score },
    });
}

export type ExpiringLicenseRow = {
    id: string;
    name: string;
    license_number: string;
    license_expiry_date: string;
    license_expired: boolean;
    days_until_expiry: number;
    contact_number: string;
    status: DriverStatus;
};

export type ExpiringLicensesResult = {
    drivers: ExpiringLicenseRow[];
    summary: {
        expired: number;
        expiring_soon: number;
    };
};

export function listExpiringLicenses(days?: number) {
    const qs = days !== undefined ? `?days=${days}` : "";
    return apiFetch<ExpiringLicensesResult>(
        `/api/v1/drivers/expiring-licenses${qs}`,
    );
}
