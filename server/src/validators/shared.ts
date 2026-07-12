import type { ValidationDetail } from "../utils/ApiError";

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const requiredString = (
  value: unknown,
  field: string,
  label: string,
  details: ValidationDetail[],
): string => {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) {
    details.push({ field, message: `${label} is required` });
  }
  return str;
};

export const optionalString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

export const requiredNumber = (
  value: unknown,
  field: string,
  label: string,
  details: ValidationDetail[],
  allowZero = false,
): number => {
  const num = typeof value === "number" ? value : Number(value);
  if (value === undefined || value === null || value === "" || !Number.isFinite(num)) {
    details.push({ field, message: `${label} is required and must be a number` });
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

export const optionalNumber = (
  value: unknown,
  field: string,
  label: string,
  details: ValidationDetail[],
  allowZero = true,
): number | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || (allowZero ? num < 0 : num <= 0)) {
    details.push({
      field,
      message: `${label} must be ${allowZero ? "zero or greater" : "greater than zero"}`,
    });
    return null;
  }
  return num;
};

export const optionalDate = (
  value: unknown,
  field: string,
  details: ValidationDetail[],
): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string" || !DATE_REGEX.test(value)) {
    details.push({ field, message: `${field} must be a valid date (YYYY-MM-DD)` });
    return null;
  }
  return value;
};

export const asQueryString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

export const asQueryDate = (value: unknown): string | undefined => {
  const str = asQueryString(value);
  return str && DATE_REGEX.test(str) ? str : undefined;
};

export const parsePage = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 1 ? Math.floor(num) : 1;
};

export const parseLimit = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 1 ? Math.min(Math.floor(num), 100) : 20;
};

export const parseSortOrder = (value: unknown): "asc" | "desc" =>
  asQueryString(value)?.toLowerCase() === "asc" ? "asc" : "desc";
