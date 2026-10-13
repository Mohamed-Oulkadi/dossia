-- ============================================================================
-- Flyway Migration V7: Real-Time Waiting Room Tracking (CNDP Loi 09-08)
-- Tracks patient arrival time at reception and doctor call time in consultation
-- ============================================================================

-- 1. Add arrived_at and called_at tracking columns
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS called_at TIMESTAMPTZ;

-- Backfill arrived_at for active waiting appointments if needed
UPDATE appointments
SET arrived_at = created_at
WHERE status = 'EN_ATTENTE' AND arrived_at IS NULL;

-- 2. Optimize lookup and FIFO queue index for waiting room real-time ordering
CREATE INDEX IF NOT EXISTS idx_appointments_waiting_queue
    ON appointments (clinic_id, status, arrived_at);

CREATE INDEX IF NOT EXISTS idx_appointments_called_at
    ON appointments (called_at);
