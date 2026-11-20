-- Flyway migration V14: Add password_change_required flag to users table
-- Ensures newly provisioned or administratively reset users are required to change their temporary password on first login.

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN NOT NULL DEFAULT FALSE;
