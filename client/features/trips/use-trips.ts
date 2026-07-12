"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    cancelTrip,
    completeTrip,
    createTrip,
    dispatchTrip,
    getTrip,
    listTrips,
    type CancelTripInput,
    type CancelTripResult,
    type CompleteTripInput,
    type CompleteTripResult,
    type CreateTripInput,
    type DispatchTripInput,
    type DispatchTripResult,
    type TripDetail,
    type TripListParams,
    type TripListResult,
    type TripRecord,
} from "@/features/trips/api";
import { ApiError } from "@/lib/api-client";

const tripsKey = (params: TripListParams) => ["trips", params] as const;
const tripKey = (id: string) => ["trip", id] as const;

export function useTrips(params: TripListParams) {
    return useQuery<TripListResult, ApiError>({
        queryKey: tripsKey(params),
        queryFn: () => listTrips(params),
        placeholderData: (previous) => previous,
    });
}

export function useTrip(id: string | null) {
    return useQuery<TripDetail, ApiError>({
        queryKey: tripKey(id ?? ""),
        queryFn: () => getTrip(id as string),
        enabled: id !== null,
    });
}

function useInvalidateTrips() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["trips"] });
        queryClient.invalidateQueries({ queryKey: ["trip"] });
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        queryClient.invalidateQueries({ queryKey: ["drivers"] });
    };
}

export function useCreateTrip() {
    const invalidate = useInvalidateTrips();
    return useMutation<{ trip: TripRecord }, ApiError, CreateTripInput>({
        mutationFn: createTrip,
        onSuccess: invalidate,
    });
}

export function useDispatchTrip() {
    const invalidate = useInvalidateTrips();
    return useMutation<
        DispatchTripResult,
        ApiError,
        { id: string; input: DispatchTripInput }
    >({
        mutationFn: ({ id, input }) => dispatchTrip(id, input),
        onSuccess: invalidate,
    });
}

export function useCompleteTrip() {
    const invalidate = useInvalidateTrips();
    return useMutation<
        CompleteTripResult,
        ApiError,
        { id: string; input: CompleteTripInput }
    >({
        mutationFn: ({ id, input }) => completeTrip(id, input),
        onSuccess: invalidate,
    });
}

export function useCancelTrip() {
    const invalidate = useInvalidateTrips();
    return useMutation<
        CancelTripResult,
        ApiError,
        { id: string; input?: CancelTripInput }
    >({
        mutationFn: ({ id, input }) => cancelTrip(id, input),
        onSuccess: invalidate,
    });
}
