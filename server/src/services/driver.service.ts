import pool from "../config/db";
import { ApiError } from "../utils/ApiError";
import { isUuid } from "../utils/uuid";
import {
  DRIVER_STATUS_LABELS,
  DRIVER_STATUS_TRANSITIONS,
  type DriverStatus,
} from "../constants/driverStatus";
import type {
  CreateDriverInput,
  DriverListQuery,
  UpdateDriverInput,
} from "../validators/driver.validator";

const PG_UNIQUE_VIOLATION = "23505";

export interface DriverRecord {
  id: string;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: DriverStatus;
  license_expired: boolean;
  created_at: string;
  updated_at: string;
}

const DRIVER_RETURNING = `
  id, name, license_number, license_category,
  license_expiry_date::text AS license_expiry_date,
  contact_number,
  safety_score::float8 AS safety_score,
  status,
  (license_expiry_date < CURRENT_DATE) AS license_expired,
  created_at, updated_at
`;

const driverNotFound = (): ApiError =>
  ApiError.notFound("DRIVER_NOT_FOUND", "Driver with the given ID does not exist");

const licenseNumberExists = (): ApiError =>
  ApiError.conflict(
    "LICENSE_NUMBER_EXISTS",
    "A driver with this license number already exists",
  );

export const createDriver = async (
  input: CreateDriverInput,
): Promise<DriverRecord> => {
  try {
    const result = await pool.query<DriverRecord>(
      `INSERT INTO drivers
         (name, license_number, license_category, license_expiry_date, contact_number, safety_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${DRIVER_RETURNING}`,
      [
        input.name,
        input.license_number,
        input.license_category,
        input.license_expiry_date,
        input.contact_number,
        input.safety_score,
      ],
    );
    return result.rows[0];
  } catch (err) {
    if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) {
      throw licenseNumberExists();
    }
    throw err;
  }
};

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ListDriversResult {
  drivers: DriverRecord[];
  pagination: Pagination;
}

