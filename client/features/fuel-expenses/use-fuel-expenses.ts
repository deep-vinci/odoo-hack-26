"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { listVehicles, type VehicleListResult } from "@/features/fleet/api";
import { listTrips, type TripListResult } from "@/features/trips/api";
import { listMaintenance } from "@/features/maintenance/api";
import {
    createExpense,
    createFuelLog,
    deleteExpense,
    deleteFuelLog,
    listExpenses,
    listFuelLogs,
    type CreateExpenseInput,
    type CreateFuelLogInput,
    type Expense,
    type ExpenseListParams,
    type ExpenseListResult,
    type FuelLog,
    type FuelLogListParams,
    type FuelLogListResult,
} from "@/features/fuel-expenses/api";

function currentMonthStart(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
}

const fuelLogsKey = (params: FuelLogListParams) => ["fuel-logs", params] as const;
const expensesKey = (params: ExpenseListParams) => ["expenses", params] as const;

export function useFuelLogList(params: FuelLogListParams) {
    return useQuery<FuelLogListResult, ApiError>({
        queryKey: fuelLogsKey(params),
        queryFn: () => listFuelLogs(params),
        placeholderData: (previous) => previous,
    });
}

export function useExpenseList(params: ExpenseListParams) {
    return useQuery<ExpenseListResult, ApiError>({
        queryKey: expensesKey(params),
        queryFn: () => listExpenses(params),
        placeholderData: (previous) => previous,
    });
}

export function useOperationalCostSummary() {
    const monthStart = useMemo(() => currentMonthStart(), []);

    const fuelQuery = useQuery<FuelLogListResult, ApiError>({
        queryKey: ["fuel-logs", "summary", monthStart] as const,
        queryFn: () => listFuelLogs({ from_date: monthStart, limit: 1 }),
    });
    const expenseQuery = useQuery<ExpenseListResult, ApiError>({
        queryKey: ["expenses", "summary", monthStart] as const,
        queryFn: () => listExpenses({ from_date: monthStart, limit: 1 }),
    });
    const maintenanceQuery = useQuery({
        queryKey: ["maintenance", "summary", monthStart] as const,
        queryFn: () => listMaintenance({ limit: 1 }),
    });

    const fuelCost = fuelQuery.data?.summary.total_cost ?? 0;
    const expenseCost = expenseQuery.data?.summary.total_amount ?? 0;
    const maintenanceCost = maintenanceQuery.data?.summary.total_cost_this_month ?? 0;

    return {
        fuelCost,
        expenseCost,
        maintenanceCost,
        totalOperationalCost: fuelCost + expenseCost + maintenanceCost,
        isLoading:
            fuelQuery.isLoading || expenseQuery.isLoading || maintenanceQuery.isLoading,
    };
}

export function useAllVehicles() {
    return useQuery<VehicleListResult, ApiError>({
        queryKey: ["vehicles", { scope: "all", limit: 100 }] as const,
        queryFn: () =>
            listVehicles({ limit: 100, sort_by: "name", sort_order: "asc" }),
    });
}

export function useVehicleTrips(vehicleId: string) {
    return useQuery<TripListResult, ApiError>({
        queryKey: ["trips", { vehicle_id: vehicleId, scope: "fuel-expense" }] as const,
        queryFn: () =>
            listTrips({
                vehicle_id: vehicleId,
                limit: 100,
                sort_by: "created_at",
                sort_order: "desc",
            }),
        enabled: vehicleId.length > 0,
    });
}

function useInvalidateFuel() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["fuel-logs"] });
    };
}

function useInvalidateExpenses() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
    };
}

export function useCreateFuelLog() {
    const invalidate = useInvalidateFuel();
    return useMutation<{ fuel_log: FuelLog }, ApiError, CreateFuelLogInput>({
        mutationFn: createFuelLog,
        onSuccess: invalidate,
    });
}

export function useDeleteFuelLog() {
    const invalidate = useInvalidateFuel();
    return useMutation<{ message: string }, ApiError, string>({
        mutationFn: deleteFuelLog,
        onSuccess: invalidate,
    });
}

export function useCreateExpense() {
    const invalidate = useInvalidateExpenses();
    return useMutation<{ expense: Expense }, ApiError, CreateExpenseInput>({
        mutationFn: createExpense,
        onSuccess: invalidate,
    });
}

export function useDeleteExpense() {
    const invalidate = useInvalidateExpenses();
    return useMutation<{ message: string }, ApiError, string>({
        mutationFn: deleteExpense,
        onSuccess: invalidate,
    });
}
