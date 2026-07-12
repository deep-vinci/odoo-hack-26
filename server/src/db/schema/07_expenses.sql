CREATE TABLE expenses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id   UUID NOT NULL REFERENCES vehicles(id),
    trip_id      UUID REFERENCES trips(id),
    type         expense_type NOT NULL,
    amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    note         VARCHAR(255),
    incurred_at  DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by   UUID NOT NULL REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
