import { asQueryDate, asQueryString } from "./shared";
import {
  isVehicleStatus,
  isVehicleType,
  type VehicleStatus,
  type VehicleType,
} from "../constants/vehicle";

export interface ReportFilters {
  from: string | null;
  to: string | null;
  vehicleId?: string;
  vehicleType?: VehicleType;
  vehicleStatus?: VehicleStatus;
  region?: string;
}

export const parseReportFilters = (query: Record<string, unknown>): ReportFilters => {
  const type = asQueryString(query.vehicle_type);
  const status = asQueryString(query.vehicle_status);
  return {
    from: asQueryDate(query.from_date) ?? null,
    to: asQueryDate(query.to_date) ?? null,
    vehicleId: asQueryString(query.vehicle_id),
    vehicleType: isVehicleType(type) ? type : undefined,
    vehicleStatus: isVehicleStatus(status) ? status : undefined,
    region: asQueryString(query.region),
  };
};

export const parseDays = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 1 ? Math.min(Math.floor(num), 90) : 14;
};

export const parseMonths = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 1 ? Math.min(Math.floor(num), 24) : 6;
};

export const REPORT_NAMES = [
  "vehicles",
  "drivers",
  "trips",
  "fuel-logs",
  "expenses",
  "maintenance",
  "operational-costs",
  "fuel-efficiency",
  "vehicle-roi",
] as const;

export type ReportName = (typeof REPORT_NAMES)[number];

export const isReportName = (value: unknown): value is ReportName =>
  typeof value === "string" && (REPORT_NAMES as readonly string[]).includes(value);
