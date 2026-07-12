export const TRIP_STATUSES = [
  "draft",
  "dispatched",
  "completed",
  "cancelled",
] as const;

export type TripStatus = (typeof TRIP_STATUSES)[number];

export const isTripStatus = (value: unknown): value is TripStatus =>
  typeof value === "string" && (TRIP_STATUSES as readonly string[]).includes(value);

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  draft: "Draft",
  dispatched: "Dispatched",
  completed: "Completed",
  cancelled: "Cancelled",
};
