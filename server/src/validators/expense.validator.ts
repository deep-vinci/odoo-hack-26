import { ApiError, type ValidationDetail } from "../utils/ApiError";
import { EXPENSE_TYPES, isExpenseType, type ExpenseType } from "../constants/expense";
import {
  asQueryDate,
  asQueryString,
  optionalDate,
  optionalString,
  parseLimit,
  parsePage,
  parseSortOrder,
  requiredNumber,
  requiredString,
} from "./shared";

const MAX_NOTE_LENGTH = 255;
const SORTABLE_COLUMNS = new Set(["incurred_at", "amount", "type", "created_at"]);

export interface CreateExpenseInput {
  vehicle_id: string;
  trip_id: string | null;
  type: ExpenseType;
  amount: number;
  note: string | null;
  incurred_at: string | null;
}

export const validateCreateExpense = (body: unknown): CreateExpenseInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const vehicle_id = requiredString(data.vehicle_id, "vehicle_id", "Vehicle id", details);
  const trip_id = optionalString(data.trip_id);

  if (!isExpenseType(data.type)) {
    details.push({
      field: "type",
      message: `Type must be one of: ${EXPENSE_TYPES.join(", ")}`,
    });
  }

  const amount = requiredNumber(data.amount, "amount", "Amount", details);

  const note = optionalString(data.note);
  if (note && note.length > MAX_NOTE_LENGTH) {
    details.push({
      field: "note",
      message: `Note must be at most ${MAX_NOTE_LENGTH} characters`,
    });
  }

  const incurred_at = optionalDate(data.incurred_at, "incurred_at", details);

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return {
    vehicle_id,
    trip_id,
    type: data.type as ExpenseType,
    amount,
    note,
    incurred_at,
  };
};

export interface ExpenseListQuery {
  vehicleId?: string;
  tripId?: string;
  type?: ExpenseType;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const parseExpenseListQuery = (query: Record<string, unknown>): ExpenseListQuery => {
  const sortByRaw = asQueryString(query.sort_by) ?? "incurred_at";
  const type = asQueryString(query.type);
  return {
    vehicleId: asQueryString(query.vehicle_id),
    tripId: asQueryString(query.trip_id),
    type: isExpenseType(type) ? type : undefined,
    fromDate: asQueryDate(query.from_date),
    toDate: asQueryDate(query.to_date),
    page: parsePage(query.page),
    limit: parseLimit(query.limit),
    sortBy: SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "incurred_at",
    sortOrder: parseSortOrder(query.sort_order),
  };
};
