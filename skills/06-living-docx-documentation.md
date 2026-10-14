# Skill: Living Word Architecture Documentation Protocol

> **Scope**: Monorepo Documentation Standard (`backend/`, `frontend/`, `ai/`, `docker/`)  
> **Output Artifact**: `/docs/Dossia_Architecture_Master_Spec.docx`  
> **Automation Engine**: `/scripts/generate_architecture_docx.py`

---

## 1. Single Source of Truth & Executive Specification

In enterprise healthcare deployments, documentation cannot be an outdated afterthought.  
The official, authoritative technical and clinical specification for Dossia is:
```
/docs/Dossia_Architecture_Master_Spec.docx
```

This document is **generated programmatically** via `/scripts/generate_architecture_docx.py` using `python-docx`. It ensures that doctors, clinic managers, hospital CIOs, technical auditors (CNDP, ANAM), and software engineers always have access to an executive-grade Word document with identical fidelity, precise typography, styled tables, and regulatory compliance mapping.

---

## 2. Mandatory Definition of Done (DoD) Contract

Every AI agent, subagent, and human engineer operating on the Dossia codebase is bound by this permanent governance rule:

> **The Living Architecture Document DoD Rule**:  
> No feature, database migration, endpoint addition, domain refactoring, or infrastructure update is considered **Done** until:
> 1. The data structures and changelog entries inside `/scripts/generate_architecture_docx.py` are updated to reflect the change.
> 2. `python scripts/generate_architecture_docx.py` has been executed to regenerate `/docs/Dossia_Architecture_Master_Spec.docx`.
> 3. The newly generated `.docx` file is verified to exist and be non-empty.

Any pull request, commit, or agent response that introduces architecture or schema changes without updating and regenerating this document violates project standards.

---

## 3. Seven Required Sections to Keep Synchronized

Whenever modifying or extending the Dossia platform, the following 7 core sections in the generator script must be audited and updated:

### 1. Executive Summary & Moroccan Healthcare Context
- **AMO / CNSS Automation**: Seamless electronic and print generation of standardized Feuilles de Soins (FIP-1 to FIP-8) with AMO codes.
- **MAD Financial Precision**: Strict non-floating `BigDecimal` (10, 2) arithmetic for Caisse Journalière, consultation fees, and TPE/Cash payments.
- **CNDP Law 09-08 Compliance**: Patient health record confidentiality, soft-delete preservation (`deleted_at`), real-IP forward logging, and audit columns.

### 2. System & Container Architecture
- **Backend**: Spring Modulith on Java 21, Spring Boot 3.x/4.x, Virtual Threads, RFC 7807 `ProblemDetail` localized error responses.
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide icons, Radix UI / Shadcn primitives, Three.js landing canvas.
- **Data & Cache**: PostgreSQL 16 with UUID v4 primary keys and FIFO index tuning.
- **Reverse Proxy**: Nginx container with dedicated SSE streaming rules (`proxy_buffering off; chunked_transfer_encoding off;`), 10M upload limits, and `X-Real-IP` forwarding.

### 3. Multi-Tenancy, Security & RBAC Matrix
- **Tenant Isolation**: Foreign key `clinic_id` scoping across all operational tables (`patients`, `appointments`, `invoices`, `consultations`, `feuilles_de_soins`, `prescription_templates`, `diagnostic_requests`, `medical_certificates`).
- **Role Hierarchy**:
  - `SUPER_ADMIN`: Dossia platform owner, clinic onboarding, subscription state toggling (`ACTIVE` / `SUSPENDED`), cross-tenant audit log inspection.
  - `DOCTOR`: Consultation workspace, Clinical Speed Engine, Ordonnance & Certificate generation, Doctor Pager (`callPatient`).
  - `SECRETARY`: Front-desk operations, Smart Agenda, fast walk-in check-in (<3s SLA), direct Caisse encaissement, CNSS feuille generation.
- **CNDP Audit Columns**: `created_at`, `created_by`, `updated_at`, `updated_by`, and soft-delete `deleted_at`.

### 4. Spring Modulith Bounded Contexts
Detailed breakdown of each module's domain responsibility, internal entities, public contracts, and published/consumed events:
- `auth`: JWT token authentication, clinic multi-tenancy context holder (`SecurityUtils`), user profile management.
- `admin`: Platform governance, clinic lifecycle, subscription tracking, and audit logging.
- `patient`: Demographic registry, Moroccan CIN uniqueness, phone normalization (`+212`), mutuelle mapping.
- `agenda`: Calendar scheduling, real-time waiting room FIFO tracking (`arrived_at`, `called_at`), multi-tenant SSE event bus (`WaitingRoomSseRegistry`), Doctor Pager.
- `consultation`: Clinical Speed Engine, consultation records, Moroccan drug catalog (28 pre-seeded medications), prescription templates, biology/radiology requests, certified medical leave, and OpenPDF generators.
- `billing`: Caisse journalière, invoice generation, direct encaissement, split payment methods (`ESPECES`, `TPE`, `CHEQUE`, `VIREMENT`), receipt PDF generation.
- `cnss`: AMO claims orchestrator, standardized Feuille de Soins generator (`CNSS`, `CNOPS`, `FAR`), print tracking.

### 5. Flyway Migration Ledger
A continuous mapping of all migration files:
- Version (`V1` through `V{N}`)
- Migration file name and timestamp
- Target tables created or altered
- Multi-tenancy status (`clinic_id` foreign key)
- Key indexes created (FIFO, search, CNDP soft-delete filters)

### 6. Frontend Workspaces & UX Ergonomics
- **Three.js Landing Page**: 3D interactive medical network canvas, Moroccan clinic ROI calculator in MAD.
- **Secretary Workspace**: 3-second action SLA, compact row height (`h-9`), keyboard navigation (`Ctrl+K` command palette), instant walk-in check-in.
- **Doctor Clinical Workspace**: Tabbed speed engine (Consultation, Bilans, Certificats), drug autocomplete, one-click template insertion, inline OpenPDF preview.
- **Caisse Workspace**: Daily cash register ledger, live totals by payment method, one-click direct encaissement modal.
- **Admin Workspace**: Clinic directory, ICE validation, subscription status toggles, user password resets.
- **Error Handling**: RFC 7807 ProblemDetail integration with French Sonner toast alerts.

### 7. Living Feature & Architecture Changelog
A chronological ledger logging every completed development phase:
- Phase / Version
- Completion Date
- Scope & Modules Modified
- Database Migration Range
- Key Architectural Highlights

---

## 4. Execution Workflow

To regenerate the documentation after an update:
```bash
# 1. Ensure dependencies are satisfied
pip install python-docx

# 2. Run the generator script
python scripts/generate_architecture_docx.py

# 3. Verify output
# /docs/Dossia_Architecture_Master_Spec.docx should be updated with a new timestamp
```
