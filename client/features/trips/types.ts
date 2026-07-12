import type { PillVariant } from "@/components/ui/pill";

export type TripStatus = "draft" | "dispatched" | "completed" | "cancelled";

export type ResourceStatus = "available" | "on-trip";

export type DispatchVehicle = {
    id: string;
    name: string;
    capacityKg: number;
    status: ResourceStatus;
};

export type DispatchDriver = {
    id: string;
    name: string;
    status: ResourceStatus;
};

export type Trip = {
    id: string;
    source: string;
    destination: string;
    vehicleId: string | null;
    driverId: string | null;
    cargoWeightKg: number | null;
    plannedDistanceKm: number | null;
    status: TripStatus;
    note: string;
};

export const tripStatusLabel: Record<TripStatus, string> = {
    draft: "Draft",
    dispatched: "Dispatched",
    completed: "Completed",
    cancelled: "Cancelled",
};

export const tripStatusVariant: Record<TripStatus, PillVariant> = {
    draft: "draft",
    dispatched: "brand-accent",
    completed: "active",
    cancelled: "danger",
};

export const initialVehicles: DispatchVehicle[] = [
    { id: "v1", name: "VAN-05", capacityKg: 500, status: "available" },
    { id: "v2", name: "TRUCK-11", capacityKg: 5000, status: "on-trip" },
    { id: "v3", name: "MINI-03", capacityKg: 1000, status: "available" },
    { id: "v4", name: "TRUCK-04", capacityKg: 3000, status: "available" },
];

export const initialDrivers: DispatchDriver[] = [
    { id: "d1", name: "Alex", status: "on-trip" },
    { id: "d2", name: "Suresh", status: "available" },
    { id: "d3", name: "Priya", status: "available" },
];

export const initialTrips: Trip[] = [
    {
        id: "TR001",
        source: "Gandhinagar Depot",
        destination: "Ahmedabad Hub",
        vehicleId: "v2",
        driverId: "d1",
        cargoWeightKg: 420,
        plannedDistanceKm: 32,
        status: "dispatched",
        note: "45 min to ETA",
    },
    {
        id: "TR004",
        source: "Vatva Industrial Area",
        destination: "Sanand Warehouse",
        vehicleId: null,
        driverId: null,
        cargoWeightKg: 300,
        plannedDistanceKm: 21,
        status: "draft",
        note: "Awaiting vehicle & driver",
    },
    {
        id: "TR006",
        source: "Mansa",
        destination: "Kalol Depot",
        vehicleId: null,
        driverId: null,
        cargoWeightKg: 150,
        plannedDistanceKm: 18,
        status: "cancelled",
        note: "Vehicle went to shop",
    },
];
