import pool from "../config/db";
import { ApiError } from "../utils/ApiError";
import { isUuid } from "../utils/uuid";
import {
  MANUAL_VEHICLE_STATUSES,
  VEHICLE_STATUS_LABELS,
  type VehicleStatus,
  type VehicleType,
} from "../constants/vehicle";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleListQuery,
} from "../validators/vehicle.validator";

const PG_UNIQUE_VIOLATION = "23505";

const VEHICLE_COLUMNS = `id, registration_number, name, type, max_load_capacity_kg,
  odometer_km, acquisition_cost, region, status, created_at, updated_at`;

interface VehicleRow {
  id: string;
  registration_number: string;
  name: string;
  type: VehicleType;
  max_load_capacity_kg: string;
  odometer_km: string;
  acquisition_cost: string;
  region: string | null;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  name: string;
  type: VehicleType;
  max_load_capacity_kg: number;
  odometer_km: number;
  acquisition_cost: number;
  region: string | null;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}

const mapVehicle = (row: VehicleRow): Vehicle => ({
  ...row,
  max_load_capacity_kg: Number(row.max_load_capacity_kg),
  odometer_km: Number(row.odometer_km),
  acquisition_cost: Number(row.acquisition_cost),
});

const vehicleNotFound = (): ApiError =>
  ApiError.notFound("VEHICLE_NOT_FOUND", "Vehicle with the given ID does not exist");

const registrationExists = (registration: string): ApiError =>
  ApiError.conflict(
    "REGISTRATION_NUMBER_EXISTS",
    `A vehicle with registration number ${registration} already exists`,
  );

export const createVehicle = async (input: CreateVehicleInput): Promise<Vehicle> => {
  try {
    const result = await pool.query<VehicleRow>(
      `INSERT INTO vehicles
         (registration_number, name, type, max_load_capacity_kg, odometer_km, acquisition_cost, region)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${VEHICLE_COLUMNS}`,
      [
        input.registration_number,
        input.name,
        input.type,
        input.max_load_capacity_kg,
        input.odometer_km,
        input.acquisition_cost,
        input.region,
      ],
    );
    return mapVehicle(result.rows[0]);
  } catch (err) {
    if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) {
      throw registrationExists(input.registration_number);
    }
    throw err;
  }
};

export interface VehicleListResult {
  vehicles: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export const listVehicles = async (query: VehicleListQuery): Promise<VehicleListResult> => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  const status = query.availableForDispatch ? "available" : query.status;
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (query.type) {
    values.push(query.type);
    conditions.push(`type = $${values.length}`);
  }
  if (query.region) {
    values.push(query.region);
    conditions.push(`region = $${values.length}`);
  }
  if (query.search) {
    values.push(`%${query.search}%`);
    conditions.push(
      `(registration_number ILIKE $${values.length} OR name ILIKE $${values.length})`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM vehicles ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].count);

  const offset = (query.page - 1) * query.limit;
  const listValues = [...values, query.limit, offset];
  const result = await pool.query<VehicleRow>(
    `SELECT ${VEHICLE_COLUMNS} FROM vehicles ${where}
     ORDER BY ${query.sortBy} ${query.sortOrder === "asc" ? "ASC" : "DESC"}
     LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
    listValues,
  );

  return {
    vehicles: result.rows.map(mapVehicle),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      total_pages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};

interface ActiveTrip {
  id: string;
  trip_number: string;
  source: string;
  destination: string;
  status: string;
  dispatched_at: string | null;
}

interface OpenMaintenance {
  id: string;
  title: string;
  opened_at: string;
}

export interface VehicleDetail {
  vehicle: Vehicle;
  active_trip: ActiveTrip | null;
  open_maintenance: OpenMaintenance | null;
  stats: {
    total_trips: number;
    total_fuel_cost: number;
    total_maintenance_cost: number;
    operational_cost: number;
  };
}

export const getVehicleById = async (id: string): Promise<VehicleDetail> => {
  if (!isUuid(id)) {
    throw vehicleNotFound();
  }

  const vehicleResult = await pool.query<VehicleRow>(
    `SELECT ${VEHICLE_COLUMNS} FROM vehicles WHERE id = $1`,
    [id],
  );
  const row = vehicleResult.rows[0];
  if (!row) {
    throw vehicleNotFound();
  }

  const [tripResult, maintenanceResult, statsResult] = await Promise.all([
    pool.query<ActiveTrip>(
      `SELECT id, trip_number, source, destination, status, dispatched_at
       FROM trips
       WHERE vehicle_id = $1 AND status = 'dispatched'
       ORDER BY dispatched_at DESC
       LIMIT 1`,
      [id],
    ),
    pool.query<OpenMaintenance>(
      `SELECT id, title, opened_at
       FROM maintenance_logs
       WHERE vehicle_id = $1 AND status = 'open'
       ORDER BY opened_at DESC
       LIMIT 1`,
      [id],
    ),
    pool.query<{
      total_trips: string;
      total_fuel_cost: string;
      total_maintenance_cost: string;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM trips WHERE vehicle_id = $1) AS total_trips,
         (SELECT COALESCE(SUM(cost), 0) FROM fuel_logs WHERE vehicle_id = $1) AS total_fuel_cost,
         (SELECT COALESCE(SUM(cost), 0) FROM maintenance_logs WHERE vehicle_id = $1) AS total_maintenance_cost`,
      [id],
    ),
  ]);

  const statsRow = statsResult.rows[0];
  const totalFuelCost = Number(statsRow.total_fuel_cost);
  const totalMaintenanceCost = Number(statsRow.total_maintenance_cost);

  return {
    vehicle: mapVehicle(row),
    active_trip: tripResult.rows[0] ?? null,
    open_maintenance: maintenanceResult.rows[0] ?? null,
    stats: {
      total_trips: Number(statsRow.total_trips),
      total_fuel_cost: totalFuelCost,
      total_maintenance_cost: totalMaintenanceCost,
      operational_cost: totalFuelCost + totalMaintenanceCost,
    },
  };
};

