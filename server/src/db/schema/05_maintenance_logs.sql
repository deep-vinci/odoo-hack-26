CREATE TABLE maintenance_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id   UUID NOT NULL REFERENCES vehicles(id),
    title        VARCHAR(150) NOT NULL,
    description  TEXT,
    cost         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    status       maintenance_status NOT NULL DEFAULT 'open',
    opened_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at    TIMESTAMPTZ,
    created_by   UUID NOT NULL REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_open_maintenance_per_vehicle ON maintenance_logs(vehicle_id) WHERE status = 'open';
