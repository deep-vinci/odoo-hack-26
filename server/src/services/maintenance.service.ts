import pool from "../config/db";
import { ApiError } from "../utils/ApiError";
import { isUuid } from "../utils/uuid";
import { VEHICLE_STATUS_LABELS, type VehicleStatus } from "../constants/vehicle";
import type { MaintenanceStatus } from "../constants/maintenance";
import type {
  CloseMaintenanceInput,
  CreateMaintenanceInput,
  MaintenanceListQuery,
  UpdateMaintenanceInput,
} from "../validators/maintenance.validator";

const PG_UNIQUE_VIOLATION = "23505";

interface MaintenanceRow {
  id: string;
  title: string;
  description: string | null;
  cost: string;
  status: MaintenanceStatus;
  opened_at: string;
  closed_at: string | null;
  created_by: string;
  created_at: string;
  vehicle_id: string;
  vehicle_registration_number: string;
  vehicle_name: string;
}

type InsertedMaintenanceRow = Omit<
  MaintenanceRow,
  "vehicle_registration_number" | "vehicle_name"
>;

export interface MaintenanceRecord {
  id: string;
  vehicle: { id: string; registration_number: string; name: string };
  title: string;
  description: string | null;
  cost: number;
  status: MaintenanceStatus;
  opened_at: string;
  closed_at: string | null;
  created_by: string;
  created_at: string;
}

export interface MaintenanceWithVehicleStatus {
  maintenance: MaintenanceRecord;
  vehicle_status: VehicleStatus;
}

const MAINTENANCE_SELECT = `
  SELECT m.id, m.title, m.description, m.cost, m.status, m.opened_at, m.closed_at,
         m.created_by, m.created_at,
         v.id AS vehicle_id,
         v.registration_number AS vehicle_registration_number,
         v.name AS vehicle_name
  FROM maintenance_logs m
  JOIN vehicles v ON v.id = m.vehicle_id`;

const mapMaintenance = (row: MaintenanceRow): MaintenanceRecord => ({
  id: row.id,
  vehicle: {
    id: row.vehicle_id,
    registration_number: row.vehicle_registration_number,
    name: row.vehicle_name,
  },
  title: row.title,
  description: row.description,
  cost: Number(row.cost),
  status: row.status,
  opened_at: row.opened_at,
  closed_at: row.closed_at,
  created_by: row.created_by,
  created_at: row.created_at,
});

const maintenanceNotFound = (): ApiError =>
  ApiError.notFound(
    "MAINTENANCE_NOT_FOUND",
    "Maintenance record with the given ID does not exist",
  );

const vehicleNotFound = (): ApiError =>
  ApiError.notFound("VEHICLE_NOT_FOUND", "Vehicle with the given ID does not exist");

const maintenanceClosed = (): ApiError =>
  ApiError.conflict("MAINTENANCE_CLOSED", "Closed maintenance records cannot be edited");

