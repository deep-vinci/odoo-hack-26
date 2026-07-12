"use client";

import { useQuery } from "@tanstack/react-query";
import {
    getCostTrend,
    getFuelEfficiencyReport,
    getOperationalCostsReport,
    getUtilizationTrend,
    getVehicleRoiReport,
    type CostTrend,
    type FuelEfficiencyReport,
    type OperationalCostsReport,
    type UtilizationTrend,
    type VehicleRoiReport,
} from "@/features/analytics/api";
import { ApiError } from "@/lib/api-client";

export function useFuelEfficiency() {
    return useQuery<FuelEfficiencyReport, ApiError>({
        queryKey: ["analytics", "fuel-efficiency"],
        queryFn: getFuelEfficiencyReport,
    });
}

export function useOperationalCosts() {
    return useQuery<OperationalCostsReport, ApiError>({
        queryKey: ["analytics", "operational-costs"],
        queryFn: getOperationalCostsReport,
    });
}

export function useVehicleRoi() {
    return useQuery<VehicleRoiReport, ApiError>({
        queryKey: ["analytics", "vehicle-roi"],
        queryFn: getVehicleRoiReport,
    });
}

export function useUtilizationTrend(days = 14) {
    return useQuery<UtilizationTrend, ApiError>({
        queryKey: ["analytics", "utilization-trend", days],
        queryFn: () => getUtilizationTrend(days),
    });
}

export function useCostTrend(months = 6) {
    return useQuery<CostTrend, ApiError>({
        queryKey: ["analytics", "cost-trend", months],
        queryFn: () => getCostTrend(months),
    });
}
