import { ApiError, type ValidationDetail } from "../utils/ApiError";
import { isMaintenanceStatus, type MaintenanceStatus } from "../constants/maintenance";

const MAX_TITLE_LENGTH = 150;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const SORTABLE_COLUMNS = new Set(["opened_at", "closed_at", "cost", "created_at"]);

const parseCost = (value: unknown, details: ValidationDetail[]): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num < 0) {
    details.push({ field: "cost", message: "Cost must be zero or greater" });
    return undefined;
  }
  return num;
};

const parseTitle = (value: unknown, details: ValidationDetail[]): string | undefined => {
  const title = typeof value === "string" ? value.trim() : "";
  if (!title) {
    details.push({ field: "title", message: "Title is required" });
    return undefined;
  }
  if (title.length > MAX_TITLE_LENGTH) {
    details.push({
      field: "title",
      message: `Title must be at most ${MAX_TITLE_LENGTH} characters`,
    });
  }
  return title;
};

const parseDescription = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

export interface CreateMaintenanceInput {
  vehicle_id: string;
  title: string;
  description: string | null;
  cost: number;
}

export const validateCreateMaintenance = (body: unknown): CreateMaintenanceInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const vehicle_id = typeof data.vehicle_id === "string" ? data.vehicle_id.trim() : "";
  if (!vehicle_id) {
    details.push({ field: "vehicle_id", message: "Vehicle id is required" });
  }

  const title = parseTitle(data.title, details) ?? "";
  const description = parseDescription(data.description);
  const cost = parseCost(data.cost, details) ?? 0;

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return { vehicle_id, title, description, cost };
};

export interface UpdateMaintenanceInput {
  title?: string;
  description?: string | null;
  cost?: number;
}

export const validateUpdateMaintenance = (body: unknown): UpdateMaintenanceInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];
  const input: UpdateMaintenanceInput = {};

  if ("title" in data) {
    const title = parseTitle(data.title, details);
    if (title) {
      input.title = title;
    }
  }

  if ("description" in data) {
    input.description = parseDescription(data.description);
  }

  if ("cost" in data) {
    const cost = parseCost(data.cost, details);
    if (cost !== undefined) {
      input.cost = cost;
    }
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

export interface CloseMaintenanceInput {
  cost?: number;
}

export const validateCloseMaintenance = (body: unknown): CloseMaintenanceInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];
  const input: CloseMaintenanceInput = {};

  const cost = parseCost(data.cost, details);
  if (cost !== undefined) {
    input.cost = cost;
  }

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return input;
};

export interface MaintenanceListQuery {
  status?: MaintenanceStatus;
  vehicleId?: string;
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
  const str = asString(value);
  return str && DATE_REGEX.test(str) ? str : undefined;
};

export const parseMaintenanceListQuery = (
  query: Record<string, unknown>,
): MaintenanceListQuery => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(Math.floor(rawLimit), 100) : 20;

  const sortByRaw = asString(query.sort_by) ?? "opened_at";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "opened_at";
  const sortOrder = asString(query.sort_order)?.toLowerCase() === "asc" ? "asc" : "desc";

  const status = asString(query.status);

  return {
    status: isMaintenanceStatus(status) ? status : undefined,
    vehicleId: asString(query.vehicle_id),
    search: asString(query.search),
    fromDate: asDate(query.from_date),
    toDate: asDate(query.to_date),
    page,
    limit,
    sortBy,
    sortOrder,
  };
};
