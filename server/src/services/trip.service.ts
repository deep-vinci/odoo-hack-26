import pool from "../config/db";
import { ApiError } from "../utils/ApiError";
import { isUuid } from "../utils/uuid";
import { TRIP_STATUS_LABELS, type TripStatus } from "../constants/tripStatus";
import { VEHICLE_STATUS_LABELS, type VehicleStatus } from "../constants/vehicle";
import { DRIVER_STATUS_LABELS, type DriverStatus } from "../constants/driverStatus";
import type {
  CompleteTripInput,
  CreateTripInput,
  DispatchTripInput,
  TripListQuery,
} from "../validators/trip.validator";

const PG_UNIQUE_VIOLATION = "23505";

const TRIP_DETAIL_SELECT = `
  SELECT
    t.id, t.trip_number, t.source, t.destination,
    json_build_object(
      'id', v.id,
      'registration_number', v.registration_number,
      'name', v.name,
      'max_load_capacity_kg', v.max_load_capacity_kg::float8
    ) AS vehicle,
    json_build_object(
      'id', d.id,
      'name', d.name,
      'license_expiry_date', d.license_expiry_date::text
    ) AS driver,
    t.cargo_weight_kg::float8 AS cargo_weight_kg,
    t.planned_distance_km::float8 AS planned_distance_km,
    t.revenue::float8 AS revenue,
    t.status,
    t.start_odometer_km::float8 AS start_odometer_km,
    t.end_odometer_km::float8 AS end_odometer_km,
    t.dispatched_at, t.completed_at, t.cancelled_at,
    t.created_by, t.created_at
  FROM trips t
  JOIN vehicles v ON v.id = t.vehicle_id
  JOIN drivers d ON d.id = t.driver_id
`;

const TRIP_LIST_SELECT = `
  SELECT
    t.id, t.trip_number, t.source, t.destination,
    json_build_object(
      'id', v.id,
      'registration_number', v.registration_number,
      'name', v.name
    ) AS vehicle,
    json_build_object('id', d.id, 'name', d.name) AS driver,
    t.cargo_weight_kg::float8 AS cargo_weight_kg,
    t.planned_distance_km::float8 AS planned_distance_km,
    t.revenue::float8 AS revenue,
    t.status, t.dispatched_at, t.created_at
  FROM trips t
  JOIN vehicles v ON v.id = t.vehicle_id
  JOIN drivers d ON d.id = t.driver_id
`;

const VEHICLE_ASSIGN_SELECT = `
  SELECT id, registration_number, name, status,
         odometer_km::float8 AS odometer_km,
         max_load_capacity_kg::float8 AS max_load_capacity_kg
  FROM vehicles WHERE id = $1
`;

const DRIVER_ASSIGN_SELECT = `
  SELECT id, name, status,
         license_expiry_date::text AS license_expiry_date,
         (license_expiry_date < CURRENT_DATE) AS license_expired
  FROM drivers WHERE id = $1
`;

interface TripVehicleRef {
  id: string;
  registration_number: string;
  name: string;
  max_load_capacity_kg?: number;
}

interface TripDriverRef {
  id: string;
  name: string;
  license_expiry_date?: string;
}

export interface TripRecord {
  id: string;
  trip_number: string;
  source: string;
  destination: string;
  vehicle: TripVehicleRef;
  driver: TripDriverRef;
  cargo_weight_kg: number;
  planned_distance_km: number;
  revenue: number | null;
  status: TripStatus;
  start_odometer_km: number | null;
  end_odometer_km: number | null;
  dispatched_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_by: string;
  created_at: string;
}

interface AssignableVehicle {
  id: string;
  registration_number: string;
  name: string;
  status: VehicleStatus;
  odometer_km: number;
  max_load_capacity_kg: number;
}

interface AssignableDriver {
  id: string;
  name: string;
  status: DriverStatus;
  license_expiry_date: string;
  license_expired: boolean;
}

const tripNotFound = (): ApiError =>
  ApiError.notFound("TRIP_NOT_FOUND", "Trip with the given ID does not exist");

