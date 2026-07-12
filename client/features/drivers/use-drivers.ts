"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    changeDriverStatus,
    createDriver,
    listDrivers,
    updateDriver,
    updateDriverSafetyScore,
    type CreateDriverInput,
    type DriverListParams,
    type DriverListResult,
    type DriverStatus,
    type UpdateDriverInput,
} from "@/features/drivers/api";
import { ApiError } from "@/lib/api-client";

const driversKey = (params: DriverListParams) => ["drivers", params] as const;

export function useDrivers(params: DriverListParams) {
    return useQuery<DriverListResult, ApiError>({
        queryKey: driversKey(params),
        queryFn: () => listDrivers(params),
        placeholderData: (previous) => previous,
    });
}

function useInvalidateDrivers() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: ["drivers"] });
}

export function useCreateDriver() {
    const invalidate = useInvalidateDrivers();
    return useMutation<{ driver: unknown }, ApiError, CreateDriverInput>({
        mutationFn: createDriver,
        onSuccess: invalidate,
    });
}

export function useUpdateDriver() {
    const invalidate = useInvalidateDrivers();
    return useMutation<
        { driver: unknown },
        ApiError,
        { id: string; input: UpdateDriverInput }
    >({
        mutationFn: ({ id, input }) => updateDriver(id, input),
        onSuccess: invalidate,
    });
}

export function useChangeDriverStatus() {
    const invalidate = useInvalidateDrivers();
    return useMutation<
        { driver: unknown },
        ApiError,
        { id: string; status: DriverStatus }
    >({
        mutationFn: ({ id, status }) => changeDriverStatus(id, status),
        onSuccess: invalidate,
    });
}

export function useUpdateDriverSafetyScore() {
    const invalidate = useInvalidateDrivers();
    return useMutation<
        { driver: unknown },
        ApiError,
        { id: string; safety_score: number }
    >({
        mutationFn: ({ id, safety_score }) =>
            updateDriverSafetyScore(id, safety_score),
        onSuccess: invalidate,
    });
}
