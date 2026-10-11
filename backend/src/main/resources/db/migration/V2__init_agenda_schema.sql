-- ============================================================================
-- Flyway Migration V2: Initial Agenda & Appointments Schema (CNDP Loi 09-08)
-- ============================================================================

CREATE TABLE appointments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id    UUID NOT NULL,
    doctor_name   VARCHAR(100) NOT NULL,
    start_time    TIMESTAMPTZ  NOT NULL,
    end_time      TIMESTAMPTZ  NOT NULL,
    status        VARCHAR(30)  NOT NULL DEFAULT 'EN_ATTENTE',
    type          VARCHAR(30)  NOT NULL DEFAULT 'CONSULTATION',
    notes         TEXT,
    version       BIGINT       NOT NULL DEFAULT 0,

    -- CNDP (Loi 09-08) Audit & Traceability Columns
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by    VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_by    VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at    TIMESTAMPTZ
);

-- Performance & Query Lookup Indexes
CREATE INDEX idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX idx_appointments_start_time ON appointments (start_time);
CREATE INDEX idx_appointments_doctor_date ON appointments (doctor_name, start_time);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_appointments_deleted_at ON appointments (deleted_at);
