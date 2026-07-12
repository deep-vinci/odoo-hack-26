import { ApiError, type ValidationDetail } from "../utils/ApiError";
import {
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
  isVehicleStatus,
  isVehicleType,
  type VehicleStatus,
  type VehicleType,
} from "../constants/vehicle";

const MAX_REGISTRATION_LENGTH = 20;
const MAX_NAME_LENGTH = 100;
const MAX_REGION_LENGTH = 100;

const SORTABLE_COLUMNS = new Set([
  "created_at",
  "updated_at",
  "odometer_km",
  "acquisition_cost",
  "max_load_capacity_kg",
  "registration_number",
  "name",
]);

const normalizeRegistration = (value: unknown): string =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

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

const parseRegion = (value: unknown, details: ValidationDetail[]): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    details.push({ field: "region", message: "Region must be a string" });
    return null;
  }
  const region = value.trim();
  if (region.length > MAX_REGION_LENGTH) {
    details.push({
      field: "region",
      message: `Region must be at most ${MAX_REGION_LENGTH} characters`,
    });
  }
  return region || null;
};

const parseRegistration = (
  value: unknown,
  details: ValidationDetail[],
): string | undefined => {
  const registration = normalizeRegistration(value);
  if (!registration) {
    details.push({
      field: "registration_number",
      message: "Registration number is required",
    });
    return undefined;
  }
  if (registration.length > MAX_REGISTRATION_LENGTH) {
    details.push({
      field: "registration_number",
      message: `Registration number must be at most ${MAX_REGISTRATION_LENGTH} characters`,
    });
  }
  return registration;
};

const parseName = (value: unknown, details: ValidationDetail[]): string | undefined => {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name) {
    details.push({ field: "name", message: "Name is required" });
    return undefined;
  }
  if (name.length > MAX_NAME_LENGTH) {
    details.push({
      field: "name",
      message: `Name must be at most ${MAX_NAME_LENGTH} characters`,
    });
  }
  return name;
};

export interface CreateVehicleInput {
  registration_number: string;
  name: string;
  type: VehicleType;
  max_load_capacity_kg: number;
  odometer_km: number;
  acquisition_cost: number;
  region: string | null;
}

export const validateCreateVehicle = (body: unknown): CreateVehicleInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const registration_number = parseRegistration(data.registration_number, details) ?? "";
  const name = parseName(data.name, details) ?? "";

  if (!isVehicleType(data.type)) {
    details.push({
      field: "type",
      message: `Type must be one of: ${VEHICLE_TYPES.join(", ")}`,
    });
  }

  const max_load_capacity_kg = parseNumber(
    data.max_load_capacity_kg,
    "max_load_capacity_kg",
    "Max load capacity",
    details,
    false,
  );
  const acquisition_cost = parseNumber(
    data.acquisition_cost,
    "acquisition_cost",
    "Acquisition cost",
    details,
    true,
  );

  const odometer_km =
    data.odometer_km === undefined || data.odometer_km === null || data.odometer_km === ""
      ? 0
      : parseNumber(data.odometer_km, "odometer_km", "Odometer", details, true);

  const region = parseRegion(data.region, details);

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return {
    registration_number,
    name,
    type: data.type as VehicleType,
    max_load_capacity_kg,
    odometer_km,
    acquisition_cost,
    region,
  };
};

export interface UpdateVehicleInput {
  registration_number?: string;
  name?: string;
  type?: VehicleType;
  max_load_capacity_kg?: number;
  odometer_km?: number;
  acquisition_cost?: number;
  region?: string | null;
}

export const validateUpdateVehicle = (body: unknown): UpdateVehicleInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];
  const input: UpdateVehicleInput = {};

  if ("registration_number" in data) {
    const registration = parseRegistration(data.registration_number, details);
    if (registration) {
      input.registration_number = registration;
    }
  }

  if ("name" in data) {
    const name = parseName(data.name, details);
    if (name) {
      input.name = name;
    }
  }

  if ("type" in data) {
    if (!isVehicleType(data.type)) {
      details.push({
        field: "type",
        message: `Type must be one of: ${VEHICLE_TYPES.join(", ")}`,
      });
    } else {
      input.type = data.type;
    }
  }

  if ("max_load_capacity_kg" in data) {
    input.max_load_capacity_kg = parseNumber(
      data.max_load_capacity_kg,
      "max_load_capacity_kg",
      "Max load capacity",
      details,
      false,
    );
  }

  if ("odometer_km" in data) {
    input.odometer_km = parseNumber(data.odometer_km, "odometer_km", "Odometer", details, true);
  }

  if ("acquisition_cost" in data) {
    input.acquisition_cost = parseNumber(
      data.acquisition_cost,
      "acquisition_cost",
      "Acquisition cost",
      details,
      true,
    );
  }

  if ("region" in data) {
    input.region = parseRegion(data.region, details);
  }

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  if (Object.keys(input).length === 0) {
    throw ApiError.validation([
      { field: "body", message: "At least one field must be provided" },
    ]);
  }

  return input;
};

export interface StatusChangeInput {
  status: VehicleStatus;
}

export const validateStatusChange = (body: unknown): StatusChangeInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  if (!isVehicleStatus(data.status)) {
    throw ApiError.validation([
      { field: "status", message: `Status must be one of: ${VEHICLE_STATUSES.join(", ")}` },
    ]);
  }
  return { status: data.status };
};

export interface VehicleListQuery {
  status?: VehicleStatus;
  type?: VehicleType;
  region?: string;
  search?: string;
  availableForDispatch: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

export const parseVehicleListQuery = (query: Record<string, unknown>): VehicleListQuery => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(Math.floor(rawLimit), 100) : 20;

  const sortByRaw = asString(query.sort_by) ?? "created_at";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "created_at";
  const sortOrder = asString(query.sort_order)?.toLowerCase() === "asc" ? "asc" : "desc";

  const status = asString(query.status);
  const type = asString(query.type);

  return {
    status: isVehicleStatus(status) ? status : undefined,
    type: isVehicleType(type) ? type : undefined,
    region: asString(query.region),
    search: asString(query.search),
    availableForDispatch: asString(query.available_for_dispatch) === "true",
    page,
    limit,
    sortBy,
    sortOrder,
  };
};
