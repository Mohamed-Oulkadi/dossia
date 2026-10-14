#!/usr/bin/env python3
"""
Dossia Architecture Master Specification Generator
====================================================
Engine: python-docx
Output: /docs/Dossia_Architecture_Master_Spec.docx

MANDATORY GOVERNANCE DIRECTIVE:
--------------------------------
This script is the programmatic Single Source of Truth (SSOT) for the Dossia
Technical & Architecture Specification. Any agent or engineer adding features,
modifying schemas, or creating endpoints MUST update the structured data
dictionaries below and re-run this script before marking the task as complete.
"""

import os
import sys
from datetime import datetime
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

# ==============================================================================
# 1. ARCHITECTURAL REGISTRY & SPECIFICATION DATA
# ==============================================================================

METADATA = {
    "title": "Dossia — Architecture & Technical Master Specification",
    "subtitle": "The Digital Operating System for Moroccan Private Medical Cabinets & Clinics",
    "version": "2.5.0-SNAPSHOT",
    "date": datetime.now().strftime("%B %d, %Y"),
    "classification": "CONFIDENTIAL / CLINICAL ARCHITECTURE SPECIFICATION",
    "legal_regulations": "CNDP Loi 09-08 • ANAM / CNSS AMO Standards • Code Général des Impôts (ICE/MAD)",
    "authors": "Dossia Engineering & Core Architecture Team"
}

EXECUTIVE_SUMMARY = {
    "mission": (
        "Dossia is an enterprise-grade medical operating system tailored specifically for Moroccan "
        "private practices and healthcare clinics. It resolves the severe friction between clinical "
        "consultations, fast-paced front-desk reception, CNDP patient privacy regulations, and "
        "complex social security reimbursement processes (AMO / CNSS / CNOPS)."
    ),
    "secretary_first_sla": (
        "Operating Reality: A Moroccan medical secretary manages 30 to 60 patients daily while "
        "fielding continuous phone inquiries, checking in unscheduled walk-ins, and collecting payments. "
        "Dossia enforces a strict '3-Second SLA': any critical front-desk action—appointment booking, "
        "waiting-room check-in, direct cash/TPE encaissement, or Feuille de Soins generation—must execute "
        "in under 3 seconds with zero layout shifts and keyboard-first navigation (Ctrl+K)."
    ),
    "moroccan_context": [
        ("AMO / CNSS Automation", "Automatic population of standardized Feuilles de Soins (FIP-1 to FIP-8) with patient CIN, CNSS registration, and practitioner INPE (9 digits)."),
        ("Strict MAD Caisse Accounting", "All financial records and daily cash balances are computed using non-floating BigDecimal (10, 2) arithmetic with HALF_UP rounding in Moroccan Dirhams (MAD)."),
        ("CNDP Law 09-08 Compliance", "National medical data privacy compliance enforcing complete clinic tenant isolation, non-destructive soft deletes (deleted_at), and strict audit logging.")
    ]
}

SYSTEM_CONTAINERS = [
    {
        "component": "Spring Modulith Backend",
        "tech": "Java 21, Spring Boot 3.4.x, Spring Modulith, Virtual Threads, OpenPDF",
        "role": "Modular monolith hosting bounded domain contexts, event bus, multi-tenant security filters, and PDF document rendering engines."
    },
    {
        "component": "React 18 SPA Frontend",
        "tech": "React 18, TypeScript, Vite, Tailwind CSS v4, Zustand, Lucide, Three.js",
        "role": "High-density clinical web application featuring role-based workspaces, real-time SSE listener, command palette, and interactive 3D landing network."
    },
    {
        "component": "PostgreSQL 16 Database",
        "tech": "PostgreSQL 16 Alpine, Flyway Migration Engine",
        "role": "Relational data store enforcing foreign key multi-tenancy (clinic_id), JSONB template storage, and FIFO waiting-room queue indexes."
    },
    {
        "component": "Nginx Reverse Proxy",
        "tech": "Nginx 1.25 Alpine, SSL Termination, SSE Tuning",
        "role": "Edge gateway enforcing OWASP security headers, CNDP X-Real-IP audit forwarding, 10MB medical document uploads, and unbuffered SSE event streaming."
    },
    {
        "component": "MinIO S3 Object Storage",
        "tech": "MinIO S3 API (quay.io/minio/minio:latest), Internal Bridge (backend-net), 10MB Multipart Uploads",
        "role": "100% on-premise Moroccan medical document vault. Enforces multi-tenant namespace (clinics/{clinic_id}/patients/{patient_id}/*) with zero public port exposure; all binary streaming is mediated via Spring Boot with CNDP Loi 09-08 role access controls."
    }
]

