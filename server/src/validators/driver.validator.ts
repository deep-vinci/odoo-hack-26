import { ApiError, type ValidationDetail } from "../utils/ApiError";
import {
  DRIVER_STATUSES,
  isDriverStatus,
  type DriverStatus,
} from "../constants/driverStatus";

const MAX_NAME_LENGTH = 100;
const MAX_LICENSE_NUMBER_LENGTH = 50;
const MAX_LICENSE_CATEGORY_LENGTH = 20;
const MAX_CONTACT_NUMBER_LENGTH = 20;
const DEFAULT_SAFETY_SCORE = 100;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateString = (value: string): boolean => {
  if (!DATE_REGEX.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
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

const parseLicenseNumber = (
  value: unknown,
  details: ValidationDetail[],
): string | undefined => {
  const licenseNumber = typeof value === "string" ? value.trim() : "";
  if (!licenseNumber) {
    details.push({ field: "license_number", message: "License number is required" });
    return undefined;
  }
  if (licenseNumber.length > MAX_LICENSE_NUMBER_LENGTH) {
    details.push({
      field: "license_number",
      message: `License number must be at most ${MAX_LICENSE_NUMBER_LENGTH} characters`,
    });
  }
  return licenseNumber;
};

const parseLicenseCategory = (
  value: unknown,
  details: ValidationDetail[],
): string | undefined => {
  const licenseCategory = typeof value === "string" ? value.trim() : "";
  if (!licenseCategory) {
    details.push({ field: "license_category", message: "License category is required" });
    return undefined;
  }
  if (licenseCategory.length > MAX_LICENSE_CATEGORY_LENGTH) {
    details.push({
      field: "license_category",
      message: `License category must be at most ${MAX_LICENSE_CATEGORY_LENGTH} characters`,
    });
  }
  return licenseCategory;
};

const parseLicenseExpiryDate = (
  value: unknown,
  details: ValidationDetail[],
): string | undefined => {
  const licenseExpiryDate = typeof value === "string" ? value.trim() : "";
  if (!licenseExpiryDate) {
    details.push({
      field: "license_expiry_date",
      message: "License expiry date is required",
    });
    return undefined;
  }
  if (!isValidDateString(licenseExpiryDate)) {
    details.push({
      field: "license_expiry_date",
      message: "License expiry date must be a valid date (YYYY-MM-DD)",
    });
    return undefined;
  }
  return licenseExpiryDate;
};

const parseContactNumber = (
  value: unknown,
  details: ValidationDetail[],
): string | undefined => {
  const contactNumber = typeof value === "string" ? value.trim() : "";
  if (!contactNumber) {
    details.push({ field: "contact_number", message: "Contact number is required" });
    return undefined;
  }
  if (contactNumber.length > MAX_CONTACT_NUMBER_LENGTH) {
    details.push({
      field: "contact_number",
      message: `Contact number must be at most ${MAX_CONTACT_NUMBER_LENGTH} characters`,
    });
  }
  return contactNumber;
};

const parseSafetyScore = (value: unknown, details: ValidationDetail[]): number => {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    details.push({
      field: "safety_score",
      message: "Safety score must be a number between 0 and 100",
    });
    return 0;
  }
  return value;
};

export interface CreateDriverInput {
  name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
}

export const validateCreateDriver = (body: unknown): CreateDriverInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const name = parseName(data.name, details) ?? "";
  const license_number = parseLicenseNumber(data.license_number, details) ?? "";
  const license_category = parseLicenseCategory(data.license_category, details) ?? "";
  const license_expiry_date = parseLicenseExpiryDate(data.license_expiry_date, details) ?? "";
  const contact_number = parseContactNumber(data.contact_number, details) ?? "";

  let safety_score = DEFAULT_SAFETY_SCORE;
  if (data.safety_score !== undefined && data.safety_score !== null) {
    safety_score = parseSafetyScore(data.safety_score, details);
  }

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return {
    name,
    license_number,
    license_category,
    license_expiry_date,
    contact_number,
    safety_score,
  };
};

export interface UpdateDriverInput {
  name?: string;
  license_number?: string;
  license_category?: string;
  license_expiry_date?: string;
  contact_number?: string;
}

export const validateUpdateDriver = (body: unknown): UpdateDriverInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];
  const input: UpdateDriverInput = {};

  if ("name" in data) {
    const name = parseName(data.name, details);
    if (name) input.name = name;
  }
  if ("license_number" in data) {
    const licenseNumber = parseLicenseNumber(data.license_number, details);
    if (licenseNumber) input.license_number = licenseNumber;
  }
  if ("license_category" in data) {
    const licenseCategory = parseLicenseCategory(data.license_category, details);
    if (licenseCategory) input.license_category = licenseCategory;
  }
  if ("license_expiry_date" in data) {
    const licenseExpiryDate = parseLicenseExpiryDate(data.license_expiry_date, details);
    if (licenseExpiryDate) input.license_expiry_date = licenseExpiryDate;
  }
  if ("contact_number" in data) {
    const contactNumber = parseContactNumber(data.contact_number, details);
    if (contactNumber) input.contact_number = contactNumber;
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
  status: DriverStatus;
}

export const validateStatusChange = (body: unknown): StatusChangeInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  if (!isDriverStatus(data.status)) {
    throw ApiError.validation([
      { field: "status", message: `Status must be one of: ${DRIVER_STATUSES.join(", ")}` },
    ]);
  }
  return { status: data.status };
};

export interface SafetyScoreInput {
  safety_score: number;
}

export const validateSafetyScore = (body: unknown): SafetyScoreInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];
  const safety_score = parseSafetyScore(data.safety_score, details);
  if (details.length > 0) {
    throw ApiError.validation(details);
  }
  return { safety_score };
};

const SORTABLE_COLUMNS = new Set([
  "created_at",
  "updated_at",
  "name",
  "safety_score",
  "license_expiry_date",
  "status",
]);

export interface DriverListQuery {
  status?: DriverStatus;
  search?: string;
  availableForDispatch: boolean;
  licenseExpiringWithinDays?: number;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

export const parseDriverListQuery = (
  query: Record<string, unknown>,
): DriverListQuery => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(Math.floor(rawLimit), 100) : 20;

  const sortByRaw = asString(query.sort_by) ?? "created_at";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "created_at";
  const sortOrder = asString(query.sort_order)?.toLowerCase() === "asc" ? "asc" : "desc";

  const status = asString(query.status);

  const rawDays = Number(query.license_expiring_within_days);
  const licenseExpiringWithinDays =
    asString(query.license_expiring_within_days) !== undefined &&
    Number.isFinite(rawDays) &&
    rawDays >= 0
      ? Math.floor(rawDays)
      : undefined;

  return {
    status: isDriverStatus(status) ? status : undefined,
    search: asString(query.search),
    availableForDispatch: asString(query.available_for_dispatch) === "true",
    licenseExpiringWithinDays,
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

export const parseExpiringDays = (query: Record<string, unknown>): number => {
  const raw = Number(query.days);
  return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 30;
};
