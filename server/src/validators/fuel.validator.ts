import { ApiError, type ValidationDetail } from "../utils/ApiError";
import {
  asQueryDate,
  asQueryString,
  optionalDate,
  optionalNumber,
  optionalString,
  parseLimit,
  parsePage,
  parseSortOrder,
  requiredNumber,
  requiredString,
} from "./shared";

const SORTABLE_COLUMNS = new Set(["filled_at", "cost", "liters", "created_at"]);

export interface CreateFuelLogInput {
  vehicle_id: string;
  trip_id: string | null;
  liters: number;
  cost: number;
  filled_at: string | null;
  odometer_km: number | null;
}

export const validateCreateFuelLog = (body: unknown): CreateFuelLogInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const vehicle_id = requiredString(data.vehicle_id, "vehicle_id", "Vehicle id", details);
  const trip_id = optionalString(data.trip_id);
  const liters = requiredNumber(data.liters, "liters", "Liters", details);
  const cost = requiredNumber(data.cost, "cost", "Cost", details, true);
  const filled_at = optionalDate(data.filled_at, "filled_at", details);
  const odometer_km = optionalNumber(data.odometer_km, "odometer_km", "Odometer", details, true);

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return { vehicle_id, trip_id, liters, cost, filled_at, odometer_km };
};

export interface FuelLogListQuery {
  vehicleId?: string;
  tripId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const parseFuelLogListQuery = (query: Record<string, unknown>): FuelLogListQuery => {
  const sortByRaw = asQueryString(query.sort_by) ?? "filled_at";
  return {
    vehicleId: asQueryString(query.vehicle_id),
    tripId: asQueryString(query.trip_id),
    fromDate: asQueryDate(query.from_date),
    toDate: asQueryDate(query.to_date),
    page: parsePage(query.page),
    limit: parseLimit(query.limit),
    sortBy: SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "filled_at",
    sortOrder: parseSortOrder(query.sort_order),
  };
};
