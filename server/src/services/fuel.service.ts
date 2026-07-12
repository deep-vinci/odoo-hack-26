import pool from "../config/db";
import { ApiError } from "../utils/ApiError";
import { isUuid } from "../utils/uuid";
import { offsetOf, paginate, type Pagination } from "../utils/pagination";
import { resolveVehicleAndTrip, type TripRef, type VehicleRef } from "./ledger.helpers";
import type { CreateFuelLogInput, FuelLogListQuery } from "../validators/fuel.validator";

export interface FuelLog {
  id: string;
  vehicle: VehicleRef;
  trip: TripRef | null;
  liters: number;
  cost: number;
  cost_per_liter: number;
  filled_at: string;
  odometer_km: number | null;
  created_by: string;
  created_at: string;
}

interface FuelCoreRow {
  id: string;
  liters: string;
  cost: string;
  filled_at: string;
  odometer_km: string | null;
  created_by: string;
  created_at: string;
}

interface FuelJoinedRow extends FuelCoreRow {
  vehicle_id: string;
  vehicle_registration_number: string;
  vehicle_name: string;
  trip_id: string | null;
  trip_number: string | null;
}

const costPerLiter = (cost: number, liters: number): number =>
  liters > 0 ? Math.round((cost / liters) * 100) / 100 : 0;

const buildFuelLog = (
  row: FuelCoreRow,
  vehicle: VehicleRef,
  trip: TripRef | null,
): FuelLog => {
  const liters = Number(row.liters);
  const cost = Number(row.cost);
  return {
    id: row.id,
    vehicle,
    trip,
    liters,
    cost,
    cost_per_liter: costPerLiter(cost, liters),
    filled_at: row.filled_at,
    odometer_km: row.odometer_km === null ? null : Number(row.odometer_km),
    created_by: row.created_by,
    created_at: row.created_at,
  };
};

const mapJoinedFuelLog = (row: FuelJoinedRow): FuelLog =>
  buildFuelLog(
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

const fuelLogNotFound = (): ApiError =>
  ApiError.notFound("FUEL_LOG_NOT_FOUND", "Fuel log with the given ID does not exist");

export const createFuelLog = async (
  input: CreateFuelLogInput,
  createdBy: string,
): Promise<FuelLog> => {
  const { vehicle, trip } = await resolveVehicleAndTrip(input.vehicle_id, input.trip_id);

  const result = await pool.query<FuelCoreRow>(
    `INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, filled_at, odometer_km, created_by)
     VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6, $7)
     RETURNING id, liters, cost, filled_at::text AS filled_at, odometer_km, created_by, created_at`,
    [
      input.vehicle_id,
      input.trip_id,
      input.liters,
      input.cost,
      input.filled_at,
      input.odometer_km,
      createdBy,
    ],
  );

  return buildFuelLog(result.rows[0], vehicle, trip);
};

const buildFilters = (query: FuelLogListQuery): { where: string; values: unknown[] } => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (query.vehicleId && isUuid(query.vehicleId)) {
    values.push(query.vehicleId);
    conditions.push(`f.vehicle_id = $${values.length}`);
  }
  if (query.tripId && isUuid(query.tripId)) {
    values.push(query.tripId);
    conditions.push(`f.trip_id = $${values.length}`);
  }
  if (query.fromDate) {
    values.push(query.fromDate);
    conditions.push(`f.filled_at >= $${values.length}::date`);
  }
  if (query.toDate) {
    values.push(query.toDate);
    conditions.push(`f.filled_at <= $${values.length}::date`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, values };
};

export interface FuelLogListResult {
  fuel_logs: FuelLog[];
  pagination: Pagination;
  summary: { total_liters: number; total_cost: number };
}

export const listFuelLogs = async (query: FuelLogListQuery): Promise<FuelLogListResult> => {
  const { where, values } = buildFilters(query);

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM fuel_logs f ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].count);

  const listValues = [...values, query.limit, offsetOf(query.page, query.limit)];
  const result = await pool.query<FuelJoinedRow>(
    `SELECT f.id, f.liters, f.cost, f.filled_at::text AS filled_at, f.odometer_km,
            f.created_by, f.created_at,
            v.id AS vehicle_id, v.registration_number AS vehicle_registration_number,
            v.name AS vehicle_name,
            t.id AS trip_id, t.trip_number AS trip_number
     FROM fuel_logs f
     JOIN vehicles v ON v.id = f.vehicle_id
     LEFT JOIN trips t ON t.id = f.trip_id
     ${where}
     ORDER BY f.${query.sortBy} ${query.sortOrder === "asc" ? "ASC" : "DESC"}
     LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
    listValues,
  );

  const summaryResult = await pool.query<{ total_liters: string; total_cost: string }>(
    `SELECT COALESCE(SUM(liters), 0) AS total_liters, COALESCE(SUM(cost), 0) AS total_cost
     FROM fuel_logs f ${where}`,
    values,
  );
  const summary = summaryResult.rows[0];

  return {
    fuel_logs: result.rows.map(mapJoinedFuelLog),
    pagination: paginate(query.page, query.limit, total),
    summary: {
      total_liters: Number(summary.total_liters),
      total_cost: Number(summary.total_cost),
    },
  };
};

export const deleteFuelLog = async (id: string): Promise<void> => {
  if (!isUuid(id)) {
    throw fuelLogNotFound();
  }
  const result = await pool.query("DELETE FROM fuel_logs WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    throw fuelLogNotFound();
  }
};
