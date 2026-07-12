import pool from "../config/db";
import { isUuid } from "../utils/uuid";
import { addDateParams, dateRangeClause, round } from "./query.helpers";
import type { ReportFilters } from "../validators/report.validator";

interface Period {
  from: string | null;
  to: string | null;
}

// ---------- 7.2 Fuel efficiency ----------

export interface FuelEfficiencyRow {
  vehicle: { id: string; registration_number: string; name: string; type: string };
  total_distance_km: number;
  total_fuel_liters: number;
  fuel_efficiency_km_per_liter: number | null;
  total_fuel_cost: number;
  completed_trips: number;
}

export interface FuelEfficiencyReport {
  period: Period;
  vehicles: FuelEfficiencyRow[];
  fleet_average_km_per_liter: number | null;
}

export const getFuelEfficiencyReport = async (
  filters: ReportFilters,
): Promise<FuelEfficiencyReport> => {
  const values: unknown[] = [];
  const { fromIdx, toIdx } = addDateParams(filters.from, filters.to, values);
  const tripRange = dateRangeClause("completed_at", fromIdx, toIdx);
  const fuelRange = dateRangeClause("filled_at", fromIdx, toIdx);

  let outerWhere = "WHERE (t.total_distance IS NOT NULL OR f.total_liters IS NOT NULL)";
  if (filters.vehicleId && isUuid(filters.vehicleId)) {
    values.push(filters.vehicleId);
    outerWhere = `WHERE v.id = $${values.length}`;
  }

  const result = await pool.query<{
    id: string;
    registration_number: string;
    name: string;
    type: string;
    total_distance_km: string;
    completed_trips: string;
    total_fuel_liters: string;
    total_fuel_cost: string;
  }>(
    `SELECT v.id, v.registration_number, v.name, v.type,
       COALESCE(t.total_distance, 0) AS total_distance_km,
       COALESCE(t.completed_trips, 0) AS completed_trips,
       COALESCE(f.total_liters, 0) AS total_fuel_liters,
       COALESCE(f.total_cost, 0) AS total_fuel_cost
     FROM vehicles v
     LEFT JOIN (
       SELECT vehicle_id,
              SUM(end_odometer_km - start_odometer_km) AS total_distance,
              COUNT(*) AS completed_trips
       FROM trips
       WHERE status = 'completed'
         AND start_odometer_km IS NOT NULL
         AND end_odometer_km IS NOT NULL${tripRange}
       GROUP BY vehicle_id
     ) t ON t.vehicle_id = v.id
     LEFT JOIN (
       SELECT vehicle_id, SUM(liters) AS total_liters, SUM(cost) AS total_cost
       FROM fuel_logs
       WHERE TRUE${fuelRange}
       GROUP BY vehicle_id
     ) f ON f.vehicle_id = v.id
     ${outerWhere}
     ORDER BY v.registration_number`,
    values,
  );

  let fleetDistance = 0;
  let fleetFuel = 0;

  const vehicles = result.rows.map((row) => {
    const distance = Number(row.total_distance_km);
    const liters = Number(row.total_fuel_liters);
    fleetDistance += distance;
    fleetFuel += liters;
    return {
      vehicle: {
        id: row.id,
        registration_number: row.registration_number,
        name: row.name,
        type: row.type,
      },
      total_distance_km: distance,
      total_fuel_liters: liters,
      fuel_efficiency_km_per_liter: liters > 0 ? round(distance / liters, 2) : null,
      total_fuel_cost: Number(row.total_fuel_cost),
      completed_trips: Number(row.completed_trips),
    };
  });

  return {
    period: { from: filters.from, to: filters.to },
    vehicles,
    fleet_average_km_per_liter: fleetFuel > 0 ? round(fleetDistance / fleetFuel, 1) : null,
  };
};

// ---------- 7.3 Operational costs ----------

export interface OperationalCostRow {
  vehicle: { id: string; registration_number: string; name: string };
  fuel_cost: number;
  maintenance_cost: number;
  operational_cost: number;
  other_expenses: number;
}

export interface OperationalCostsReport {
  period: Period;
  vehicles: OperationalCostRow[];
  totals: {
    fuel_cost: number;
    maintenance_cost: number;
    operational_cost: number;
    other_expenses: number;
  };
}