BOUNDED_CONTEXTS = [
    {
        "name": "com.dossia.backend.auth",
        "title": "Authentication, Multi-Tenancy & Security Context",
        "description": "Manages user credentials, BCrypt password hashing, JWT token issuance, and multi-tenant clinic resolution via SecurityUtils. ThreadLocal clinic isolation ensures zero cross-practice data leakage.",
        "entities": ["users", "clinics"],
        "events": ["UserAuthenticatedEvent", "ClinicSubscriptionToggledEvent"],
        "services": ["AuthService", "CustomUserDetailsService", "JwtTokenProvider", "SecurityUtils"]
    },
    {
        "name": "com.dossia.backend.admin",
        "title": "Super Admin SaaS Platform Governance",
        "description": "Provides platform-level clinic lifecycle management, 15-digit ICE validation, subscription state controls (ACTIVE/SUSPENDED), user credential reset utilities, and cross-tenant CNDP audit log viewing.",
        "entities": ["clinics", "users", "audit_logs"],
        "events": ["ClinicProvisionedEvent", "SubscriptionStatusChangedEvent"],
        "services": ["AdminClinicService", "AdminSubscriptionService", "AdminAuditService"]
    },
    {
        "name": "com.dossia.backend.patient",
        "title": "Patient Demographics & Medical Registry",
        "description": "Maintains patient dossiers, unique national identity card (CIN) indexing, validated Moroccan mobile/landline numbers (+212), CNSS/CNOPS registration, and soft-delete legal records preservation.",
        "entities": ["patients"],
        "events": ["PatientCreatedEvent", "PatientUpdatedEvent"],
        "services": ["PatientService", "PatientRepository"]
    },
    {
        "name": "com.dossia.backend.agenda",
        "title": "Smart Agenda, Waiting Room & SSE Doctor Pager",
        "description": "Handles appointment scheduling with optimistic locking (version), live waiting-room status tracking (arrived_at, called_at), multi-tenant Server-Sent Events (SSE) broadcast, and real-time Doctor Pager calling.",
        "entities": ["appointments"],
        "events": ["AppointmentScheduledEvent", "AppointmentStatusChangedEvent", "PatientCalledEvent"],
        "services": ["AgendaService", "WaitingRoomSseRegistry", "WaitingRoomStreamController"]
    },
    {
        "name": "com.dossia.backend.consultation",
        "title": "Clinical Speed Engine, Drug Catalog & Document Generators",
        "description": "Empowers physicians with sub-minute consultations: Moroccan drug catalog (28 pre-seeded medications), custom ordonnance templates, biological/radiological diagnostic requests, certified sick-leave certificates, and vector OpenPDF generators.",
        "entities": ["consultations", "prescriptions", "prescription_items", "medications_catalog", "prescription_templates", "diagnostic_requests", "medical_certificates"],
        "events": ["ConsultationCompletedEvent", "PrescriptionIssuedEvent", "DiagnosticRequestCreatedEvent"],
        "services": ["ConsultationService", "ClinicalSpeedEngineService", "OrdonnancePdfGenerator", "BilanPdfGenerator", "CertificatPdfGenerator", "FrenchNumberSpellout"]
    },
    {
        "name": "com.dossia.backend.billing",
        "title": "Facturation, Encaissement & Caisse Journalière in MAD",
        "description": "Maintains strict financial accounting in Moroccan Dirhams (MAD). Generates consultation invoices, tracks partial/full payments across ESPECES, TPE, CHEQUE, and VIREMENT, compiles daily ledger balances, and generates branded payment receipts.",
        "entities": ["invoices", "payments"],
        "events": ["InvoiceCreatedEvent", "PaymentRegisteredEvent"],
        "services": ["BillingService", "ReceiptPdfGenerator", "BillingRepository"]
    },
    {
        "name": "com.dossia.backend.cnss",
        "title": "AMO / CNSS Social Security Reimbursement Orchestrator",
        "description": "Bridges clinical acts and Moroccan medical insurance. Auto-generates standardized Feuilles de Soins (CNSS, CNOPS, FAR) conforming to FIP-1 through FIP-8 forms, maps practitioner INPE, and produces high-resolution printable PDF forms.",
        "entities": ["feuilles_de_soins"],
        "events": ["FeuilleDeSoinsGeneratedEvent", "FeuilleDeSoinsPrintedEvent"],
        "services": ["FeuilleDeSoinsOrchestrator", "CnssPdfGenerator"]
    },
    {
        "name": "com.dossia.backend.vault",
        "title": "Coffre-Fort Documents & Imagerie Médicale (MinIO S3)",
        "description": "Digitizes, indexes, and streams medical files (radiology X-rays, ultrasound scans, biology lab PDFs, CIN, and mutuelle insurance cards). Automatically enforces CNDP visibility tiers (DOCTOR_ONLY for clinical imagery vs. SHARED_SECRETARY for administrative files) and streams binaries through Spring Boot with JWT validation.",
        "entities": ["patient_documents"],
        "events": ["DocumentUploadedEvent", "DocumentArchivedEvent"],
        "services": ["DocumentVaultService", "MinioStorageService", "PatientDocumentRepository"]
    }
]

FLYWAY_LEDGER = [
    {
        "version": "V1",
        "script": "V1__init_patient_schema.sql",
        "tables": "patients",
        "tenant_isolated": "Yes (Retro-fitted in V6)",
        "description": "Initial patient registry with Moroccan CIN uniqueness, phone indexing, and CNDP Loi 09-08 audit columns."
    },
    {
        "version": "V2",
        "script": "V2__init_agenda_schema.sql",
        "tables": "appointments",
        "tenant_isolated": "Yes (Retro-fitted in V6)",
        "description": "Appointment scheduling schema with status tracking, doctor indexes, and optimistic locking version counter."
    },
    {
        "version": "V3",
        "script": "V3__init_consultation_schema.sql",
        "tables": "consultations, prescriptions, prescription_items",
        "tenant_isolated": "Yes (Retro-fitted in V6)",
        "description": "Clinical consultation history, diagnosis, patient vitals, and prescription lines with cascade delete rules."
    },
    {
        "version": "V4",
        "script": "V4__init_billing_schema.sql",
        "tables": "invoices, payments",
        "tenant_isolated": "Yes (Retro-fitted in V6)",
        "description": "Caisse journalière and invoice tracking with strict NUMERIC(10,2) MAD currency constraints and payment methods."
    },
    {
        "version": "V5",
        "script": "V5__init_cnss_schema.sql",
        "tables": "feuilles_de_soins",
        "tenant_isolated": "Yes (Retro-fitted in V6)",
        "description": "AMO social security reimbursement records supporting CNSS, CNOPS, and FAR formats with print tracking."
    },
    {
        "version": "V6",
        "script": "V6__init_auth_schema.sql",
        "tables": "clinics, users",
        "tenant_isolated": "Yes (Architecture Foundation)",
        "description": "SaaS multi-tenancy foundation: clinics table with 15-digit ICE, users table with RBAC roles, and foreign key clinic_id retrofitted on all existing tables."
    },
    {
        "version": "V7",
        "script": "V7__add_waiting_room_tracking.sql",
        "tables": "appointments (altered)",
        "tenant_isolated": "Yes",
        "description": "Real-time waiting room metrics: added arrived_at and called_at timestamps with composite index (clinic_id, status, arrived_at)."
    },
    {
        "version": "V8",
        "script": "V8__init_clinical_library_and_certificates.sql",
        "tables": "medications_catalog, prescription_templates, diagnostic_requests, medical_certificates",
        "tenant_isolated": "Yes (Templates support Global & Clinic scope)",
        "description": "Clinical Speed Engine schema: 28 pre-seeded Moroccan medications, default prescription templates, diagnostic requests, and medical certificates."
    },
    {
        "version": "V9",
        "script": "V9__init_document_vault_schema.sql",
        "tables": "patient_documents",
        "tenant_isolated": "Yes (Foreign key clinic_id)",
        "description": "Document vault schema: multi-tenant patient_documents table with CNDP visibility tiers (DOCTOR_ONLY vs SHARED_SECRETARY), strict MIME checks (PDF, JPEG, PNG, WEBP), and soft-delete retention."
    },
    {
        "version": "V10",
        "script": "V10__seed_moroccan_clinical_practice_data.sql",
        "tables": "patients, appointments, consultations, prescriptions, prescription_items, invoices, payments, feuilles_de_soins, diagnostic_requests, medical_certificates, patient_documents",
        "tenant_isolated": "Yes (Clinique Ibn Sina Agadir)",
        "description": "Authentic Moroccan clinical practice seed dataset: 10 patients with valid CIN/phone/CNSS, dynamic waiting-room queue and agenda (relative to CURRENT_DATE), completed consultations, prescriptions, MAD daily caisse transactions, CNSS/CNOPS claim forms, bilans, and document vault records."
    }
]

