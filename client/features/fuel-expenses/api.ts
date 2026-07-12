import { apiFetch } from "@/lib/api-client";
import type { Pagination } from "@/features/fleet/api";

export const EXPENSE_TYPES = ["toll", "parking", "fine", "misc"] as const;
export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export type FuelExpenseVehicleRef = {
    id: string;
    registration_number: string;
    name: string;
};

export type FuelExpenseTripRef = {
    id: string;
    trip_number: string;
};

export type FuelLog = {
    id: string;
    vehicle: FuelExpenseVehicleRef;
    trip: FuelExpenseTripRef | null;
    liters: number;
    cost: number;
    cost_per_liter: number;
    filled_at: string;
    odometer_km: number | null;
    created_by: string;
    created_at: string;
};

export type FuelSummary = {
    total_liters: number;
    total_cost: number;
};

export type FuelLogListResult = {
    fuel_logs: FuelLog[];
    pagination: Pagination;
    summary: FuelSummary;
};

export type FuelLogListParams = {
    vehicle_id?: string;
    trip_id?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

export function listFuelLogs(params: FuelLogListParams = {}) {
    const query = new URLSearchParams();
    if (params.vehicle_id) query.set("vehicle_id", params.vehicle_id);
    if (params.trip_id) query.set("trip_id", params.trip_id);
    if (params.from_date) query.set("from_date", params.from_date);
    if (params.to_date) query.set("to_date", params.to_date);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.sort_order) query.set("sort_order", params.sort_order);
    const qs = query.toString();
    return apiFetch<FuelLogListResult>(`/api/v1/fuel-logs${qs ? `?${qs}` : ""}`);
}

export type CreateFuelLogInput = {
    vehicle_id: string;
    trip_id: string | null;
    liters: number;
    cost: number;
    filled_at: string | null;
    odometer_km: number | null;
};

export function createFuelLog(input: CreateFuelLogInput) {
    return apiFetch<{ fuel_log: FuelLog }>("/api/v1/fuel-logs", {
        method: "POST",
        body: input,
    });
}

export function deleteFuelLog(id: string) {
    return apiFetch<{ message: string }>(`/api/v1/fuel-logs/${id}`, {
        method: "DELETE",
    });
}

export type Expense = {
    id: string;
    vehicle: FuelExpenseVehicleRef;
    trip: FuelExpenseTripRef | null;
    type: ExpenseType;
    amount: number;
    note: string | null;
    incurred_at: string;
    created_by: string;
    created_at: string;
};

export type ExpenseSummary = {
    total_amount: number;
    by_type: Record<ExpenseType, number>;
};

export type ExpenseListResult = {
    expenses: Expense[];
    pagination: Pagination;
    summary: ExpenseSummary;
};

export type ExpenseListParams = {
    vehicle_id?: string;
    trip_id?: string;
    type?: ExpenseType | "";
    from_date?: string;
    to_date?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

export function listExpenses(params: ExpenseListParams = {}) {
    const query = new URLSearchParams();
    if (params.vehicle_id) query.set("vehicle_id", params.vehicle_id);
    if (params.trip_id) query.set("trip_id", params.trip_id);
    if (params.type) query.set("type", params.type);
    if (params.from_date) query.set("from_date", params.from_date);
    if (params.to_date) query.set("to_date", params.to_date);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.sort_order) query.set("sort_order", params.sort_order);
    const qs = query.toString();
    return apiFetch<ExpenseListResult>(`/api/v1/expenses${qs ? `?${qs}` : ""}`);
}

export type CreateExpenseInput = {
    vehicle_id: string;
    trip_id: string | null;
    type: ExpenseType;
    amount: number;
    note: string | null;
    incurred_at: string | null;
};

export function createExpense(input: CreateExpenseInput) {
    return apiFetch<{ expense: Expense }>("/api/v1/expenses", {
        method: "POST",
        body: input,
    });
}

export function deleteExpense(id: string) {
    return apiFetch<{ message: string }>(`/api/v1/expenses/${id}`, {
        method: "DELETE",
    });
}