export const listDrivers = async (
  query: DriverListQuery,
): Promise<ListDriversResult> => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  const status = query.availableForDispatch ? "available" : query.status;
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (query.availableForDispatch) {
    conditions.push("license_expiry_date >= CURRENT_DATE");
  }

  if (query.search) {
    values.push(`%${query.search}%`);
    conditions.push(
      `(name ILIKE $${values.length} OR license_number ILIKE $${values.length})`,
    );
  }

  if (query.licenseExpiringWithinDays !== undefined) {
    values.push(query.licenseExpiringWithinDays);
    conditions.push(`license_expiry_date <= CURRENT_DATE + $${values.length}::int`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM drivers ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].count);

  const offset = (query.page - 1) * query.limit;
  const listValues = [...values, query.limit, offset];
  const result = await pool.query<DriverRecord>(
    `SELECT ${DRIVER_RETURNING} FROM drivers ${where}
     ORDER BY ${query.sortBy} ${query.sortOrder === "asc" ? "ASC" : "DESC"}
     LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
    listValues,
  );

  return {
    drivers: result.rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      total_pages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};

export interface ActiveTrip {
  id: string;
  trip_number: string;
  source: string;
  destination: string;
  dispatched_at: string;
}

export interface DriverStats {
  total_trips: number;
  completed_trips: number;
  cancelled_trips: number;
}

export interface DriverDetailResult {
  driver: DriverRecord;
  active_trip: ActiveTrip | null;
  stats: DriverStats;
}

export const getDriverById = async (id: string): Promise<DriverDetailResult> => {
  if (!isUuid(id)) {
    throw driverNotFound();
  }

  const driverResult = await pool.query<DriverRecord>(
    `SELECT ${DRIVER_RETURNING} FROM drivers WHERE id = $1`,
    [id],
  );
  const driver = driverResult.rows[0];
  if (!driver) {
    throw driverNotFound();
  }

  const [tripResult, statsResult] = await Promise.all([
    pool.query<ActiveTrip>(
      `SELECT id, trip_number, source, destination, dispatched_at
       FROM trips
       WHERE driver_id = $1 AND status = 'dispatched'
       ORDER BY dispatched_at DESC
       LIMIT 1`,
      [id],
    ),
    pool.query<{
      total_trips: string;
      completed_trips: string;
      cancelled_trips: string;
    }>(
      `SELECT
         COUNT(*) AS total_trips,
         COUNT(*) FILTER (WHERE status = 'completed') AS completed_trips,
         COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_trips
       FROM trips
       WHERE driver_id = $1`,
      [id],
    ),
  ]);

  const statsRow = statsResult.rows[0];

  return {
    driver,
    active_trip: tripResult.rows[0] ?? null,
    stats: {
      total_trips: Number(statsRow.total_trips),
      completed_trips: Number(statsRow.completed_trips),
      cancelled_trips: Number(statsRow.cancelled_trips),
    },
  };
};

export const updateDriver = async (
  id: string,
  input: UpdateDriverInput,
): Promise<DriverRecord> => {
  if (!isUuid(id)) {
    throw driverNotFound();
  }

  const exists = await pool.query("SELECT 1 FROM drivers WHERE id = $1", [id]);
  if (exists.rowCount === 0) {
    throw driverNotFound();
  }

  const assignments: string[] = [];
  const values: unknown[] = [];
  const set = (column: string, value: unknown): void => {
    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  };

  if (input.name !== undefined) set("name", input.name);
  if (input.license_number !== undefined) set("license_number", input.license_number);
  if (input.license_category !== undefined) set("license_category", input.license_category);
  if (input.license_expiry_date !== undefined) set("license_expiry_date", input.license_expiry_date);
  if (input.contact_number !== undefined) set("contact_number", input.contact_number);

  assignments.push("updated_at = now()");
  values.push(id);

  try {
    const result = await pool.query<DriverRecord>(
      `UPDATE drivers SET ${assignments.join(", ")}
       WHERE id = $${values.length}
       RETURNING ${DRIVER_RETURNING}`,
      values,
    );
    return result.rows[0];
  } catch (err) {
    if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) {
      throw licenseNumberExists();
    }
    throw err;
  }
};

const assertManualTransition = (
  current: DriverStatus,
  target: DriverStatus,
): void => {
  if (target === "on_trip") {
    throw new ApiError(
      409,
      "INVALID_STATUS_TRANSITION",
      `Status "${DRIVER_STATUS_LABELS.on_trip}" is managed by the system and cannot be set manually.`,
    );
  }

  if (current === "on_trip") {
    throw new ApiError(
      409,
      "INVALID_STATUS_TRANSITION",
      "Cannot change the status of a driver who is currently On Trip. Complete or cancel the active trip first.",
    );
  }

  if (!DRIVER_STATUS_TRANSITIONS[current].includes(target)) {
    throw new ApiError(
      409,
      "INVALID_STATUS_TRANSITION",
      `Cannot change driver status from ${DRIVER_STATUS_LABELS[current]} to ${DRIVER_STATUS_LABELS[target]}.`,
    );
  }
};

export const changeDriverStatus = async (
  id: string,
  status: DriverStatus,
): Promise<DriverRecord> => {
  if (!isUuid(id)) {
    throw driverNotFound();
  }

  const current = await pool.query<{ status: DriverStatus }>(
    "SELECT status FROM drivers WHERE id = $1",
    [id],
  );
  const currentRow = current.rows[0];
  if (!currentRow) {
    throw driverNotFound();
  }

  assertManualTransition(currentRow.status, status);

  const result = await pool.query<DriverRecord>(
    `UPDATE drivers SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING ${DRIVER_RETURNING}`,
    [status, id],
  );
  return result.rows[0];
};

export const updateSafetyScore = async (
  id: string,
  safetyScore: number,
): Promise<DriverRecord> => {
  if (!isUuid(id)) {
    throw driverNotFound();
  }

  const result = await pool.query<DriverRecord>(
    `UPDATE drivers SET safety_score = $1, updated_at = now()
     WHERE id = $2
     RETURNING ${DRIVER_RETURNING}`,
    [safetyScore, id],
  );
  const driver = result.rows[0];
  if (!driver) {
    throw driverNotFound();
  }
  return driver;
};

export interface ExpiringLicenseRow {
  id: string;
  name: string;
  license_number: string;
  license_expiry_date: string;
  license_expired: boolean;
  days_until_expiry: number;
  contact_number: string;
  status: DriverStatus;
}

export interface ExpiringLicensesResult {
  drivers: ExpiringLicenseRow[];
  summary: {
    expired: number;
    expiring_soon: number;
  };
}

export const listExpiringLicenses = async (
  days: number,
): Promise<ExpiringLicensesResult> => {
  const result = await pool.query<ExpiringLicenseRow>(
    `SELECT
       id, name, license_number,
       license_expiry_date::text AS license_expiry_date,
       (license_expiry_date < CURRENT_DATE) AS license_expired,
       (license_expiry_date - CURRENT_DATE) AS days_until_expiry,
       contact_number, status
     FROM drivers
     WHERE license_expiry_date <= CURRENT_DATE + $1::int
     ORDER BY license_expiry_date ASC`,
    [days],
  );

  const drivers = result.rows;
  const expired = drivers.filter((d) => d.license_expired).length;

  return {
    drivers,
    summary: {
      expired,
      expiring_soon: drivers.length - expired,
    },
  };
};