export const getOperationalCostsReport = async (
  filters: ReportFilters,
): Promise<OperationalCostsReport> => {
  const values: unknown[] = [];
  const { fromIdx, toIdx } = addDateParams(filters.from, filters.to, values);
  const fuelRange = dateRangeClause("filled_at", fromIdx, toIdx);
  const maintenanceRange = dateRangeClause("opened_at", fromIdx, toIdx);
  const expenseRange = dateRangeClause("incurred_at", fromIdx, toIdx);

  const vehicleConditions: string[] = [];
  if (filters.vehicleType) {
    values.push(filters.vehicleType);
    vehicleConditions.push(`v.type = $${values.length}`);
  }
  if (filters.region) {
    values.push(filters.region);
    vehicleConditions.push(`v.region = $${values.length}`);
  }
  const vehicleWhere =
    vehicleConditions.length > 0 ? `WHERE ${vehicleConditions.join(" AND ")}` : "";

  const result = await pool.query<{
    id: string;
    registration_number: string;
    name: string;
    fuel_cost: string;
    maintenance_cost: string;
    other_expenses: string;
  }>(
    `SELECT v.id, v.registration_number, v.name,
       COALESCE(f.fuel_cost, 0) AS fuel_cost,
       COALESCE(m.maintenance_cost, 0) AS maintenance_cost,
       COALESCE(e.other_expenses, 0) AS other_expenses
     FROM vehicles v
     LEFT JOIN (SELECT vehicle_id, SUM(cost) AS fuel_cost FROM fuel_logs WHERE TRUE${fuelRange} GROUP BY vehicle_id) f ON f.vehicle_id = v.id
     LEFT JOIN (SELECT vehicle_id, SUM(cost) AS maintenance_cost FROM maintenance_logs WHERE TRUE${maintenanceRange} GROUP BY vehicle_id) m ON m.vehicle_id = v.id
     LEFT JOIN (SELECT vehicle_id, SUM(amount) AS other_expenses FROM expenses WHERE TRUE${expenseRange} GROUP BY vehicle_id) e ON e.vehicle_id = v.id
     ${vehicleWhere}
     ORDER BY v.registration_number`,
    values,
  );

  const totals = { fuel_cost: 0, maintenance_cost: 0, other_expenses: 0 };

  const vehicles = result.rows.map((row) => {
    const fuelCost = Number(row.fuel_cost);
    const maintenanceCost = Number(row.maintenance_cost);
    const otherExpenses = Number(row.other_expenses);
    totals.fuel_cost += fuelCost;
    totals.maintenance_cost += maintenanceCost;
    totals.other_expenses += otherExpenses;
    return {
      vehicle: { id: row.id, registration_number: row.registration_number, name: row.name },
      fuel_cost: fuelCost,
      maintenance_cost: maintenanceCost,
      operational_cost: fuelCost + maintenanceCost,
      other_expenses: otherExpenses,
    };
  });

  return {
    period: { from: filters.from, to: filters.to },
    vehicles,
    totals: {
      fuel_cost: totals.fuel_cost,
      maintenance_cost: totals.maintenance_cost,
      operational_cost: totals.fuel_cost + totals.maintenance_cost,
      other_expenses: totals.other_expenses,
    },
  };
};

// ---------- 7.4 Vehicle ROI ----------

export interface VehicleRoiRow {
  vehicle: {
    id: string;
    registration_number: string;
    name: string;
    acquisition_cost: number;
  };
  total_revenue: number;
  fuel_cost: number;
  maintenance_cost: number;
  operational_cost: number;
  net_return: number;
  roi: number | null;
  roi_pct: number | null;
}

export interface VehicleRoiReport {
  period: Period;
  vehicles: VehicleRoiRow[];
}