REST_ENDPOINTS = [
    # Auth
    {"method": "POST", "path": "/api/v1/auth/login", "roles": "PUBLIC", "desc": "Authenticates user with email/password; returns signed JWT and profile."},
    {"method": "GET",  "path": "/api/v1/auth/me", "roles": "AUTHENTICATED", "desc": "Returns currently authenticated user profile, clinic affiliation, and active role."},
    # Admin
    {"method": "GET",   "path": "/api/v1/admin/clinics", "roles": "SUPER_ADMIN", "desc": "Lists all registered medical clinics with tenant search and status filtering."},
    {"method": "GET",   "path": "/api/v1/admin/clinics/{id}", "roles": "SUPER_ADMIN", "desc": "Retrieves comprehensive clinic details, users, and subscription records."},
    {"method": "POST",  "path": "/api/v1/admin/clinics", "roles": "SUPER_ADMIN", "desc": "Onboards a new medical clinic practice with validated 15-digit ICE."},
    {"method": "PATCH", "path": "/api/v1/admin/clinics/{id}/status", "roles": "SUPER_ADMIN", "desc": "Toggles clinic subscription state between ACTIVE and SUSPENDED."},
    {"method": "POST",  "path": "/api/v1/admin/clinics/{id}/users/{userId}/reset-password", "roles": "SUPER_ADMIN", "desc": "Resets clinic staff credentials to secure temporary password."},
    {"method": "GET",   "path": "/api/v1/admin/subscriptions/metrics", "roles": "SUPER_ADMIN", "desc": "Aggregates SaaS MRR, active licenses, and clinic retention stats."},
    {"method": "GET",   "path": "/api/v1/admin/audit/logs", "roles": "SUPER_ADMIN", "desc": "Returns global CNDP audit log trail across all tenant practices."},
    # Patients
    {"method": "POST",   "path": "/api/v1/patients", "roles": "DOCTOR, SECRETARY", "desc": "Registers a new patient with Moroccan CIN, phone, and mutuelle insurance."},
    {"method": "GET",    "path": "/api/v1/patients/{id}", "roles": "DOCTOR, SECRETARY", "desc": "Retrieves individual patient demographic and contact dossier."},
    {"method": "GET",    "path": "/api/v1/patients", "roles": "DOCTOR, SECRETARY", "desc": "Returns paginated patient directory with name and CIN search filter."},
    {"method": "PUT",    "path": "/api/v1/patients/{id}", "roles": "DOCTOR, SECRETARY", "desc": "Updates patient demographic or mutuelle details."},
    {"method": "DELETE", "path": "/api/v1/patients/{id}", "roles": "DOCTOR, SECRETARY", "desc": "Executes CNDP-compliant soft delete (marks deleted_at timestamp)."},
    # Agenda & Real-Time Waiting Room
    {"method": "GET",   "path": "/api/v1/agenda", "roles": "DOCTOR, SECRETARY", "desc": "Retrieves daily practitioner schedule filtered by date and doctor."},
    {"method": "POST",  "path": "/api/v1/agenda", "roles": "DOCTOR, SECRETARY", "desc": "Schedules a new appointment with slot conflict verification."},
    {"method": "GET",   "path": "/api/v1/agenda/{id}", "roles": "DOCTOR, SECRETARY", "desc": "Retrieves appointment details and historical timestamps."},
    {"method": "PATCH", "path": "/api/v1/agenda/{id}/status", "roles": "DOCTOR, SECRETARY", "desc": "Transitions appointment state (EN_ATTENTE, EN_CONSULTATION, TERMINE, ANNULE)."},
    {"method": "GET",   "path": "/api/v1/agenda/stream", "roles": "DOCTOR, SECRETARY", "desc": "Subscribes client to live SSE stream for waiting-room queue updates."},
    {"method": "POST",  "path": "/api/v1/agenda/{id}/call", "roles": "DOCTOR", "desc": "Doctor Pager CTA: alerts reception that physician is calling patient into consultation."},
    # Consultations & Clinical Speed Engine
    {"method": "POST", "path": "/api/v1/consultations", "roles": "DOCTOR", "desc": "Creates clinical consultation record, observations, and prescription."},
    {"method": "GET",  "path": "/api/v1/consultations/{id}", "roles": "DOCTOR", "desc": "Retrieves consultation details, diagnostic findings, and prescription lines."},
    {"method": "GET",  "path": "/api/v1/consultations/patient/{patientId}", "roles": "DOCTOR", "desc": "Retrieves complete chronological medical history for a patient."},
    {"method": "GET",  "path": "/api/v1/consultations/{id}/ordonnance/pdf", "roles": "DOCTOR, SECRETARY", "desc": "Generates downloadable vector OpenPDF medical prescription."},
    {"method": "GET",  "path": "/api/v1/consultations/catalog/medications", "roles": "DOCTOR", "desc": "Fast autocomplete query against the 28+ Moroccan drug catalog."},
    {"method": "GET",  "path": "/api/v1/consultations/templates", "roles": "DOCTOR", "desc": "Retrieves available global and custom ordonnance templates."},
    {"method": "POST", "path": "/api/v1/consultations/templates", "roles": "DOCTOR", "desc": "Creates a reusable clinical prescription template for the clinic."},
    {"method": "POST", "path": "/api/v1/consultations/{consultationId}/bilans", "roles": "DOCTOR", "desc": "Issues a biological or radiological diagnostic investigation request."},
    {"method": "GET",  "path": "/api/v1/consultations/bilans/{id}/pdf", "roles": "DOCTOR, SECRETARY", "desc": "Renders official OpenPDF Demande de Bilan Diagnostic document."},
    {"method": "POST", "path": "/api/v1/consultations/{consultationId}/certificates", "roles": "DOCTOR", "desc": "Generates a certified medical leave (arret de travail) or fitness certificate."},
    {"method": "GET",  "path": "/api/v1/consultations/certificates/{id}/pdf", "roles": "DOCTOR, SECRETARY", "desc": "Renders official OpenPDF Certificat Médical with spellout days."},
    # Billing & Caisse
    {"method": "POST", "path": "/api/v1/billing/invoices", "roles": "SECRETARY, DOCTOR", "desc": "Creates a consultation invoice with strict MAD BigDecimal totals."},
    {"method": "POST", "path": "/api/v1/billing/payments", "roles": "SECRETARY, DOCTOR", "desc": "Registers a payment installment with specified payment method."},
    {"method": "POST", "path": "/api/v1/billing/direct-encaissement", "roles": "SECRETARY, DOCTOR", "desc": "One-click invoice creation and instant payment settlement in MAD."},
    {"method": "GET",  "path": "/api/v1/billing/ledger", "roles": "SECRETARY, DOCTOR", "desc": "Returns daily Caisse journalière totals categorized by payment method."},
    {"method": "GET",  "path": "/api/v1/billing/invoices/{id}", "roles": "SECRETARY, DOCTOR", "desc": "Retrieves invoice details, line items, and payment history."},
    {"method": "GET",  "path": "/api/v1/billing/invoices/{id}/receipt", "roles": "SECRETARY, DOCTOR", "desc": "Generates branded OpenPDF payment receipt in Moroccan Dirhams."},
    {"method": "GET",  "path": "/api/v1/billing/invoices/pending", "roles": "SECRETARY, DOCTOR", "desc": "Lists outstanding unpaid or partially paid patient invoices."},
    # CNSS / AMO
    {"method": "POST",  "path": "/api/v1/cnss/generate", "roles": "SECRETARY, DOCTOR", "desc": "Generates official Feuille de Soins record with AMO act codes."},
    {"method": "GET",   "path": "/api/v1/cnss/{id}/pdf", "roles": "SECRETARY, DOCTOR", "desc": "Renders printable OpenPDF Feuille de Soins (FIP-1 compliant layout)."},
    {"method": "GET",   "path": "/api/v1/cnss/patient/{patientId}", "roles": "SECRETARY, DOCTOR", "desc": "Retrieves all insurance claim forms generated for a patient."},
    {"method": "PATCH", "path": "/api/v1/cnss/{id}/printed", "roles": "SECRETARY, DOCTOR", "desc": "Marks a Feuille de Soins status as PRINTED for audit tracking."},
    # Document Vault & Medical Imaging (MinIO)
    {"method": "POST",   "path": "/api/v1/documents/upload", "roles": "DOCTOR, SECRETARY", "desc": "Uploads medical imaging or administrative scan to MinIO vault with automatic CNDP visibility assignment."},
    {"method": "GET",    "path": "/api/v1/documents/patient/{patientId}", "roles": "DOCTOR, SECRETARY", "desc": "Retrieves patient document directory filtered by role (Secretaries see only SHARED_SECRETARY)."},
    {"method": "GET",    "path": "/api/v1/documents/{id}/stream", "roles": "DOCTOR, SECRETARY", "desc": "Streams binary file with Content-Disposition: inline (Secretaries blocked with 403 on DOCTOR_ONLY)."},
    {"method": "DELETE", "path": "/api/v1/documents/{id}", "roles": "DOCTOR, SECRETARY", "desc": "Executes CNDP-compliant soft delete (marks deleted_at timestamp) on patient document."}
]

