"use client";

import { useQuery } from "@tanstack/react-query";
import {
    getDashboard,
    type Dashboard,
    type DashboardFilterParams,
} from "@/features/dashboard/api";
import { ApiError } from "@/lib/api-client";

const dashboardKey = (params: DashboardFilterParams) =>
    ["dashboard", params] as const;

export function useDashboard(params: DashboardFilterParams) {
    return useQuery<Dashboard, ApiError>({
        queryKey: dashboardKey(params),
        queryFn: () => getDashboard(params),
        placeholderData: (previous) => previous,
    });
}
