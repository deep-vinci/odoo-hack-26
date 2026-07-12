import type { PillVariant } from "@/components/ui/pill";

export type ExpenseType = "toll" | "parking" | "fine" | "misc";

export type FuelExpenseVehicle = {
    id: string;
    name: string;
};

export type FuelExpenseTrip = {
    id: string;
    vehicleId: string;
};

export type FuelLog = {
    id: string;
    vehicleId: string;
    tripId: string | null;
    liters: number;
    cost: number;
    date: string;
};

export type Expense = {
    id: string;
    vehicleId: string;
    tripId: string | null;
    type: ExpenseType;
    amount: number;
    note: string;
    date: string;
};

export const expenseTypeLabel: Record<ExpenseType, string> = {
    toll: "Toll",
    parking: "Parking",
    fine: "Fine",
    misc: "Misc",
};

export const expenseTypeVariant: Record<ExpenseType, PillVariant> = {
    toll: "info",
    parking: "brand-accent",
    fine: "danger",
    misc: "generic",
};

export const fuelExpenseVehicles: FuelExpenseVehicle[] = [
    { id: "v1", name: "VAN-05" },
    { id: "v2", name: "TRUCK-11" },
    { id: "v3", name: "MINI-03" },
    { id: "v4", name: "VAN-09" },
];

export const fuelExpenseTrips: FuelExpenseTrip[] = [
    { id: "TR001", vehicleId: "v1" },
    { id: "TR002", vehicleId: "v2" },
    { id: "TR003", vehicleId: "v3" },
];

export const initialFuelLogs: FuelLog[] = [
    { id: "f3", vehicleId: "v3", tripId: "TR003", liters: 28, cost: 2050, date: "2026-07-06" },
    { id: "f2", vehicleId: "v2", tripId: "TR002", liters: 110, cost: 8400, date: "2026-07-06" },
    { id: "f1", vehicleId: "v1", tripId: "TR001", liters: 42, cost: 3150, date: "2026-07-05" },
];

export const initialExpenses: Expense[] = [
    { id: "e3", vehicleId: "v2", tripId: "TR002", type: "misc", amount: 150, note: "Loading help", date: "2026-07-06" },
    { id: "e2", vehicleId: "v2", tripId: "TR002", type: "toll", amount: 340, note: "Expressway", date: "2026-07-06" },
    { id: "e1", vehicleId: "v1", tripId: "TR001", type: "toll", amount: 120, note: "City toll", date: "2026-07-05" },
];