FRONTEND_WORKSPACES = [
    {
        "workspace": "Public Landing & ROI Engine",
        "route": "/",
        "technologies": "Three.js Canvas, Lucide React, Tailwind CSS v4",
        "description": "Interactive showcase featuring a dynamic 3D medical network visualization and a live Moroccan clinic financial ROI calculator in MAD."
    },
    {
        "workspace": "Secretary Front-Desk Workspace",
        "route": "/app (Secretary Role)",
        "technologies": "Zustand, TanStack Query, Radix UI Dialog, Global Command Palette",
        "description": "High-density reception dashboard engineered for the 3-second SLA. Features real-time waiting room FIFO display, instant walk-in check-in, fast slot booking, and quick direct encaissement."
    },
    {
        "workspace": "Doctor Clinical Speed Workspace",
        "route": "/app (Doctor Role)",
        "technologies": "Clinical Speed Engine, OpenPDF Viewer, Tabbed Clinical Panels",
        "description": "Physician cockpit with Doctor Pager CTA, sub-minute ordonnance generation with Moroccan drug search, one-click template insertion, diagnostic requests, and sick-leave certificates."
    },
    {
        "workspace": "Caisse Journalière Workspace",
        "route": "/app/caisse",
        "technologies": "Lucide React, Tabular Mono Font, OpenPDF Receipt Generator",
        "description": "Financial register view displaying real-time daily cash, TPE card, cheque, and transfer totals in MAD with one-click receipt printing."
    },
    {
        "workspace": "Super Admin Governance Portal",
        "route": "/admin/*",
        "technologies": "AdminLayout, ProtectedRoute, RoleGuard, CNDP Audit Table",
        "description": "Multi-tenant cabinet directory, 15-digit ICE validation, subscription state toggles (ACTIVE/SUSPENDED), user credential reset modal, and CNDP audit log inspector."
    }
]