const vehicleNotFound = (): ApiError =>
  ApiError.notFound("VEHICLE_NOT_FOUND", "Vehicle with the given ID does not exist");

const driverNotFound = (): ApiError =>
  ApiError.notFound("DRIVER_NOT_FOUND", "Driver with the given ID does not exist");

const invalidTripStatus = (action: string, allowed: string, current: TripStatus): ApiError =>
  new ApiError(
    409,
    "INVALID_TRIP_STATUS",
    `Only trips in ${allowed} status can be ${action}. Current status: ${TRIP_STATUS_LABELS[current]}`,
  );

const assertAssignable = (
  vehicle: AssignableVehicle,
  driver: AssignableDriver,
  cargoWeightKg: number,
): void => {
  if (vehicle.status !== "available") {
    throw new ApiError(
      409,
      "VEHICLE_NOT_AVAILABLE",
      `Vehicle ${vehicle.registration_number} is currently ${VEHICLE_STATUS_LABELS[vehicle.status]} and cannot be assigned`,
    );
  }

  if (driver.status === "suspended") {
    throw new ApiError(
      409,
      "DRIVER_SUSPENDED",
      `Driver ${driver.name} is suspended and cannot be assigned to trips`,
    );
  }

  if (driver.status !== "available") {
    throw new ApiError(
      409,
      "DRIVER_NOT_AVAILABLE",
      `Driver ${driver.name} is currently ${DRIVER_STATUS_LABELS[driver.status]} and cannot be assigned`,
    );
  }

  if (driver.license_expired) {
    throw new ApiError(
      409,
      "DRIVER_LICENSE_EXPIRED",
      `Driver ${driver.name}'s license expired on ${driver.license_expiry_date} and cannot be assigned to trips`,
    );
  }

  if (cargoWeightKg > vehicle.max_load_capacity_kg) {
    throw new ApiError(
      422,
      "CARGO_EXCEEDS_CAPACITY",
      `Cargo weight ${cargoWeightKg} kg exceeds vehicle maximum load capacity of ${vehicle.max_load_capacity_kg} kg`,
    );
  }
};

export const createTrip = async (
  input: CreateTripInput,
  userId: string,
): Promise<TripRecord> => {
  if (!isUuid(input.vehicle_id)) {
    throw vehicleNotFound();
  }
  const vehicleResult = await pool.query<AssignableVehicle>(VEHICLE_ASSIGN_SELECT, [
    input.vehicle_id,
  ]);
  const vehicle = vehicleResult.rows[0];
  if (!vehicle) {
    throw vehicleNotFound();
  }

  if (!isUuid(input.driver_id)) {
    throw driverNotFound();
  }
  const driverResult = await pool.query<AssignableDriver>(DRIVER_ASSIGN_SELECT, [
    input.driver_id,
  ]);
  const driver = driverResult.rows[0];
  if (!driver) {
    throw driverNotFound();
  }

  assertAssignable(vehicle, driver, input.cargo_weight_kg);

  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO trips
       (trip_number, source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km, revenue, created_by)
     VALUES ('TRP-' || lpad(nextval('trip_number_seq')::text, 6, '0'), $1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      input.source,
      input.destination,
      input.vehicle_id,
      input.driver_id,
      input.cargo_weight_kg,
      input.planned_distance_km,
      input.revenue,
      userId,
    ],
  );

  const detail = await pool.query<TripRecord>(
    `${TRIP_DETAIL_SELECT} WHERE t.id = $1`,
    [inserted.rows[0].id],
  );
  return detail.rows[0];
};

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface TripListItem {
  id: string;
  trip_number: string;
  source: string;
  destination: string;
  vehicle: TripVehicleRef;
  driver: TripDriverRef;
  cargo_weight_kg: number;
  planned_distance_km: number;
  revenue: number | null;
  status: TripStatus;
  dispatched_at: string | null;
  created_at: string;
}

export interface ListTripsResult {
  trips: TripListItem[];
  pagination: Pagination;
}

