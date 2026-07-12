export const DRIVER_STATUSES = [
  "available",
  "on_trip",
  "off_duty",
  "suspended",
] as const;

export type DriverStatus = (typeof DRIVER_STATUSES)[number];

export const isDriverStatus = (value: unknown): value is DriverStatus =>
  typeof value === "string" && (DRIVER_STATUSES as readonly string[]).includes(value);

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  available: "Available",
  on_trip: "On Trip",
  off_duty: "Off Duty",
  suspended: "Suspended",
};

export const DRIVER_STATUS_TRANSITIONS: Record<DriverStatus, DriverStatus[]> = {
  available: ["off_duty", "suspended"],
  off_duty: ["available", "suspended"],
  suspended: ["available"],
  on_trip: [],
};