export const updateVehicle = async (
  id: string,
  input: UpdateVehicleInput,
): Promise<Vehicle> => {
  if (!isUuid(id)) {
    throw vehicleNotFound();
  }

  const current = await pool.query<{ odometer_km: string }>(
    "SELECT odometer_km FROM vehicles WHERE id = $1",
    [id],
  );
  const currentRow = current.rows[0];
  if (!currentRow) {
    throw vehicleNotFound();
  }

  if (input.odometer_km !== undefined && input.odometer_km < Number(currentRow.odometer_km)) {
    throw ApiError.validation([
      {
        field: "odometer_km",
        message: `Odometer cannot be decreased (current: ${Number(currentRow.odometer_km)})`,
      },
    ]);
  }

  const assignments: string[] = [];
  const values: unknown[] = [];
  const set = (column: string, value: unknown): void => {
    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  };

  if (input.registration_number !== undefined) set("registration_number", input.registration_number);
  if (input.name !== undefined) set("name", input.name);
  if (input.type !== undefined) set("type", input.type);
  if (input.max_load_capacity_kg !== undefined) set("max_load_capacity_kg", input.max_load_capacity_kg);
  if (input.odometer_km !== undefined) set("odometer_km", input.odometer_km);
  if (input.acquisition_cost !== undefined) set("acquisition_cost", input.acquisition_cost);
  if (input.region !== undefined) set("region", input.region);

  assignments.push("updated_at = now()");
  values.push(id);

  try {
    const result = await pool.query<VehicleRow>(
      `UPDATE vehicles SET ${assignments.join(", ")}
       WHERE id = $${values.length}
       RETURNING ${VEHICLE_COLUMNS}`,
      values,
    );
    return mapVehicle(result.rows[0]);
  } catch (err) {
    if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) {
      throw registrationExists(input.registration_number ?? "");
    }
    throw err;
  }
};

const ALLOWED_MANUAL_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  available: ["available", "retired"],
  retired: ["retired", "available"],
  in_shop: ["retired"],
  on_trip: [],
};

const assertManualTransition = (current: VehicleStatus, target: VehicleStatus): void => {
  if (!MANUAL_VEHICLE_STATUSES.includes(target)) {
    throw new ApiError(
      409,
      "INVALID_STATUS_TRANSITION",
      `Status "${VEHICLE_STATUS_LABELS[target]}" is managed by the system and cannot be set manually.`,
    );
  }

  if (!ALLOWED_MANUAL_TRANSITIONS[current].includes(target)) {
    const action = target === "retired" ? "retire" : "reactivate";
    const remedy =
      current === "on_trip"
        ? "Complete or cancel the active trip first."
        : "Close the open maintenance record first.";
    throw new ApiError(
      409,
      "INVALID_STATUS_TRANSITION",
      `Cannot ${action} a vehicle that is currently ${VEHICLE_STATUS_LABELS[current]}. ${remedy}`,
    );
  }
};

export const changeVehicleStatus = async (
  id: string,
  status: VehicleStatus,
): Promise<Vehicle> => {
  if (!isUuid(id)) {
    throw vehicleNotFound();
  }

  const current = await pool.query<{ status: VehicleStatus }>(
    "SELECT status FROM vehicles WHERE id = $1",
    [id],
  );
  const currentRow = current.rows[0];
  if (!currentRow) {
    throw vehicleNotFound();
  }

  assertManualTransition(currentRow.status, status);

  const result = await pool.query<VehicleRow>(
    `UPDATE vehicles SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING ${VEHICLE_COLUMNS}`,
    [status, id],
  );
  return mapVehicle(result.rows[0]);
};

export const deleteVehicle = async (id: string): Promise<void> => {
  if (!isUuid(id)) {
    throw vehicleNotFound();
  }

  const exists = await pool.query("SELECT 1 FROM vehicles WHERE id = $1", [id]);
  if (exists.rowCount === 0) {
    throw vehicleNotFound();
  }

  const references = await pool.query<{ has_records: boolean }>(
    `SELECT (
       EXISTS(SELECT 1 FROM trips WHERE vehicle_id = $1) OR
       EXISTS(SELECT 1 FROM fuel_logs WHERE vehicle_id = $1) OR
       EXISTS(SELECT 1 FROM maintenance_logs WHERE vehicle_id = $1) OR
       EXISTS(SELECT 1 FROM expenses WHERE vehicle_id = $1)
     ) AS has_records`,
    [id],
  );
  if (references.rows[0].has_records) {
    throw ApiError.conflict(
      "VEHICLE_HAS_RECORDS",
      "Vehicle has associated trips or logs and cannot be deleted. Retire it instead.",
    );
  }

  await pool.query("DELETE FROM vehicles WHERE id = $1", [id]);
};