CHANGELOG_ENTRIES = [
    {
        "phase": "Phase 1: Patient Domain Foundation",
        "date": "October 2026",
        "modules": "backend:patient, frontend:patients",
        "migrations": "V1",
        "summary": "Core patient registry with Moroccan CIN uniqueness, phone normalization (+212), mutuelle type, and CNDP audit columns."
    },
    {
        "phase": "Phase 2: Smart Agenda & Scheduling",
        "date": "October 2026",
        "modules": "backend:agenda, frontend:agenda",
        "migrations": "V2",
        "summary": "Multi-practitioner scheduling calendar with optimistic locking and sub-3-second appointment reservation."
    },
    {
        "phase": "Phase 3: Clinical Consultation & Ordonnances",
        "date": "October 2026",
        "modules": "backend:consultation, frontend:consultation",
        "migrations": "V3",
        "summary": "Clinical consultation records, diagnostic findings, vitals, and vector OpenPDF prescription generator."
    },
    {
        "phase": "Phase 4: Caisse Journalière & MAD Accounting",
        "date": "October 2026",
        "modules": "backend:billing, frontend:caisse",
        "migrations": "V4",
        "summary": "Financial ledger with strict BigDecimal MAD currency precision, split payment support, and official payment receipts."
    },
    {
        "phase": "Phase 5: CNSS / AMO Feuille de Soins Generator",
        "date": "October 2026",
        "modules": "backend:cnss, frontend:cnss",
        "migrations": "V5",
        "summary": "Standardized Moroccan AMO reimbursement claim generator (FIP-1 to FIP-8) with practitioner INPE and print tracking."
    },
    {
        "phase": "Phase 6: Multi-Tenancy SaaS Foundation & RBAC",
        "date": "October 2026",
        "modules": "backend:auth, backend:admin, frontend:admin",
        "migrations": "V6",
        "summary": "Full multi-tenant architecture: clinics table with 15-digit ICE, users table with SUPER_ADMIN, DOCTOR, SECRETARY roles, and clinic_id scoping."
    },
    {
        "phase": "Phase 7: Real-Time SSE Waiting Room & Doctor Pager",
        "date": "October 2026",
        "modules": "backend:agenda, docker:nginx, frontend:dashboard",
        "migrations": "V7",
        "summary": "Real-time waiting room FIFO tracking (arrived_at, called_at), multi-tenant SSE streaming with unbuffered Nginx proxy, and Doctor Pager CTA."
    },
    {
        "phase": "Phase 8: Clinical Speed Engine & Drug Catalog",
        "date": "October 2026",
        "modules": "backend:consultation, frontend:consultation",
        "migrations": "V8",
        "summary": "Moroccan medication catalog (28 pre-seeded drugs), prescription templates, diagnostic requests (bilans), medical certificates, and OpenPDF generators."
    },
    {
        "phase": "Phase 9: Living Word Architecture Documentation Engine",
        "date": "October 2026",
        "modules": "docs, scripts, skills",
        "migrations": "N/A (Documentation Governance)",
        "summary": "Established automated python-docx specification engine, Living Architecture Document Protocol skill (06), and permanent AGENTS.md DoD rule."
    },
    {
        "phase": "Phase 10: Coffre-Fort Documents & Imagerie (MinIO S3)",
        "date": "October 2026",
        "modules": "backend:vault, docker:minio, frontend:vault",
        "migrations": "V9",
        "summary": "100% on-premise Moroccan medical vault (MinIO), multi-tenant object namespaces, CNDP doctor vs. secretary privacy isolation, slide-over negative contrast split viewer for radiography, and full soft-delete auditability."
    },
    {
        "phase": "Phase 11: Authentic Moroccan Clinical Practice Dataset",
        "date": "October 2026",
        "modules": "backend:db, docker:postgres, docker:minio",
        "migrations": "V10",
        "summary": "Full clinical lifecycle dataset for Clinique Ibn Sina Agadir: 10 Moroccan patients with authentic identities (CIN, CNSS/CNOPS, E.164 phone numbers), dynamic agenda queue with real-time waiting room FIFO tracking, completed consultations with vitals and Moroccan drug prescriptions, active daily caisse ledger in MAD across cash/TPE/cheque, diagnostic requests, sick-leave certificates, and vault documents with MinIO binary objects."
    }
]

# ==============================================================================
# 2. WORD DOCUMENT STYLING & FORMATTING HELPERS
# ==============================================================================

COLOR_ZINC_DARK = "18181B"      # Deep Zinc for primary titles and text
COLOR_EMERALD_PRIMARY = "059669" # Medical Emerald primary accent
COLOR_EMERALD_LIGHT = "F0FDF4"   # Soft emerald callout background
COLOR_EMERALD_BORDER = "10B981"  # Emerald border
COLOR_BORDER_GREY = "E4E4E7"     # Hairline border
COLOR_ZEBRA_ROW = "F8FAFC"       # Alternating table row light fill
COLOR_WHITE = "FFFFFF"

def set_cell_background(cell, fill_hex):
    """Sets background fill color for a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    """Sets internal padding (in dxa) for a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_hairline_borders(table, border_color=COLOR_BORDER_GREY):
    """Applies sleek hairline borders to a table."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def add_callout_box(doc, text, bold_prefix="", border_color=COLOR_EMERALD_PRIMARY, bg_color=COLOR_EMERALD_LIGHT):
    """Renders an executive-grade callout banner with a thick left accent border."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False

    cell = tbl.rows[0].cells[0]
    cell.width = Inches(6.5)

    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg_color}"/>')
    tcPr.append(shd)

    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    set_cell_margins(cell, top=140, bottom=140, left=240, right=200)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15

    if bold_prefix:
        r_prefix = p.add_run(bold_prefix + " ")
        r_prefix.font.name = "Arial"
        r_prefix.font.size = Pt(9.5)
        r_prefix.font.bold = True
        r_prefix.font.color.rgb = RGBColor(5, 150, 105)

    r_text = p.add_run(text)
    r_text.font.name = "Arial"
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = RGBColor(24, 24, 27)

    # Empty spacer paragraph after table
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(4)
    p_spacer.paragraph_format.space_after = Pt(8)

