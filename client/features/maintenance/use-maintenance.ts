"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { listVehicles, type VehicleListResult } from "@/features/fleet/api";
import {
    closeMaintenance,
    createMaintenance,
    listMaintenance,
    updateMaintenance,
    type CloseMaintenanceInput,
    type CreateMaintenanceInput,
    type MaintenanceListParams,
    type MaintenanceListResult,
    type MaintenanceWithVehicleStatus,
    type UpdateMaintenanceInput,
} from "@/features/maintenance/api";

const maintenanceKey = (params: MaintenanceListParams) =>
    ["maintenance", params] as const;

export function useMaintenanceList(params: MaintenanceListParams) {
    return useQuery<MaintenanceListResult, ApiError>({
        queryKey: maintenanceKey(params),
        queryFn: () => listMaintenance(params),
        placeholderData: (previous) => previous,
    });
}

export function useAvailableVehicles() {
    return useQuery<VehicleListResult, ApiError>({
        queryKey: ["vehicles", { status: "available", limit: 100 }] as const,
        queryFn: () => listVehicles({ status: "available", limit: 100, sort_by: "name", sort_order: "asc" }),
    });
}

function useInvalidateMaintenance() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["maintenance"] });
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    };
}

export function useCreateMaintenance() {
    const invalidate = useInvalidateMaintenance();
    return useMutation<MaintenanceWithVehicleStatus, ApiError, CreateMaintenanceInput>({
        mutationFn: createMaintenance,
        onSuccess: invalidate,
    });
}

export function useUpdateMaintenance() {
    const invalidate = useInvalidateMaintenance();
    return useMutation<
        { maintenance: unknown },
        ApiError,
        { id: string; input: UpdateMaintenanceInput }
    >({
        mutationFn: ({ id, input }) => updateMaintenance(id, input),
        onSuccess: invalidate,
    });
}

export function useCloseMaintenance() {
    const invalidate = useInvalidateMaintenance();
    return useMutation<
        MaintenanceWithVehicleStatus,
        ApiError,
        { id: string; input: CloseMaintenanceInput }
    >({
        mutationFn: ({ id, input }) => closeMaintenance(id, input),
        onSuccess: invalidate,
    });
}