export const listTrips = async (query: TripListQuery): Promise<ListTripsResult> => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (query.status) {
    values.push(query.status);
    conditions.push(`t.status = $${values.length}`);
  }
  if (query.vehicleId) {
    values.push(query.vehicleId);
    conditions.push(`t.vehicle_id = $${values.length}`);
  }
  if (query.driverId) {
    values.push(query.driverId);
    conditions.push(`t.driver_id = $${values.length}`);
  }
  if (query.search) {
    values.push(`%${query.search}%`);
    conditions.push(
      `(t.trip_number ILIKE $${values.length} OR t.source ILIKE $${values.length} OR t.destination ILIKE $${values.length})`,
    );
  }
  if (query.fromDate) {
    values.push(query.fromDate);
    conditions.push(`t.created_at >= $${values.length}::date`);
  }
  if (query.toDate) {
    values.push(query.toDate);
    conditions.push(`t.created_at < ($${values.length}::date + 1)`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM trips t ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].count);

  const offset = (query.page - 1) * query.limit;
  const listValues = [...values, query.limit, offset];
  const result = await pool.query<TripListItem>(
    `${TRIP_LIST_SELECT} ${where}
     ORDER BY t.${query.sortBy} ${query.sortOrder === "asc" ? "ASC" : "DESC"}
     LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
    listValues,
  );

  return {
    trips: result.rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      total_pages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};

interface TripFuelLog {
  id: string;
  liters: number;
  cost: number;
  filled_at: string;
}

interface TripExpense {
  id: string;
  type: string;
  amount: number;
  incurred_at: string;
}

export interface TripDetailResult {
  trip: TripRecord;
  actual_distance_km: number | null;
  fuel_logs: TripFuelLog[];
  expenses: TripExpense[];
}

export const getTripById = async (id: string): Promise<TripDetailResult> => {
  if (!isUuid(id)) {
    throw tripNotFound();
  }

  const detail = await pool.query<TripRecord>(
    `${TRIP_DETAIL_SELECT} WHERE t.id = $1`,
    [id],
  );
  const trip = detail.rows[0];
  if (!trip) {
    throw tripNotFound();
  }

  const [fuelResult, expenseResult] = await Promise.all([
    pool.query<TripFuelLog>(
      `SELECT id, liters::float8 AS liters, cost::float8 AS cost, filled_at::text AS filled_at
       FROM fuel_logs WHERE trip_id = $1 ORDER BY created_at DESC`,
      [id],
    ),
    pool.query<TripExpense>(
      `SELECT id, type, amount::float8 AS amount, incurred_at::text AS incurred_at
       FROM expenses WHERE trip_id = $1 ORDER BY created_at DESC`,
      [id],
    ),
  ]);

  const actualDistance =
    trip.start_odometer_km !== null && trip.end_odometer_km !== null
      ? trip.end_odometer_km - trip.start_odometer_km
      : null;

  return {
    trip,
    actual_distance_km: actualDistance,
    fuel_logs: fuelResult.rows,
    expenses: expenseResult.rows,
  };
};

interface LockedTripRow {
  id: string;
  trip_number: string;
  status: TripStatus;
  vehicle_id: string;
  driver_id: string;
  cargo_weight_kg: number;
  start_odometer_km: number | null;
}

const LOCK_TRIP_SELECT = `
  SELECT id, trip_number, status, vehicle_id, driver_id,
         cargo_weight_kg::float8 AS cargo_weight_kg,
         start_odometer_km::float8 AS start_odometer_km
  FROM trips WHERE id = $1 FOR UPDATE
`;

export interface DispatchTripResult {
  trip: {
    id: string;
    trip_number: string;
    status: TripStatus;
    start_odometer_km: number;
    dispatched_at: string;
  };
  vehicle_status: VehicleStatus;
  driver_status: DriverStatus;
}

export const dispatchTrip = async (
  id: string,
  input: DispatchTripInput,
): Promise<DispatchTripResult> => {
  if (!isUuid(id)) {
    throw tripNotFound();
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tripResult = await client.query<LockedTripRow>(LOCK_TRIP_SELECT, [id]);
    const trip = tripResult.rows[0];
    if (!trip) {
      throw tripNotFound();
    }
    if (trip.status !== "draft") {
      throw invalidTripStatus("dispatched", "Draft", trip.status);
    }

    const vehicleResult = await client.query<AssignableVehicle>(
      `${VEHICLE_ASSIGN_SELECT} FOR UPDATE`,
      [trip.vehicle_id],
    );
    const vehicle = vehicleResult.rows[0];
    const driverResult = await client.query<AssignableDriver>(
      `${DRIVER_ASSIGN_SELECT} FOR UPDATE`,
      [trip.driver_id],
    );
    const driver = driverResult.rows[0];

    assertAssignable(vehicle, driver, trip.cargo_weight_kg);

    let startOdometer = vehicle.odometer_km;
    if (input.start_odometer_km !== undefined) {
      if (input.start_odometer_km < vehicle.odometer_km) {
        throw ApiError.validation([
          {
            field: "start_odometer_km",
            message: `Start odometer cannot be less than vehicle's current odometer (${vehicle.odometer_km})`,
          },
        ]);
      }
      startOdometer = input.start_odometer_km;
    }

    const updated = await client.query<DispatchTripResult["trip"]>(
      `UPDATE trips
       SET status = 'dispatched', dispatched_at = now(), start_odometer_km = $1, updated_at = now()
       WHERE id = $2
       RETURNING id, trip_number, status, start_odometer_km::float8 AS start_odometer_km, dispatched_at`,
      [startOdometer, id],
    );
    await client.query(
      "UPDATE vehicles SET status = 'on_trip', updated_at = now() WHERE id = $1",
      [trip.vehicle_id],
    );
    await client.query(
      "UPDATE drivers SET status = 'on_trip', updated_at = now() WHERE id = $1",
      [trip.driver_id],
    );

    await client.query("COMMIT");

    return {
      trip: updated.rows[0],
      vehicle_status: "on_trip",
      driver_status: "on_trip",
    };
  } catch (err) {
    await client.query("ROLLBACK");
    const pgErr = err as { code?: string; constraint?: string };
    if (pgErr.code === PG_UNIQUE_VIOLATION) {
      if (pgErr.constraint === "uq_trips_active_vehicle") {
        throw new ApiError(
          409,
          "VEHICLE_NOT_AVAILABLE",
          "Vehicle is already assigned to an active trip and cannot be assigned",
        );
      }
      if (pgErr.constraint === "uq_trips_active_driver") {
        throw new ApiError(
          409,
          "DRIVER_NOT_AVAILABLE",
          "Driver is already assigned to an active trip and cannot be assigned",
        );
      }
    }
    throw err;
  } finally {
    client.release();
  }
};

