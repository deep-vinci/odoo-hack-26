import pool from "../config/db";
import { ApiError } from "../utils/ApiError";
import { isUuid } from "../utils/uuid";

export interface VehicleCosts {
  vehicle: { id: string; registration_number: string; name: string };
  period: { from: string | null; to: string | null };
  costs: {
    fuel_cost: number;
    maintenance_cost: number;
    operational_cost: number;
    other_expenses: number;
    total_spend: number;
  };
  fuel: {
    total_liters: number;
    fill_count: number;
  };
}

const vehicleNotFound = (): ApiError =>
  ApiError.notFound("VEHICLE_NOT_FOUND", "Vehicle with the given ID does not exist");

const dateRange = (
  column: string,
  from: string | null,
  to: string | null,
): { clause: string; values: unknown[] } => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (from) {
    values.push(from);
    conditions.push(`${column} >= $${values.length + 1}::date`);
  }
  if (to) {
    values.push(to);
    conditions.push(`${column} <= $${values.length + 1}::date`);
  }

  return {
    clause: conditions.length > 0 ? ` AND ${conditions.join(" AND ")}` : "",
    values,
  };
};

export const getVehicleCosts = async (
  vehicleId: string,
  from: string | null,
  to: string | null,
): Promise<VehicleCosts> => {
  if (!isUuid(vehicleId)) {
    throw vehicleNotFound();
  }

  const vehicleResult = await pool.query<{
    id: string;
    registration_number: string;
    name: string;
  }>("SELECT id, registration_number, name FROM vehicles WHERE id = $1", [vehicleId]);
  const vehicle = vehicleResult.rows[0];
  if (!vehicle) {
    throw vehicleNotFound();
  }

  const fuelRange = dateRange("filled_at", from, to);
  const maintenanceRange = dateRange("opened_at", from, to);
  const expenseRange = dateRange("incurred_at", from, to);

  const [fuelResult, maintenanceResult, expenseResult] = await Promise.all([
    pool.query<{ fuel_cost: string; total_liters: string; fill_count: string }>(
      `SELECT COALESCE(SUM(cost), 0) AS fuel_cost,
              COALESCE(SUM(liters), 0) AS total_liters,
              COUNT(*) AS fill_count
       FROM fuel_logs WHERE vehicle_id = $1${fuelRange.clause}`,
      [vehicleId, ...fuelRange.values],
    ),
    pool.query<{ maintenance_cost: string }>(
      `SELECT COALESCE(SUM(cost), 0) AS maintenance_cost
       FROM maintenance_logs WHERE vehicle_id = $1${maintenanceRange.clause}`,
      [vehicleId, ...maintenanceRange.values],
    ),
    pool.query<{ other_expenses: string }>(
      `SELECT COALESCE(SUM(amount), 0) AS other_expenses
       FROM expenses WHERE vehicle_id = $1${expenseRange.clause}`,
      [vehicleId, ...expenseRange.values],
    ),
  ]);

  const fuelCost = Number(fuelResult.rows[0].fuel_cost);
  const maintenanceCost = Number(maintenanceResult.rows[0].maintenance_cost);
  const otherExpenses = Number(expenseResult.rows[0].other_expenses);
  const operationalCost = fuelCost + maintenanceCost;

  return {
    vehicle,
    period: { from, to },
    costs: {
      fuel_cost: fuelCost,
      maintenance_cost: maintenanceCost,
      operational_cost: operationalCost,
      other_expenses: otherExpenses,
      total_spend: operationalCost + otherExpenses,
    },
    fuel: {
      total_liters: Number(fuelResult.rows[0].total_liters),
      fill_count: Number(fuelResult.rows[0].fill_count),
    },
  };
};
