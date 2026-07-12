"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    changeVehicleStatus,
    createVehicle,
    deleteVehicle,
    listVehicles,
    updateVehicle,
    type CreateVehicleInput,
    type UpdateVehicleInput,
    type VehicleListParams,
    type VehicleListResult,
    type VehicleStatus,
} from "@/features/fleet/api";
import { ApiError } from "@/lib/api-client";

const vehiclesKey = (params: VehicleListParams) =>
    ["vehicles", params] as const;

export function useVehicles(params: VehicleListParams) {
    return useQuery<VehicleListResult, ApiError>({
        queryKey: vehiclesKey(params),
        queryFn: () => listVehicles(params),
        placeholderData: (previous) => previous,
    });
}

function useInvalidateVehicles() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: ["vehicles"] });
}

export function useCreateVehicle() {
    const invalidate = useInvalidateVehicles();
    return useMutation<{ vehicle: unknown }, ApiError, CreateVehicleInput>({
        mutationFn: createVehicle,
        onSuccess: invalidate,
    });
}

export function useUpdateVehicle() {
    const invalidate = useInvalidateVehicles();
    return useMutation<
        { vehicle: unknown },
        ApiError,
        { id: string; input: UpdateVehicleInput }
    >({
        mutationFn: ({ id, input }) => updateVehicle(id, input),
        onSuccess: invalidate,
    });
}

export function useChangeVehicleStatus() {
    const invalidate = useInvalidateVehicles();
    return useMutation<
        { vehicle: unknown },
        ApiError,
        { id: string; status: VehicleStatus }
    >({
        mutationFn: ({ id, status }) => changeVehicleStatus(id, status),
        onSuccess: invalidate,
    });
}

export function useDeleteVehicle() {
    const invalidate = useInvalidateVehicles();
    return useMutation<{ message: string }, ApiError, string>({
        mutationFn: deleteVehicle,
        onSuccess: invalidate,
    });
}
