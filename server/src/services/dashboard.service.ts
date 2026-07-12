import pool from "../config/db";
import { round } from "./query.helpers";
import type { ReportFilters } from "../validators/report.validator";

export interface Dashboard {
  kpis: {
    active_vehicles: number;
    available_vehicles: number;
    vehicles_in_maintenance: number;
    vehicles_on_trip: number;
    retired_vehicles: number;
    active_trips: number;
    pending_trips: number;
    drivers_on_duty: number;
    drivers_on_trip: number;
    fleet_utilization_pct: number;
  };
  alerts: {
    expired_licenses: number;
    licenses_expiring_30_days: number;
    open_maintenance: number;
  };
  filters_applied: {
    vehicle_type: string | null;
    vehicle_status: string | null;
    region: string | null;
  };
}

interface VehicleCountRow {
  active_vehicles: string;
  available_vehicles: string;
  vehicles_in_maintenance: string;
  vehicles_on_trip: string;
  retired_vehicles: string;
  total_vehicles: string;
}

export const getDashboard = async (filters: ReportFilters): Promise<Dashboard> => {
  const vehicleConditions: string[] = [];
  const vehicleValues: unknown[] = [];
  if (filters.vehicleType) {
    vehicleValues.push(filters.vehicleType);
    vehicleConditions.push(`type = $${vehicleValues.length}`);
  }
  if (filters.vehicleStatus) {
    vehicleValues.push(filters.vehicleStatus);
    vehicleConditions.push(`status = $${vehicleValues.length}`);
  }
  if (filters.region) {
    vehicleValues.push(filters.region);
    vehicleConditions.push(`region = $${vehicleValues.length}`);
  }
  const vehicleWhere =
    vehicleConditions.length > 0 ? `WHERE ${vehicleConditions.join(" AND ")}` : "";

  const tripValues: unknown[] = [];
  let tripQuery: string;
  if (filters.region) {
    tripValues.push(filters.region);
    tripQuery = `SELECT
         COUNT(*) FILTER (WHERE t.status = 'dispatched') AS active_trips,
         COUNT(*) FILTER (WHERE t.status = 'draft') AS pending_trips
       FROM trips t JOIN vehicles v ON v.id = t.vehicle_id
       WHERE v.region = $1`;
  } else {
    tripQuery = `SELECT
         COUNT(*) FILTER (WHERE status = 'dispatched') AS active_trips,
         COUNT(*) FILTER (WHERE status = 'draft') AS pending_trips
       FROM trips`;
  }

  const [vehicleResult, tripResult, driverResult, alertResult] = await Promise.all([
    pool.query<VehicleCountRow>(
      `SELECT
         COUNT(*) FILTER (WHERE status <> 'retired') AS active_vehicles,
         COUNT(*) FILTER (WHERE status = 'available') AS available_vehicles,
         COUNT(*) FILTER (WHERE status = 'in_shop') AS vehicles_in_maintenance,
         COUNT(*) FILTER (WHERE status = 'on_trip') AS vehicles_on_trip,
         COUNT(*) FILTER (WHERE status = 'retired') AS retired_vehicles,
         COUNT(*) AS total_vehicles
       FROM vehicles ${vehicleWhere}`,
      vehicleValues,
    ),
    pool.query<{ active_trips: string; pending_trips: string }>(tripQuery, tripValues),
    pool.query<{ drivers_on_duty: string; drivers_on_trip: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('available', 'on_trip')) AS drivers_on_duty,
         COUNT(*) FILTER (WHERE status = 'on_trip') AS drivers_on_trip
       FROM drivers`,
    ),
    pool.query<{
      expired_licenses: string;
      licenses_expiring_30_days: string;
      open_maintenance: string;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM drivers WHERE license_expiry_date < CURRENT_DATE) AS expired_licenses,
         (SELECT COUNT(*) FROM drivers
           WHERE license_expiry_date >= CURRENT_DATE
             AND license_expiry_date <= CURRENT_DATE + 30) AS licenses_expiring_30_days,
         (SELECT COUNT(*) FROM maintenance_logs WHERE status = 'open') AS open_maintenance`,
    ),
  ]);

  const v = vehicleResult.rows[0];
  const onTrip = Number(v.vehicles_on_trip);
  const denominator = Number(v.total_vehicles) - Number(v.retired_vehicles);

  return {
    kpis: {
      active_vehicles: Number(v.active_vehicles),
      available_vehicles: Number(v.available_vehicles),
      vehicles_in_maintenance: Number(v.vehicles_in_maintenance),
      vehicles_on_trip: onTrip,
      retired_vehicles: Number(v.retired_vehicles),
      active_trips: Number(tripResult.rows[0].active_trips),
      pending_trips: Number(tripResult.rows[0].pending_trips),
      drivers_on_duty: Number(driverResult.rows[0].drivers_on_duty),
      drivers_on_trip: Number(driverResult.rows[0].drivers_on_trip),
      fleet_utilization_pct: denominator > 0 ? round((onTrip / denominator) * 100, 1) : 0,
    },
    alerts: {
      expired_licenses: Number(alertResult.rows[0].expired_licenses),
      licenses_expiring_30_days: Number(alertResult.rows[0].licenses_expiring_30_days),
      open_maintenance: Number(alertResult.rows[0].open_maintenance),
    },
    filters_applied: {
      vehicle_type: filters.vehicleType ?? null,
      vehicle_status: filters.vehicleStatus ?? null,
      region: filters.region ?? null,
    },
  };
};
