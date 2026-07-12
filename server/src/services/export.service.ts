import pool from "../config/db";
import { isUuid } from "../utils/uuid";
import { toCsv } from "../utils/csv";
import type { ReportFilters, ReportName } from "../validators/report.validator";
import {
  getFuelEfficiencyReport,
  getOperationalCostsReport,
  getVehicleRoiReport,
} from "./report.service";

interface ExportData {
  columns: string[];
  rows: Record<string, unknown>[];
}

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const buildFilter = (opts: {
  vehicleColumn?: string;
  vehicleId?: string;
  dateColumn?: string;
  from: string | null;
  to: string | null;
}): { where: string; values: unknown[] } => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (opts.vehicleColumn && opts.vehicleId && isUuid(opts.vehicleId)) {
    values.push(opts.vehicleId);
    conditions.push(`${opts.vehicleColumn} = $${values.length}`);
  }
  if (opts.dateColumn && opts.from) {
    values.push(opts.from);
    conditions.push(`${opts.dateColumn} >= $${values.length}::date`);
  }
  if (opts.dateColumn && opts.to) {
    values.push(opts.to);
    conditions.push(`${opts.dateColumn} < ($${values.length}::date + INTERVAL '1 day')`);
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
};

const exportVehicles = async (filters: ReportFilters): Promise<ExportData> => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (filters.vehicleType) {
    values.push(filters.vehicleType);
    conditions.push(`type = $${values.length}`);
  }
  if (filters.vehicleStatus) {
    values.push(filters.vehicleStatus);
    conditions.push(`status = $${values.length}`);
  }
  if (filters.region) {
    values.push(filters.region);
    conditions.push(`region = $${values.length}`);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT registration_number, name AS vehicle_name, type,
            max_load_capacity_kg, odometer_km, acquisition_cost, region, status
     FROM vehicles ${where} ORDER BY registration_number`,
    values,
  );

  return {
    columns: [
      "registration_number",
      "vehicle_name",
      "type",
      "max_load_capacity_kg",
      "odometer_km",
      "acquisition_cost",
      "region",
      "status",
    ],
    rows: result.rows.map((r) => ({
      registration_number: r.registration_number,
      vehicle_name: r.vehicle_name,
      type: r.type,
      max_load_capacity_kg: Number(r.max_load_capacity_kg),
      odometer_km: Number(r.odometer_km),
      acquisition_cost: Number(r.acquisition_cost),
      region: r.region,
      status: r.status,
    })),
  };
};

const exportDrivers = async (): Promise<ExportData> => {
  const result = await pool.query(
    `SELECT name, license_number, license_category,
            license_expiry_date::text AS license_expiry_date,
            contact_number, safety_score, status
     FROM drivers ORDER BY name`,
  );
  return {
    columns: [
      "name",
      "license_number",
      "license_category",
      "license_expiry_date",
      "contact_number",
      "safety_score",
      "status",
    ],
    rows: result.rows.map((r) => ({ ...r, safety_score: Number(r.safety_score) })),
  };
};

const exportTrips = async (filters: ReportFilters): Promise<ExportData> => {
  const { where, values } = buildFilter({
    vehicleColumn: "t.vehicle_id",
    vehicleId: filters.vehicleId,
    dateColumn: "t.created_at",
    from: filters.from,
    to: filters.to,
  });
  const result = await pool.query(
    `SELECT t.trip_number, v.registration_number, d.name AS driver_name,
            t.source, t.destination, t.cargo_weight_kg, t.planned_distance_km, t.revenue,
            t.status,
            t.dispatched_at::date::text AS dispatched_at,
            t.completed_at::date::text AS completed_at
     FROM trips t
     JOIN vehicles v ON v.id = t.vehicle_id
     JOIN drivers d ON d.id = t.driver_id
     ${where}
     ORDER BY t.created_at DESC`,
    values,
  );
  return {
    columns: [
      "trip_number",
      "registration_number",
      "driver_name",
      "source",
      "destination",
      "cargo_weight_kg",
      "planned_distance_km",
      "revenue",
      "status",
      "dispatched_at",
      "completed_at",
    ],
    rows: result.rows.map((r) => ({
      ...r,
      cargo_weight_kg: Number(r.cargo_weight_kg),
      planned_distance_km: Number(r.planned_distance_km),
      revenue: r.revenue === null ? null : Number(r.revenue),
    })),
  };
};

const exportFuelLogs = async (filters: ReportFilters): Promise<ExportData> => {
  const { where, values } = buildFilter({
    vehicleColumn: "f.vehicle_id",
    vehicleId: filters.vehicleId,
    dateColumn: "f.filled_at",
    from: filters.from,
    to: filters.to,
  });
  const result = await pool.query(
    `SELECT v.registration_number, t.trip_number,
            f.liters, f.cost, f.filled_at::text AS filled_at, f.odometer_km
     FROM fuel_logs f
     JOIN vehicles v ON v.id = f.vehicle_id
     LEFT JOIN trips t ON t.id = f.trip_id
     ${where}
     ORDER BY f.filled_at DESC`,
    values,
  );
  return {
    columns: ["registration_number", "trip_number", "liters", "cost", "filled_at", "odometer_km"],
    rows: result.rows.map((r) => ({
      ...r,
      liters: Number(r.liters),
      cost: Number(r.cost),
      odometer_km: r.odometer_km === null ? null : Number(r.odometer_km),
    })),
  };
};

const exportExpenses = async (filters: ReportFilters): Promise<ExportData> => {
  const { where, values } = buildFilter({
    vehicleColumn: "e.vehicle_id",
    vehicleId: filters.vehicleId,
    dateColumn: "e.incurred_at",
    from: filters.from,
    to: filters.to,
  });
  const result = await pool.query(
    `SELECT v.registration_number, t.trip_number,
            e.type, e.amount, e.note, e.incurred_at::text AS incurred_at
     FROM expenses e
     JOIN vehicles v ON v.id = e.vehicle_id
     LEFT JOIN trips t ON t.id = e.trip_id
     ${where}
     ORDER BY e.incurred_at DESC`,
    values,
  );
  return {
    columns: ["registration_number", "trip_number", "type", "amount", "note", "incurred_at"],
    rows: result.rows.map((r) => ({ ...r, amount: Number(r.amount) })),
  };
};

const exportMaintenance = async (filters: ReportFilters): Promise<ExportData> => {
  const { where, values } = buildFilter({
    vehicleColumn: "m.vehicle_id",
    vehicleId: filters.vehicleId,
    dateColumn: "m.opened_at",
    from: filters.from,
    to: filters.to,
  });
  const result = await pool.query(
    `SELECT v.registration_number, m.title, m.cost, m.status,
            m.opened_at::date::text AS opened_at,
            m.closed_at::date::text AS closed_at
     FROM maintenance_logs m
     JOIN vehicles v ON v.id = m.vehicle_id
     ${where}
     ORDER BY m.opened_at DESC`,
    values,
  );
  return {
    columns: ["registration_number", "title", "cost", "status", "opened_at", "closed_at"],
    rows: result.rows.map((r) => ({ ...r, cost: Number(r.cost) })),
  };
};

const exportOperationalCosts = async (filters: ReportFilters): Promise<ExportData> => {
  const report = await getOperationalCostsReport(filters);
  return {
    columns: [
      "registration_number",
      "vehicle_name",
      "fuel_cost",
      "maintenance_cost",
      "operational_cost",
      "other_expenses",
    ],
    rows: report.vehicles.map((v) => ({
      registration_number: v.vehicle.registration_number,
      vehicle_name: v.vehicle.name,
      fuel_cost: v.fuel_cost,
      maintenance_cost: v.maintenance_cost,
      operational_cost: v.operational_cost,
      other_expenses: v.other_expenses,
    })),
  };
};

const exportFuelEfficiency = async (filters: ReportFilters): Promise<ExportData> => {
  const report = await getFuelEfficiencyReport(filters);
  return {
    columns: [
      "registration_number",
      "vehicle_name",
      "type",
      "total_distance_km",
      "total_fuel_liters",
      "fuel_efficiency_km_per_liter",
      "total_fuel_cost",
      "completed_trips",
    ],
    rows: report.vehicles.map((v) => ({
      registration_number: v.vehicle.registration_number,
      vehicle_name: v.vehicle.name,
      type: v.vehicle.type,
      total_distance_km: v.total_distance_km,
      total_fuel_liters: v.total_fuel_liters,
      fuel_efficiency_km_per_liter: v.fuel_efficiency_km_per_liter,
      total_fuel_cost: v.total_fuel_cost,
      completed_trips: v.completed_trips,
    })),
  };
};

const exportVehicleRoi = async (filters: ReportFilters): Promise<ExportData> => {
  const report = await getVehicleRoiReport(filters);
  return {
    columns: [
      "registration_number",
      "vehicle_name",
      "acquisition_cost",
      "total_revenue",
      "fuel_cost",
      "maintenance_cost",
      "operational_cost",
      "net_return",
      "roi",
      "roi_pct",
    ],
    rows: report.vehicles.map((v) => ({
      registration_number: v.vehicle.registration_number,
      vehicle_name: v.vehicle.name,
      acquisition_cost: v.vehicle.acquisition_cost,
      total_revenue: v.total_revenue,
      fuel_cost: v.fuel_cost,
      maintenance_cost: v.maintenance_cost,
      operational_cost: v.operational_cost,
      net_return: v.net_return,
      roi: v.roi,
      roi_pct: v.roi_pct,
    })),
  };
};

const EXPORTERS: Record<ReportName, (filters: ReportFilters) => Promise<ExportData>> = {
  vehicles: exportVehicles,
  drivers: exportDrivers,
  trips: exportTrips,
  "fuel-logs": exportFuelLogs,
  expenses: exportExpenses,
  maintenance: exportMaintenance,
  "operational-costs": exportOperationalCosts,
  "fuel-efficiency": exportFuelEfficiency,
  "vehicle-roi": exportVehicleRoi,
};

export const buildExport = async (
  report: ReportName,
  filters: ReportFilters,
): Promise<{ filename: string; csv: string }> => {
  const data = await EXPORTERS[report](filters);
  return {
    filename: `transitops-${report}-${todayIso()}.csv`,
    csv: toCsv(data.columns, data.rows),
  };
};