export interface CompleteTripResult {
  trip: {
    id: string;
    trip_number: string;
    status: TripStatus;
    start_odometer_km: number;
    end_odometer_km: number;
    actual_distance_km: number;
    completed_at: string;
  };
  vehicle_status: VehicleStatus;
  driver_status: DriverStatus;
  fuel_log_created: boolean;
}

export const completeTrip = async (
  id: string,
  input: CompleteTripInput,
  userId: string,
): Promise<CompleteTripResult> => {
  if (!isUuid(id)) {
    throw tripNotFound();
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tripResult = await client.query<LockedTripRow>(LOCK_TRIP_SELECT, [id]);
    const trip = tripResult.rows[0];
    if (!trip) {
      throw tripNotFound();
    }
    if (trip.status !== "dispatched") {
      throw invalidTripStatus("completed", "Dispatched", trip.status);
    }

    if (
      trip.start_odometer_km !== null &&
      input.end_odometer_km < trip.start_odometer_km
    ) {
      throw new ApiError(
        422,
        "INVALID_ODOMETER",
        `End odometer (${input.end_odometer_km}) cannot be less than start odometer (${trip.start_odometer_km})`,
      );
    }

    await client.query("SELECT id FROM vehicles WHERE id = $1 FOR UPDATE", [
      trip.vehicle_id,
    ]);
    await client.query("SELECT id FROM drivers WHERE id = $1 FOR UPDATE", [
      trip.driver_id,
    ]);

    const updated = await client.query<CompleteTripResult["trip"]>(
      `UPDATE trips
       SET status = 'completed', completed_at = now(), end_odometer_km = $1,
           revenue = COALESCE($2, revenue), updated_at = now()
       WHERE id = $3
       RETURNING id, trip_number, status,
                 start_odometer_km::float8 AS start_odometer_km,
                 end_odometer_km::float8 AS end_odometer_km,
                 (end_odometer_km - start_odometer_km)::float8 AS actual_distance_km,
                 completed_at`,
      [input.end_odometer_km, input.revenue ?? null, id],
    );
    await client.query(
      "UPDATE vehicles SET odometer_km = $1, status = 'available', updated_at = now() WHERE id = $2",
      [input.end_odometer_km, trip.vehicle_id],
    );
    await client.query(
      "UPDATE drivers SET status = 'available', updated_at = now() WHERE id = $1",
      [trip.driver_id],
    );

    if (input.fuel_consumed) {
      await client.query(
        `INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          trip.vehicle_id,
          id,
          input.fuel_consumed.liters,
          input.fuel_consumed.cost,
          userId,
        ],
      );
    }

    await client.query("COMMIT");

    return {
      trip: updated.rows[0],
      vehicle_status: "available",
      driver_status: "available",
      fuel_log_created: Boolean(input.fuel_consumed),
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export interface CancelTripResult {
  trip: {
    id: string;
    trip_number: string;
    status: TripStatus;
    cancelled_at: string;
  };
  vehicle_status: VehicleStatus;
  driver_status: DriverStatus;
}

export const cancelTrip = async (id: string): Promise<CancelTripResult> => {
  if (!isUuid(id)) {
    throw tripNotFound();
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tripResult = await client.query<LockedTripRow>(LOCK_TRIP_SELECT, [id]);
    const trip = tripResult.rows[0];
    if (!trip) {
      throw tripNotFound();
    }
    if (trip.status !== "draft" && trip.status !== "dispatched") {
      throw invalidTripStatus("cancelled", "Draft or Dispatched", trip.status);
    }

    let vehicleStatus: VehicleStatus;
    let driverStatus: DriverStatus;

    if (trip.status === "dispatched") {
      await client.query("SELECT id FROM vehicles WHERE id = $1 FOR UPDATE", [
        trip.vehicle_id,
      ]);
      await client.query("SELECT id FROM drivers WHERE id = $1 FOR UPDATE", [
        trip.driver_id,
      ]);
    }

    const updated = await client.query<CancelTripResult["trip"]>(
      `UPDATE trips
       SET status = 'cancelled', cancelled_at = now(), updated_at = now()
       WHERE id = $1
       RETURNING id, trip_number, status, cancelled_at`,
      [id],
    );

    if (trip.status === "dispatched") {
      await client.query(
        "UPDATE vehicles SET status = 'available', updated_at = now() WHERE id = $1",
        [trip.vehicle_id],
      );
      await client.query(
        "UPDATE drivers SET status = 'available', updated_at = now() WHERE id = $1",
        [trip.driver_id],
      );
      vehicleStatus = "available";
      driverStatus = "available";
    } else {
      const [vehicleRow, driverRow] = await Promise.all([
        client.query<{ status: VehicleStatus }>(
          "SELECT status FROM vehicles WHERE id = $1",
          [trip.vehicle_id],
        ),
        client.query<{ status: DriverStatus }>(
          "SELECT status FROM drivers WHERE id = $1",
          [trip.driver_id],
        ),
      ]);
      vehicleStatus = vehicleRow.rows[0].status;
      driverStatus = driverRow.rows[0].status;
    }

    await client.query("COMMIT");

    return {
      trip: updated.rows[0],
      vehicle_status: vehicleStatus,
      driver_status: driverStatus,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
