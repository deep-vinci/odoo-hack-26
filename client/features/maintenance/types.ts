import type { PillVariant } from "@/components/ui/pill";
import type { MaintenanceStatus } from "@/features/maintenance/api";

export const maintenanceStatusLabel: Record<MaintenanceStatus, string> = {
    open: "In Shop",
    closed: "Completed",
};

export const maintenanceStatusVariant: Record<MaintenanceStatus, PillVariant> = {
    open: "pending",
    closed: "available",
};

export function formatMaintenanceDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatCost(value: number): string {
    return value.toLocaleString("en-IN");
}
