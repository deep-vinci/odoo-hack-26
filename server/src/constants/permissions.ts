import type { UserRole } from "./roles";

export type RouteKey = string;

export const PERMISSIONS: Record<RouteKey, UserRole[]> = {
  "POST /vehicles": ["fleet_manager"],
  "PATCH /vehicles/:id": ["fleet_manager"],
  "PATCH /vehicles/:id/status": ["fleet_manager"],
  "DELETE /vehicles/:id": ["fleet_manager"],

  "POST /drivers": ["fleet_manager", "safety_officer"],
  "PATCH /drivers/:id": ["fleet_manager", "safety_officer"],
  "PATCH /drivers/:id/status": ["fleet_manager", "safety_officer"],
  "PATCH /drivers/:id/safety-score": ["safety_officer"],

  "POST /trips": ["fleet_manager", "dispatcher"],
  "POST /trips/:id/dispatch": ["fleet_manager", "dispatcher"],
  "POST /trips/:id/complete": ["fleet_manager", "dispatcher"],
  "POST /trips/:id/cancel": ["fleet_manager", "dispatcher"],

  "POST /maintenance": ["fleet_manager"],
  "PATCH /maintenance/:id": ["fleet_manager"],
  "POST /maintenance/:id/close": ["fleet_manager"],

  "POST /fuel-logs": ["fleet_manager", "dispatcher", "financial_analyst"],
  "DELETE /fuel-logs/:id": ["fleet_manager", "financial_analyst"],
  "POST /expenses": ["fleet_manager", "dispatcher", "financial_analyst"],
  "DELETE /expenses/:id": ["fleet_manager", "financial_analyst"],
};

export const rolesForRoute = (key: RouteKey): UserRole[] => {
  const roles = PERMISSIONS[key];
  if (!roles) {
    throw new Error(`No RBAC permission entry defined for route "${key}"`);
  }
  return roles;
};
