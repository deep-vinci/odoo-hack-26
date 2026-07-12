import type { PillVariant } from "@/components/ui/pill";

export type MaintenanceStatus = "in-shop" | "completed";

export type MaintenanceVehicle = {
    id: string;
    name: string;
};

export type MaintenanceRecord = {
    id: string;
    vehicleId: string;
    serviceType: string;
    cost: number;
    date: string;
    status: MaintenanceStatus;
};

export const maintenanceStatusLabel: Record<MaintenanceStatus, string> = {
    "in-shop": "In Shop",
    completed: "Completed",
};

export const maintenanceStatusVariant: Record<MaintenanceStatus, PillVariant> = {
    "in-shop": "pending",
    completed: "available",
};

export const initialMaintenanceVehicles: MaintenanceVehicle[] = [
    { id: "v1", name: "VAN-05" },
    { id: "v2", name: "TRUCK-11" },
    { id: "v3", name: "MINI-03" },
    { id: "v4", name: "VAN-09" },
];

export const initialMaintenanceRecords: MaintenanceRecord[] = [
    { id: "m3", vehicleId: "v3", serviceType: "Tyre Replace", cost: 6200, date: "2026-07-10", status: "in-shop" },
    { id: "m1", vehicleId: "v1", serviceType: "Oil Change", cost: 2500, date: "2026-07-07", status: "in-shop" },
    { id: "m2", vehicleId: "v2", serviceType: "Engine Repair", cost: 18000, date: "2026-06-28", status: "completed" },
];
