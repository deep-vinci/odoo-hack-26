import pool from "../config/db";
import { ApiError } from "../utils/ApiError";
import { isUuid } from "../utils/uuid";
import { offsetOf, paginate, type Pagination } from "../utils/pagination";
import { resolveVehicleAndTrip, type TripRef, type VehicleRef } from "./ledger.helpers";
import type { ExpenseType } from "../constants/expense";
import type { CreateExpenseInput, ExpenseListQuery } from "../validators/expense.validator";

export interface Expense {
  id: string;
  vehicle: VehicleRef;
  trip: TripRef | null;
  type: ExpenseType;
  amount: number;
  note: string | null;
  incurred_at: string;
  created_by: string;
  created_at: string;
}

interface ExpenseCoreRow {
  id: string;
  type: ExpenseType;
  amount: string;
  note: string | null;
  incurred_at: string;
  created_by: string;
  created_at: string;
}

interface ExpenseJoinedRow extends ExpenseCoreRow {
  vehicle_id: string;
  vehicle_registration_number: string;
  vehicle_name: string;
  trip_id: string | null;
  trip_number: string | null;
}

const buildExpense = (
  row: ExpenseCoreRow,
  vehicle: VehicleRef,
  trip: TripRef | null,
): Expense => ({
  id: row.id,
  vehicle,
  trip,
  type: row.type,
  amount: Number(row.amount),
  note: row.note,
  incurred_at: row.incurred_at,
  created_by: row.created_by,
  created_at: row.created_at,
});

const mapJoinedExpense = (row: ExpenseJoinedRow): Expense =>
  buildExpense(
    row,
    {
      id: row.vehicle_id,
      registration_number: row.vehicle_registration_number,
      name: row.vehicle_name,
    },
    row.trip_id && row.trip_number
      ? { id: row.trip_id, trip_number: row.trip_number }
      : null,
  );

const expenseNotFound = (): ApiError =>
  ApiError.notFound("EXPENSE_NOT_FOUND", "Expense with the given ID does not exist");

export const createExpense = async (
  input: CreateExpenseInput,
  createdBy: string,
): Promise<Expense> => {
  const { vehicle, trip } = await resolveVehicleAndTrip(input.vehicle_id, input.trip_id);

  const result = await pool.query<ExpenseCoreRow>(
    `INSERT INTO expenses (vehicle_id, trip_id, type, amount, note, incurred_at, created_by)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE), $7)
     RETURNING id, type, amount, note, incurred_at::text AS incurred_at, created_by, created_at`,
    [
      input.vehicle_id,
      input.trip_id,
      input.type,
      input.amount,
      input.note,
      input.incurred_at,
      createdBy,
    ],
  );

  return buildExpense(result.rows[0], vehicle, trip);
};

const buildFilters = (query: ExpenseListQuery): { where: string; values: unknown[] } => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (query.vehicleId && isUuid(query.vehicleId)) {
    values.push(query.vehicleId);
    conditions.push(`e.vehicle_id = $${values.length}`);
  }
  if (query.tripId && isUuid(query.tripId)) {
    values.push(query.tripId);
    conditions.push(`e.trip_id = $${values.length}`);
  }
  if (query.type) {
    values.push(query.type);
    conditions.push(`e.type = $${values.length}`);
  }
  if (query.fromDate) {
    values.push(query.fromDate);
    conditions.push(`e.incurred_at >= $${values.length}::date`);
  }
  if (query.toDate) {
    values.push(query.toDate);
    conditions.push(`e.incurred_at <= $${values.length}::date`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, values };
};

export interface ExpenseListResult {
  expenses: Expense[];
  pagination: Pagination;
  summary: {
    total_amount: number;
    by_type: Record<ExpenseType, number>;
  };
}

export const listExpenses = async (query: ExpenseListQuery): Promise<ExpenseListResult> => {
  const { where, values } = buildFilters(query);

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM expenses e ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].count);

  const listValues = [...values, query.limit, offsetOf(query.page, query.limit)];
  const result = await pool.query<ExpenseJoinedRow>(
    `SELECT e.id, e.type, e.amount, e.note, e.incurred_at::text AS incurred_at,
            e.created_by, e.created_at,
            v.id AS vehicle_id, v.registration_number AS vehicle_registration_number,
            v.name AS vehicle_name,
            t.id AS trip_id, t.trip_number AS trip_number
     FROM expenses e
     JOIN vehicles v ON v.id = e.vehicle_id
     LEFT JOIN trips t ON t.id = e.trip_id
     ${where}
     ORDER BY e.${query.sortBy} ${query.sortOrder === "asc" ? "ASC" : "DESC"}
     LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
    listValues,
  );

  const summaryResult = await pool.query<{
    total_amount: string;
    toll: string;
    parking: string;
    fine: string;
    misc: string;
  }>(
    `SELECT COALESCE(SUM(amount), 0) AS total_amount,
            COALESCE(SUM(amount) FILTER (WHERE type = 'toll'), 0) AS toll,
            COALESCE(SUM(amount) FILTER (WHERE type = 'parking'), 0) AS parking,
            COALESCE(SUM(amount) FILTER (WHERE type = 'fine'), 0) AS fine,
            COALESCE(SUM(amount) FILTER (WHERE type = 'misc'), 0) AS misc
     FROM expenses e ${where}`,
    values,
  );
  const summary = summaryResult.rows[0];

  return {
    expenses: result.rows.map(mapJoinedExpense),
    pagination: paginate(query.page, query.limit, total),
    summary: {
      total_amount: Number(summary.total_amount),
      by_type: {
        toll: Number(summary.toll),
        parking: Number(summary.parking),
        fine: Number(summary.fine),
        misc: Number(summary.misc),
      },
    },
  };
};

export const deleteExpense = async (id: string): Promise<void> => {
  if (!isUuid(id)) {
    throw expenseNotFound();
  }
  const result = await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    throw expenseNotFound();
  }
};