export const getVehicleRoiReport = async (
  filters: ReportFilters,
): Promise<VehicleRoiReport> => {
  const values: unknown[] = [];
  const { fromIdx, toIdx } = addDateParams(filters.from, filters.to, values);
  const revenueRange = dateRangeClause("completed_at", fromIdx, toIdx);
  const fuelRange = dateRangeClause("filled_at", fromIdx, toIdx);
  const maintenanceRange = dateRangeClause("opened_at", fromIdx, toIdx);

  const result = await pool.query<{
    id: string;
    registration_number: string;
    name: string;
    acquisition_cost: string;
    total_revenue: string;
    fuel_cost: string;
    maintenance_cost: string;
  }>(
    `SELECT v.id, v.registration_number, v.name, v.acquisition_cost,
       COALESCE(r.total_revenue, 0) AS total_revenue,
       COALESCE(f.fuel_cost, 0) AS fuel_cost,
       COALESCE(m.maintenance_cost, 0) AS maintenance_cost
     FROM vehicles v
     LEFT JOIN (SELECT vehicle_id, SUM(revenue) AS total_revenue FROM trips WHERE status = 'completed'${revenueRange} GROUP BY vehicle_id) r ON r.vehicle_id = v.id
     LEFT JOIN (SELECT vehicle_id, SUM(cost) AS fuel_cost FROM fuel_logs WHERE TRUE${fuelRange} GROUP BY vehicle_id) f ON f.vehicle_id = v.id
     LEFT JOIN (SELECT vehicle_id, SUM(cost) AS maintenance_cost FROM maintenance_logs WHERE TRUE${maintenanceRange} GROUP BY vehicle_id) m ON m.vehicle_id = v.id
     ORDER BY v.registration_number`,
    values,
  );

  const vehicles = result.rows.map((row) => {
    const revenue = Number(row.total_revenue);
    const fuelCost = Number(row.fuel_cost);
    const maintenanceCost = Number(row.maintenance_cost);
    const acquisitionCost = Number(row.acquisition_cost);
    const operationalCost = fuelCost + maintenanceCost;
    const netReturn = revenue - operationalCost;
    const roi = acquisitionCost > 0 ? netReturn / acquisitionCost : null;
    return {
      vehicle: {
        id: row.id,
        registration_number: row.registration_number,
        name: row.name,
        acquisition_cost: acquisitionCost,
      },
      total_revenue: revenue,
      fuel_cost: fuelCost,
      maintenance_cost: maintenanceCost,
      operational_cost: operationalCost,
      net_return: netReturn,
      roi: roi === null ? null : round(roi, 4),
      roi_pct: roi === null ? null : round(roi * 100, 2),
    };
  });

  return { period: { from: filters.from, to: filters.to }, vehicles };
};

// ---------- 7.5 Trends ----------

export interface UtilizationTrend {
  series: {
    date: string;
    vehicles_utilized: number;
    fleet_size: number;
    utilization_pct: number;
  }[];
}

export const getUtilizationTrend = async (days: number): Promise<UtilizationTrend> => {
  const fleetResult = await pool.query<{ fleet_size: string }>(
    "SELECT COUNT(*) FILTER (WHERE status <> 'retired') AS fleet_size FROM vehicles",
  );
  const fleetSize = Number(fleetResult.rows[0].fleet_size);

  const result = await pool.query<{ date: string; vehicles_utilized: string }>(
    `WITH days AS (
       SELECT generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, INTERVAL '1 day')::date AS day
     )
     SELECT to_char(d.day, 'YYYY-MM-DD') AS date,
            COUNT(DISTINCT t.vehicle_id) AS vehicles_utilized
     FROM days d
     LEFT JOIN trips t
       ON t.status IN ('dispatched', 'completed')
       AND t.dispatched_at < (d.day + INTERVAL '1 day')
       AND (t.completed_at IS NULL OR t.completed_at >= d.day)
     GROUP BY d.day
     ORDER BY d.day`,
    [days],
  );

  return {
    series: result.rows.map((row) => {
      const utilized = Number(row.vehicles_utilized);
      return {
        date: row.date,
        vehicles_utilized: utilized,
        fleet_size: fleetSize,
        utilization_pct: fleetSize > 0 ? round((utilized / fleetSize) * 100, 1) : 0,
      };
    }),
  };
};

export interface CostTrend {
  series: { month: string; fuel_cost: number; maintenance_cost: number }[];
}

export const getCostTrend = async (months: number): Promise<CostTrend> => {
  const result = await pool.query<{
    month: string;
    fuel_cost: string;
    maintenance_cost: string;
  }>(
    `WITH months AS (
       SELECT generate_series(
         date_trunc('month', CURRENT_DATE) - (($1::int - 1) || ' months')::interval,
         date_trunc('month', CURRENT_DATE),
         INTERVAL '1 month'
       )::date AS month_start
     )
     SELECT to_char(m.month_start, 'YYYY-MM') AS month,
       COALESCE((SELECT SUM(cost) FROM fuel_logs
                 WHERE date_trunc('month', filled_at)::date = m.month_start), 0) AS fuel_cost,
       COALESCE((SELECT SUM(cost) FROM maintenance_logs
                 WHERE date_trunc('month', opened_at)::date = m.month_start), 0) AS maintenance_cost
     FROM months m
     ORDER BY m.month_start`,
    [months],
  );

  return {
    series: result.rows.map((row) => ({
      month: row.month,
      fuel_cost: Number(row.fuel_cost),
      maintenance_cost: Number(row.maintenance_cost),
    })),
  };
};
