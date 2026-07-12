CREATE TYPE user_role AS ENUM ('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst');

CREATE TYPE vehicle_status AS ENUM ('available', 'on_trip', 'in_shop', 'retired');
CREATE TYPE vehicle_type   AS ENUM ('truck', 'van', 'mini_truck', 'trailer', 'other');

CREATE TYPE driver_status  AS ENUM ('available', 'on_trip', 'off_duty', 'suspended');

CREATE TYPE trip_status    AS ENUM ('draft', 'dispatched', 'completed', 'cancelled');

CREATE TYPE maintenance_status AS ENUM ('open', 'closed');

CREATE TYPE expense_type   AS ENUM ('toll', 'parking', 'fine', 'misc');
