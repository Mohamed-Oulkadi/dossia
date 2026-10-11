-- ============================================================================
-- Flyway Migration V1: Initial Patient Schema with CNDP Loi 09-08 Audit Trail
-- ============================================================================

CREATE TABLE patients (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    cin           VARCHAR(20)  NOT NULL,
    phone_number  VARCHAR(20)  NOT NULL,
    birth_date    DATE         NOT NULL,
    cnss_number   VARCHAR(30),
    mutuelle_type VARCHAR(50),

    -- CNDP (Loi 09-08) Audit & Traceability Columns
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by    VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_by    VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at    TIMESTAMPTZ,

    CONSTRAINT uq_patients_cin UNIQUE (cin)
);

-- Performance & Lookup Indexes
CREATE INDEX idx_patients_cin ON patients (cin);
CREATE INDEX idx_patients_phone_number ON patients (phone_number);
CREATE INDEX idx_patients_deleted_at ON patients (deleted_at);
