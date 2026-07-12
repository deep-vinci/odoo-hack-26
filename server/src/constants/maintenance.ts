export const MAINTENANCE_STATUSES = ["open", "closed"] as const;

export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export const isMaintenanceStatus = (value: unknown): value is MaintenanceStatus =>
  typeof value === "string" && (MAINTENANCE_STATUSES as readonly string[]).includes(value);