def format_heading_1(p, text):
    """Styles a top-level section heading with Deep Zinc and underline accent."""
    p.paragraph_format.space_before = Pt(22)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(24, 24, 27)

def format_heading_2(p, text):
    """Styles a secondary subsection heading."""
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(12.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(5, 150, 105)

def format_body_p(p, text, bold_prefix=""):
    """Styles standard body text."""
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix + " ")
        r_b.font.name = "Arial"
        r_b.font.size = Pt(10)
        r_b.font.bold = True
        r_b.font.color.rgb = RGBColor(24, 24, 27)
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(63, 63, 70)

# ==============================================================================
# 3. DOCUMENT GENERATION PIPELINE
# ==============================================================================

def generate_specification_document(output_path):
    """Compiles all architecture data into an executive Word document."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = Document()

    # Set 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # --------------------------------------------------------------------------
    # COVER / TITLE BLOCK
    # --------------------------------------------------------------------------
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(10)
    p_meta.paragraph_format.space_after = Pt(4)
    r_cls = p_meta.add_run(f"DOSSIA PLATFORM SPECIFICATION • {METADATA['classification']}")
    r_cls.font.name = "Arial"
    r_cls.font.size = Pt(8.5)
    r_cls.font.bold = True
    r_cls.font.color.rgb = RGBColor(5, 150, 105)

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(2)
    r_title = p_title.add_run(METADATA["title"])
    r_title.font.name = "Arial"
    r_title.font.size = Pt(24)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(24, 24, 27)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(16)
    r_sub = p_sub.add_run(METADATA["subtitle"])
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(113, 113, 122)

    # Title Metadata Table
    tbl_meta = doc.add_table(rows=4, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_meta.autofit = False
    set_table_hairline_borders(tbl_meta)

    meta_rows = [
        ("Platform Version:", METADATA["version"]),
        ("Publication Date:", METADATA["date"]),
        ("Legal Regulations:", METADATA["legal_regulations"]),
        ("System Architecture:", "Spring Modulith (Java 21) • React 18 / Tailwind v4 • PostgreSQL 16 • Nginx")
    ]

    for idx, (lbl, val) in enumerate(meta_rows):
        c_lbl = tbl_meta.rows[idx].cells[0]
        c_val = tbl_meta.rows[idx].cells[1]
        c_lbl.width = Inches(1.8)
        c_val.width = Inches(4.7)
        set_cell_margins(c_lbl, top=80, bottom=80, left=100, right=100)
        set_cell_margins(c_val, top=80, bottom=80, left=100, right=100)
        set_cell_background(c_lbl, "F4F4F5")

        p_l = c_lbl.paragraphs[0]
        p_l.paragraph_format.space_after = Pt(0)
        r_l = p_l.add_run(lbl)
        r_l.font.name = "Arial"
        r_l.font.size = Pt(9)
        r_l.font.bold = True
        r_l.font.color.rgb = RGBColor(24, 24, 27)

        p_v = c_val.paragraphs[0]
        p_v.paragraph_format.space_after = Pt(0)
        r_v = p_v.add_run(val)
        r_v.font.name = "Arial"
        r_v.font.size = Pt(9)
        r_v.font.color.rgb = RGBColor(63, 63, 70)

    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_before = Pt(16)
    p_div.paragraph_format.space_after = Pt(10)

    # --------------------------------------------------------------------------
    # 1. EXECUTIVE SUMMARY & MOROCCAN HEALTHCARE CONTEXT
    # --------------------------------------------------------------------------
    format_heading_1(doc.add_paragraph(), "1. Executive Summary & Moroccan Clinical Ecosystem")
    format_body_p(doc.add_paragraph(), EXECUTIVE_SUMMARY["mission"])

    add_callout_box(
        doc,
        EXECUTIVE_SUMMARY["secretary_first_sla"],
        bold_prefix="THE SECRETARY-FIRST PHILOSOPHY (3-SECOND SLA):"
    )

    format_heading_2(doc.add_paragraph(), "Moroccan Domain & Regulatory Pillars")
    for pillar, desc in EXECUTIVE_SUMMARY["moroccan_context"]:
        p_pil = doc.add_paragraph()
        format_body_p(p_pil, desc, bold_prefix=f"• {pillar}:")

    # --------------------------------------------------------------------------
    # 2. SYSTEM & CONTAINER ARCHITECTURE
    # --------------------------------------------------------------------------
    format_heading_1(doc.add_paragraph(), "2. System & Container Architecture")
    format_body_p(
        doc.add_paragraph(),
        "Dossia is built on a clean containerized architecture orchestrated via Docker Compose. "
        "The Spring Modulith backend enforces modular boundaries, while Nginx terminates TLS and manages "
        "unbuffered Server-Sent Events (SSE) connections for real-time waiting room updates."
    )

    tbl_cont = doc.add_table(rows=len(SYSTEM_CONTAINERS) + 1, cols=3)
    tbl_cont.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_cont.autofit = False
    set_table_hairline_borders(tbl_cont)

    headers_cont = ["Component", "Technology Stack", "Architectural Role & Scope"]
    widths_cont = [Inches(1.8), Inches(2.2), Inches(2.5)]

    for c_idx, h_text in enumerate(headers_cont):
        cell = tbl_cont.rows[0].cells[c_idx]
        cell.width = widths_cont[c_idx]
        set_cell_background(cell, COLOR_EMERALD_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, c_data in enumerate(SYSTEM_CONTAINERS):
        row_cells = tbl_cont.rows[r_idx + 1].cells
        bg = COLOR_ZEBRA_ROW if r_idx % 2 == 1 else COLOR_WHITE
        for c_idx, (val, w) in enumerate(zip([c_data["component"], c_data["tech"], c_data["role"]], widths_cont)):
            cell = row_cells[c_idx]
            cell.width = w
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=90, bottom=90, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(9)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(24, 24, 27)
            else:
                r.font.color.rgb = RGBColor(63, 63, 70)

    p_sp1 = doc.add_paragraph()
    p_sp1.paragraph_format.space_before = Pt(8)

    # --------------------------------------------------------------------------
    # 3. MULTI-TENANCY, SECURITY & RBAC MATRIX
    # --------------------------------------------------------------------------
    format_heading_1(doc.add_paragraph(), "3. Multi-Tenancy, Security & RBAC Matrix")
    format_body_p(
        doc.add_paragraph(),
        "Dossia enforces strict SaaS multi-tenancy at the relational layer using foreign key clinic_id "
        "scoping on every business entity. Cross-tenant leakage is prevented via Spring Security filters and "
        "ThreadLocal SecurityUtils extraction."
    )

    add_callout_box(
        doc,
        "Under Moroccan Law 09-08 (CNDP), health data cannot be physically purged. Dossia mandates "
        "soft-delete preservation (deleted_at TIMESTAMP) across all patient records, consultations, and invoices. "
        "All database records include created_at, created_by, updated_at, and updated_by audit columns.",
        bold_prefix="CNDP LOI 09-08 LEGAL MANDATE:"
    )

    # RBAC Table
    rbac_matrix = [
        ("SUPER_ADMIN", "Dossia Platform Owner", "Clinic provisioning, ICE verification, subscription toggles, global CNDP audit log review."),
        ("DOCTOR", "Licensed Practitioner", "Clinical consultations, Clinical Speed Engine, Ordonnance/Bilan/Certificate generation, Doctor Pager call."),
        ("SECRETARY", "Medical Assistant (Front-Desk)", "Patient check-in, Smart Agenda scheduling (<3s SLA), direct Caisse encaissement, and CNSS Feuille de Soins.")
    ]

    tbl_rbac = doc.add_table(rows=len(rbac_matrix) + 1, cols=3)
    tbl_rbac.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_rbac.autofit = False
    set_table_hairline_borders(tbl_rbac)

    headers_rbac = ["Role Identifier", "Persona & Scope", "Functional Permissions & Capabilities"]
    widths_rbac = [Inches(1.8), Inches(2.0), Inches(2.7)]

    for c_idx, h_text in enumerate(headers_rbac):
        cell = tbl_rbac.rows[0].cells[c_idx]
        cell.width = widths_rbac[c_idx]
        set_cell_background(cell, COLOR_EMERALD_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, (role, persona, perms) in enumerate(rbac_matrix):
        row_cells = tbl_rbac.rows[r_idx + 1].cells
        bg = COLOR_ZEBRA_ROW if r_idx % 2 == 1 else COLOR_WHITE
        for c_idx, (val, w) in enumerate(zip([role, persona, perms], widths_rbac)):
            cell = row_cells[c_idx]
            cell.width = w
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=90, bottom=90, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(9)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(24, 24, 27)
            else:
                r.font.color.rgb = RGBColor(63, 63, 70)

    p_sp2 = doc.add_paragraph()
    p_sp2.paragraph_format.space_before = Pt(8)

    # --------------------------------------------------------------------------
    # 4. SPRING MODULITH BOUNDED CONTEXTS
    # --------------------------------------------------------------------------
    format_heading_1(doc.add_paragraph(), "4. Spring Modulith Bounded Contexts")
    format_body_p(
        doc.add_paragraph(),
        "Dossia adopts the Spring Modulith architectural pattern on Java 21. Cross-module database "
        "querying is strictly forbidden; communication is achieved either via immutable Application Events "
        "or strongly-typed public interfaces."
    )

    for mod in BOUNDED_CONTEXTS:
        format_heading_2(doc.add_paragraph(), f"{mod['title']} ({mod['name']})")
        format_body_p(doc.add_paragraph(), mod["description"])

        p_mod_details = doc.add_paragraph()
        format_body_p(p_mod_details, ", ".join(mod["entities"]), bold_prefix="• Domain Entities:")
        p_mod_events = doc.add_paragraph()
        format_body_p(p_mod_events, ", ".join(mod["events"]), bold_prefix="• Domain Events:")
        p_mod_services = doc.add_paragraph()
        format_body_p(p_mod_services, ", ".join(mod["services"]), bold_prefix="• Core Public Services:")

    # --------------------------------------------------------------------------
    # 5. FLYWAY MIGRATION LEDGER
    # --------------------------------------------------------------------------
    format_heading_1(doc.add_paragraph(), "5. Flyway Migration Ledger")
    format_body_p(
        doc.add_paragraph(),
        "All database schema changes are managed strictly through Flyway versioned SQL scripts. "
        "The following ledger details every migration currently active in production."
    )

    tbl_fly = doc.add_table(rows=len(FLYWAY_LEDGER) + 1, cols=4)
    tbl_fly.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_fly.autofit = False
    set_table_hairline_borders(tbl_fly)

    headers_fly = ["Version & Script", "Affected Tables", "Tenant Scoping", "Architectural Scope & Changes"]
    widths_fly = [Inches(1.8), Inches(1.5), Inches(1.0), Inches(2.2)]

    for c_idx, h_text in enumerate(headers_fly):
        cell = tbl_fly.rows[0].cells[c_idx]
        cell.width = widths_fly[c_idx]
        set_cell_background(cell, COLOR_EMERALD_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.name = "Arial"
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, f_data in enumerate(FLYWAY_LEDGER):
        row_cells = tbl_fly.rows[r_idx + 1].cells
        bg = COLOR_ZEBRA_ROW if r_idx % 2 == 1 else COLOR_WHITE
        row_values = [
            f"{f_data['version']}\n{f_data['script']}",
            f_data['tables'],
            f_data['tenant_isolated'],
            f_data['description']
        ]
        for c_idx, (val, w) in enumerate(zip(row_values, widths_fly)):
            cell = row_cells[c_idx]
            cell.width = w
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(8.5)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(24, 24, 27)
            else:
                r.font.color.rgb = RGBColor(63, 63, 70)

    p_sp3 = doc.add_paragraph()
    p_sp3.paragraph_format.space_before = Pt(8)

    # --------------------------------------------------------------------------
    # 6. REST API ENDPOINT CATALOG
    # --------------------------------------------------------------------------
    format_heading_1(doc.add_paragraph(), "6. REST API Endpoint Catalog")
    format_body_p(
        doc.add_paragraph(),
        f"The Dossia platform exposes {len(REST_ENDPOINTS)} production endpoints adhering to RESTful "
        "conventions and RFC 7807 ProblemDetail error responses."
    )

    tbl_api = doc.add_table(rows=len(REST_ENDPOINTS) + 1, cols=4)
    tbl_api.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_api.autofit = False
    set_table_hairline_borders(tbl_api)

    headers_api = ["HTTP", "Endpoint URI", "RBAC Role", "Contract Description"]
    widths_api = [Inches(0.8), Inches(2.4), Inches(1.3), Inches(2.0)]

    for c_idx, h_text in enumerate(headers_api):
        cell = tbl_api.rows[0].cells[c_idx]
        cell.width = widths_api[c_idx]
        set_cell_background(cell, COLOR_EMERALD_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.name = "Arial"
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, ep in enumerate(REST_ENDPOINTS):
        row_cells = tbl_api.rows[r_idx + 1].cells
        bg = COLOR_ZEBRA_ROW if r_idx % 2 == 1 else COLOR_WHITE
        row_values = [ep["method"], ep["path"], ep["roles"], ep["desc"]]
        for c_idx, (val, w) in enumerate(zip(row_values, widths_api)):
            cell = row_cells[c_idx]
            cell.width = w
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=70, bottom=70, left=90, right=90)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(8)
            if c_idx == 0:
                r.font.bold = True
                if val == "GET":
                    r.font.color.rgb = RGBColor(5, 150, 105)
                elif val == "POST":
                    r.font.color.rgb = RGBColor(37, 99, 235)
                elif val == "PATCH" or val == "PUT":
                    r.font.color.rgb = RGBColor(217, 119, 6)
                elif val == "DELETE":
                    r.font.color.rgb = RGBColor(220, 38, 38)
            elif c_idx == 1:
                r.font.bold = True
                r.font.color.rgb = RGBColor(24, 24, 27)
            else:
                r.font.color.rgb = RGBColor(63, 63, 70)

    p_sp4 = doc.add_paragraph()
    p_sp4.paragraph_format.space_before = Pt(8)

    # --------------------------------------------------------------------------
    # 7. FRONTEND WORKSPACES & UX ERGONOMICS
    # --------------------------------------------------------------------------
    format_heading_1(doc.add_paragraph(), "7. Frontend Workspaces & UX Ergonomics")
    format_body_p(
        doc.add_paragraph(),
        "The Dossia frontend is structured into dedicated, role-gated workspaces. Each workspace adheres "
        "to the 'Secretary-First' high-density design system defined in skill 01-premium-ui-craft.md."
    )

    tbl_fe = doc.add_table(rows=len(FRONTEND_WORKSPACES) + 1, cols=3)
    tbl_fe.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_fe.autofit = False
    set_table_hairline_borders(tbl_fe)

    headers_fe = ["Workspace & Route", "Core Technologies", "Ergonomics & Clinical Workflow"]
    widths_fe = [Inches(1.8), Inches(1.8), Inches(2.9)]

    for c_idx, h_text in enumerate(headers_fe):
        cell = tbl_fe.rows[0].cells[c_idx]
        cell.width = widths_fe[c_idx]
        set_cell_background(cell, COLOR_EMERALD_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, ws in enumerate(FRONTEND_WORKSPACES):
        row_cells = tbl_fe.rows[r_idx + 1].cells
        bg = COLOR_ZEBRA_ROW if r_idx % 2 == 1 else COLOR_WHITE
        row_values = [
            f"{ws['workspace']}\n{ws['route']}",
            ws['technologies'],
            ws['description']
        ]
        for c_idx, (val, w) in enumerate(zip(row_values, widths_fe)):
            cell = row_cells[c_idx]
            cell.width = w
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=90, bottom=90, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(9)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(24, 24, 27)
            else:
                r.font.color.rgb = RGBColor(63, 63, 70)

    p_sp5 = doc.add_paragraph()
    p_sp5.paragraph_format.space_before = Pt(8)

    # --------------------------------------------------------------------------
    # 8. LIVING FEATURE & ARCHITECTURE CHANGELOG
    # --------------------------------------------------------------------------
    format_heading_1(doc.add_paragraph(), "8. Living Feature & Architecture Changelog")
    format_body_p(
        doc.add_paragraph(),
        "This chronological ledger logs every completed development phase. Per AGENTS.md Section 4, "
        "agents must append new phases upon completing functional capabilities or architectural modifications."
    )

    tbl_ch = doc.add_table(rows=len(CHANGELOG_ENTRIES) + 1, cols=4)
    tbl_ch.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_ch.autofit = False
    set_table_hairline_borders(tbl_ch)

    headers_ch = ["Phase & Scope", "Date", "Migrations", "Architectural Enhancements"]
    widths_ch = [Inches(1.8), Inches(1.1), Inches(0.9), Inches(2.7)]

    for c_idx, h_text in enumerate(headers_ch):
        cell = tbl_ch.rows[0].cells[c_idx]
        cell.width = widths_ch[c_idx]
        set_cell_background(cell, COLOR_EMERALD_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, ch in enumerate(CHANGELOG_ENTRIES):
        row_cells = tbl_ch.rows[r_idx + 1].cells
        bg = COLOR_ZEBRA_ROW if r_idx % 2 == 1 else COLOR_WHITE
        row_values = [
            f"{ch['phase']}\n({ch['modules']})",
            ch['date'],
            ch['migrations'],
            ch['summary']
        ]
        for c_idx, (val, w) in enumerate(zip(row_values, widths_ch)):
            cell = row_cells[c_idx]
            cell.width = w
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=90, bottom=90, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(9)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(24, 24, 27)
            else:
                r.font.color.rgb = RGBColor(63, 63, 70)

    # Save document
    doc.save(output_path)
    file_size_kb = os.path.getsize(output_path) / 1024
    print(f"SUCCESS: Generated {output_path} ({file_size_kb:.1f} KB)")

if __name__ == "__main__":
    target_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "Dossia_Architecture_Master_Spec.docx"))
    print(f"Compiling Living Word Specification to: {target_file}")
    generate_specification_document(target_file)
