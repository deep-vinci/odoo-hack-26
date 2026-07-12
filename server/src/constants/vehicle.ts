export const VEHICLE_TYPES = [
  "truck",
  "van",
  "mini_truck",
  "trailer",
  "other",
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const isVehicleType = (value: unknown): value is VehicleType =>
  typeof value === "string" && (VEHICLE_TYPES as readonly string[]).includes(value);

export const VEHICLE_STATUSES = [
  "available",
  "on_trip",
  "in_shop",
  "retired",
] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const isVehicleStatus = (value: unknown): value is VehicleStatus =>
  typeof value === "string" && (VEHICLE_STATUSES as readonly string[]).includes(value);

export const MANUAL_VEHICLE_STATUSES: VehicleStatus[] = ["available", "retired"];

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Available",
  on_trip: "On Trip",
  in_shop: "In Shop",
  retired: "Retired",
};