const getMaintenanceRow = async (id: string): Promise<MaintenanceRecord> => {
  if (!isUuid(id)) {
    throw maintenanceNotFound();
  }
  const result = await pool.query<MaintenanceRow>(
    `${MAINTENANCE_SELECT} WHERE m.id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) {
    throw maintenanceNotFound();
  }
  return mapMaintenance(row);
};

export const getMaintenanceById = getMaintenanceRow;

export const createMaintenance = async (
  input: CreateMaintenanceInput,
  createdBy: string,
): Promise<MaintenanceWithVehicleStatus> => {
  if (!isUuid(input.vehicle_id)) {
    throw vehicleNotFound();
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const vehicleResult = await client.query<{
      id: string;
      registration_number: string;
      name: string;
      status: VehicleStatus;
    }>(
      "SELECT id, registration_number, name, status FROM vehicles WHERE id = $1 FOR UPDATE",
      [input.vehicle_id],
    );
    const vehicle = vehicleResult.rows[0];
    if (!vehicle) {
      throw vehicleNotFound();
    }

    if (vehicle.status === "in_shop") {
      throw ApiError.conflict(
        "MAINTENANCE_ALREADY_OPEN",
        `Vehicle ${vehicle.registration_number} already has an open maintenance record`,
      );
    }
    if (vehicle.status !== "available") {
      const remedy =
        vehicle.status === "on_trip"
          ? "Complete or cancel the active trip before opening maintenance."
          : "Reactivate it before opening maintenance.";
      throw ApiError.conflict(
        "VEHICLE_NOT_AVAILABLE_FOR_MAINTENANCE",
        `Vehicle ${vehicle.registration_number} is currently ${VEHICLE_STATUS_LABELS[vehicle.status]}. ${remedy}`,
      );
    }

    let inserted;
    try {
      inserted = await client.query<InsertedMaintenanceRow>(
        `INSERT INTO maintenance_logs (vehicle_id, title, description, cost, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, description, cost, status, opened_at, closed_at,
           created_by, created_at, vehicle_id`,
        [input.vehicle_id, input.title, input.description, input.cost, createdBy],
      );
    } catch (err) {
      if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        throw ApiError.conflict(
          "MAINTENANCE_ALREADY_OPEN",
          `Vehicle ${vehicle.registration_number} already has an open maintenance record`,
        );
      }
      throw err;
    }

    await client.query(
      "UPDATE vehicles SET status = 'in_shop', updated_at = now() WHERE id = $1",
      [input.vehicle_id],
    );

    await client.query("COMMIT");

    const row: MaintenanceRow = {
      ...inserted.rows[0],
      vehicle_registration_number: vehicle.registration_number,
      vehicle_name: vehicle.name,
    };
    return { maintenance: mapMaintenance(row), vehicle_status: "in_shop" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const buildFilters = (
  query: MaintenanceListQuery,
): { where: string; values: unknown[] } => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (query.status) {
    values.push(query.status);
    conditions.push(`m.status = $${values.length}`);
  }
  if (query.vehicleId && isUuid(query.vehicleId)) {
    values.push(query.vehicleId);
    conditions.push(`m.vehicle_id = $${values.length}`);
  }
  if (query.search) {
    values.push(`%${query.search}%`);
    conditions.push(`m.title ILIKE $${values.length}`);
  }
  if (query.fromDate) {
    values.push(query.fromDate);
    conditions.push(`m.opened_at >= $${values.length}::date`);
  }
  if (query.toDate) {
    values.push(query.toDate);
    conditions.push(`m.opened_at < ($${values.length}::date + INTERVAL '1 day')`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, values };
};

const paginate = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  total_pages: Math.max(1, Math.ceil(total / limit)),
});

export interface MaintenanceListResult {
  maintenance_records: MaintenanceRecord[];
  pagination: ReturnType<typeof paginate>;
  summary: { open_count: number; total_cost_this_month: number };
}

export const listMaintenance = async (
  query: MaintenanceListQuery,
): Promise<MaintenanceListResult> => {
  const { where, values } = buildFilters(query);

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM maintenance_logs m ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].count);

  const offset = (query.page - 1) * query.limit;
  const listValues = [...values, query.limit, offset];
  const result = await pool.query<MaintenanceRow>(
    `${MAINTENANCE_SELECT} ${where}
     ORDER BY m.${query.sortBy} ${query.sortOrder === "asc" ? "ASC" : "DESC"}
     LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
    listValues,
  );

  const summaryResult = await pool.query<{
    open_count: string;
    total_cost_this_month: string;
  }>(
    `SELECT
       COUNT(*) FILTER (WHERE m.status = 'open') AS open_count,
       COALESCE(SUM(m.cost) FILTER (WHERE m.opened_at >= date_trunc('month', now())), 0)
         AS total_cost_this_month
     FROM maintenance_logs m ${where}`,
    values,
  );
  const summary = summaryResult.rows[0];

  return {
    maintenance_records: result.rows.map(mapMaintenance),
    pagination: paginate(query.page, query.limit, total),
    summary: {
      open_count: Number(summary.open_count),
      total_cost_this_month: Number(summary.total_cost_this_month),
    },
  };
};

export const updateMaintenance = async (
  id: string,
  input: UpdateMaintenanceInput,
): Promise<MaintenanceRecord> => {
  if (!isUuid(id)) {
    throw maintenanceNotFound();
  }

  const existing = await pool.query<{ status: MaintenanceStatus }>(
    "SELECT status FROM maintenance_logs WHERE id = $1",
    [id],
  );
  const row = existing.rows[0];
  if (!row) {
    throw maintenanceNotFound();
  }
  if (row.status === "closed") {
    throw maintenanceClosed();
  }

  const assignments: string[] = [];
  const values: unknown[] = [];
  const set = (column: string, value: unknown): void => {
    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  };

  if (input.title !== undefined) set("title", input.title);
  if (input.description !== undefined) set("description", input.description);
  if (input.cost !== undefined) set("cost", input.cost);

  assignments.push("updated_at = now()");
  values.push(id);

  await pool.query(
    `UPDATE maintenance_logs SET ${assignments.join(", ")} WHERE id = $${values.length}`,
    values,
  );

  return getMaintenanceRow(id);
};

export const closeMaintenance = async (
  id: string,
  input: CloseMaintenanceInput,
): Promise<MaintenanceWithVehicleStatus> => {
  if (!isUuid(id)) {
    throw maintenanceNotFound();
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const maintResult = await client.query<{
      id: string;
      vehicle_id: string;
      status: MaintenanceStatus;
      cost: string;
    }>(
      "SELECT id, vehicle_id, status, cost FROM maintenance_logs WHERE id = $1 FOR UPDATE",
      [id],
    );
    const maintenance = maintResult.rows[0];
    if (!maintenance) {
      throw maintenanceNotFound();
    }
    if (maintenance.status === "closed") {
      throw ApiError.conflict("MAINTENANCE_CLOSED", "This maintenance record is already closed");
    }

    const vehicleResult = await client.query<{ status: VehicleStatus }>(
      "SELECT status FROM vehicles WHERE id = $1 FOR UPDATE",
      [maintenance.vehicle_id],
    );
    const vehicle = vehicleResult.rows[0];

    const finalCost = input.cost ?? Number(maintenance.cost);
    await client.query(
      `UPDATE maintenance_logs
       SET status = 'closed', closed_at = now(), cost = $1, updated_at = now()
       WHERE id = $2`,
      [finalCost, id],
    );

    let vehicleStatus: VehicleStatus = vehicle?.status ?? "available";
    if (vehicle && vehicle.status === "in_shop") {
      await client.query(
        "UPDATE vehicles SET status = 'available', updated_at = now() WHERE id = $1",
        [maintenance.vehicle_id],
      );
      vehicleStatus = "available";
    }

    await client.query("COMMIT");

    return { maintenance: await getMaintenanceRow(id), vehicle_status: vehicleStatus };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export interface VehicleMaintenanceHistory {
  maintenance_records: MaintenanceRecord[];
  pagination: ReturnType<typeof paginate>;
  summary: {
    total_records: number;
    total_maintenance_cost: number;
    last_maintenance_at: string | null;
  };
}

export const getVehicleMaintenanceHistory = async (
  vehicleId: string,
  query: MaintenanceListQuery,
): Promise<VehicleMaintenanceHistory> => {
  if (!isUuid(vehicleId)) {
    throw vehicleNotFound();
  }
  const vehicleExists = await pool.query("SELECT 1 FROM vehicles WHERE id = $1", [vehicleId]);
  if (vehicleExists.rowCount === 0) {
    throw vehicleNotFound();
  }

  const { where, values } = buildFilters({ ...query, vehicleId });

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM maintenance_logs m ${where}`,
    values,
  );
  const total = Number(countResult.rows[0].count);

  const offset = (query.page - 1) * query.limit;
  const listValues = [...values, query.limit, offset];
  const result = await pool.query<MaintenanceRow>(
    `${MAINTENANCE_SELECT} ${where}
     ORDER BY m.${query.sortBy} ${query.sortOrder === "asc" ? "ASC" : "DESC"}
     LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
    listValues,
  );

  const summaryResult = await pool.query<{
    total_records: string;
    total_maintenance_cost: string;
    last_maintenance_at: string | null;
  }>(
    `SELECT COUNT(*) AS total_records,
            COALESCE(SUM(cost), 0) AS total_maintenance_cost,
            MAX(opened_at) AS last_maintenance_at
     FROM maintenance_logs
     WHERE vehicle_id = $1`,
    [vehicleId],
  );
  const summary = summaryResult.rows[0];

  return {
    maintenance_records: result.rows.map(mapMaintenance),
    pagination: paginate(query.page, query.limit, total),
    summary: {
      total_records: Number(summary.total_records),
      total_maintenance_cost: Number(summary.total_maintenance_cost),
      last_maintenance_at: summary.last_maintenance_at,
    },
  };
};
