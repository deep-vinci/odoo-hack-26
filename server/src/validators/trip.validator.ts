import { ApiError, type ValidationDetail } from "../utils/ApiError";
import { isTripStatus, type TripStatus } from "../constants/tripStatus";
import { isUuid } from "../utils/uuid";

const MAX_LOCATION_LENGTH = 255;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const SORTABLE_COLUMNS = new Set([
  "created_at",
  "dispatched_at",
  "completed_at",
  "trip_number",
  "status",
  "cargo_weight_kg",
  "planned_distance_km",
  "revenue",
]);

const parseLocation = (
  value: unknown,
  field: string,
  label: string,
  details: ValidationDetail[],
): string | undefined => {
  const location = typeof value === "string" ? value.trim() : "";
  if (!location) {
    details.push({ field, message: `${label} is required` });
    return undefined;
  }
  if (location.length > MAX_LOCATION_LENGTH) {
    details.push({
      field,
      message: `${label} must be at most ${MAX_LOCATION_LENGTH} characters`,
    });
  }
  return location;
};

const parseNumber = (
  value: unknown,
  field: string,
  label: string,
  details: ValidationDetail[],
  allowZero: boolean,
): number => {
  const num = typeof value === "number" ? value : Number(value);
  if (value === undefined || value === null || value === "" || !Number.isFinite(num)) {
    details.push({ field, message: `${label} must be a number` });
    return 0;
  }
  if (allowZero ? num < 0 : num <= 0) {
    details.push({
      field,
      message: `${label} must be ${allowZero ? "zero or greater" : "greater than zero"}`,
    });
  }
  return num;
};

const parseId = (
  value: unknown,
  field: string,
  label: string,
  details: ValidationDetail[],
): string => {
  const id = typeof value === "string" ? value.trim() : "";
  if (!id) {
    details.push({ field, message: `${label} is required` });
  }
  return id;
};

export interface CreateTripInput {
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight_kg: number;
  planned_distance_km: number;
  revenue: number;
}

export const validateCreateTrip = (body: unknown): CreateTripInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const source = parseLocation(data.source, "source", "Source", details) ?? "";
  const destination =
    parseLocation(data.destination, "destination", "Destination", details) ?? "";
  const vehicle_id = parseId(data.vehicle_id, "vehicle_id", "Vehicle ID", details);
  const driver_id = parseId(data.driver_id, "driver_id", "Driver ID", details);
  const cargo_weight_kg = parseNumber(
    data.cargo_weight_kg,
    "cargo_weight_kg",
    "Cargo weight",
    details,
    false,
  );
  const planned_distance_km = parseNumber(
    data.planned_distance_km,
    "planned_distance_km",
    "Planned distance",
    details,
    false,
  );

  let revenue = 0;
  if (data.revenue !== undefined && data.revenue !== null && data.revenue !== "") {
    revenue = parseNumber(data.revenue, "revenue", "Revenue", details, true);
  }

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return {
    source,
    destination,
    vehicle_id,
    driver_id,
    cargo_weight_kg,
    planned_distance_km,
    revenue,
  };
};

export interface DispatchTripInput {
  start_odometer_km?: number;
}

export const validateDispatchTrip = (body: unknown): DispatchTripInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];
  const input: DispatchTripInput = {};

  if (
    data.start_odometer_km !== undefined &&
    data.start_odometer_km !== null &&
    data.start_odometer_km !== ""
  ) {
    input.start_odometer_km = parseNumber(
      data.start_odometer_km,
      "start_odometer_km",
      "Start odometer",
      details,
      true,
    );
  }

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return input;
};

export interface FuelConsumedInput {
  liters: number;
  cost: number;
}

export interface CompleteTripInput {
  end_odometer_km: number;
  fuel_consumed?: FuelConsumedInput;
  revenue?: number;
}

export const validateCompleteTrip = (body: unknown): CompleteTripInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const end_odometer_km = parseNumber(
    data.end_odometer_km,
    "end_odometer_km",
    "End odometer",
    details,
    true,
  );

  let fuel_consumed: FuelConsumedInput | undefined;
  if (data.fuel_consumed !== undefined && data.fuel_consumed !== null) {
    if (typeof data.fuel_consumed !== "object" || Array.isArray(data.fuel_consumed)) {
      details.push({
        field: "fuel_consumed",
        message: "Fuel consumed must be an object with liters and cost",
      });
    } else {
      const fuel = data.fuel_consumed as Record<string, unknown>;
      const liters = parseNumber(
        fuel.liters,
        "fuel_consumed.liters",
        "Fuel liters",
        details,
        false,
      );
      const cost = parseNumber(
        fuel.cost,
        "fuel_consumed.cost",
        "Fuel cost",
        details,
        true,
      );
      fuel_consumed = { liters, cost };
    }
  }

  let revenue: number | undefined;
  if (data.revenue !== undefined && data.revenue !== null && data.revenue !== "") {
    revenue = parseNumber(data.revenue, "revenue", "Revenue", details, true);
  }

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return { end_odometer_km, fuel_consumed, revenue };
};

export interface CancelTripInput {
  reason?: string;
}

export const validateCancelTrip = (body: unknown): CancelTripInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const reason =
    typeof data.reason === "string" && data.reason.trim() ? data.reason.trim() : undefined;
  return { reason };
};

export interface TripListQuery {
  status?: TripStatus;
  vehicleId?: string;
  driverId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const asDate = (value: unknown): string | undefined => {
  const date = asString(value);
  return date && DATE_REGEX.test(date) ? date : undefined;
};

export const parseTripListQuery = (query: Record<string, unknown>): TripListQuery => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(Math.floor(rawLimit), 100) : 20;

  const sortByRaw = asString(query.sort_by) ?? "created_at";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "created_at";
  const sortOrder = asString(query.sort_order)?.toLowerCase() === "asc" ? "asc" : "desc";

  const status = asString(query.status);
  const vehicleId = asString(query.vehicle_id);
  const driverId = asString(query.driver_id);

  return {
    status: isTripStatus(status) ? status : undefined,
    vehicleId: isUuid(vehicleId) ? vehicleId : undefined,
    driverId: isUuid(driverId) ? driverId : undefined,
    search: asString(query.search),
    fromDate: asDate(query.from_date),
    toDate: asDate(query.to_date),
    page,
    limit,
    sortBy,
    sortOrder,
  };
};
