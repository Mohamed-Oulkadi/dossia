-- V5__init_cnss_schema.sql
-- Module: CNSS / AMO Generator (Phase 3)
-- Enforces: Official Moroccan Feuille de Soins (AMO) reimbursement tracking and CNDP Loi 09-08 audit trail

CREATE TABLE IF NOT EXISTS feuilles_de_soins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    consultation_id UUID NULL,
    invoice_id UUID NULL,
    form_type VARCHAR(20) NOT NULL CHECK (form_type IN ('CNSS', 'CNOPS', 'FAR')),
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'PRINTED')),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_fds_patient_id ON feuilles_de_soins (patient_id);
CREATE INDEX IF NOT EXISTS idx_fds_invoice_id ON feuilles_de_soins (invoice_id);
CREATE INDEX IF NOT EXISTS idx_fds_consultation_id ON feuilles_de_soins (consultation_id);
CREATE INDEX IF NOT EXISTS idx_fds_generated_at ON feuilles_de_soins (generated_at);
CREATE INDEX IF NOT EXISTS idx_fds_form_type ON feuilles_de_soins (form_type);
