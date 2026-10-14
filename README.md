# Dossia (دوسية) — Digital Medical Operating System

<div align="center">

![Dossia Banner](https://img.shields.io/badge/DOSSIA-Clinical%20SaaS-059669?style=for-the-badge&logo=shield)
[![Java 21](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4+-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Modulith](https://img.shields.io/badge/Spring_Modulith-Modular%20Monolith-6DB33F?style=for-the-badge)](https://spring.io/projects/spring-modulith)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![CNDP Compliant](https://img.shields.io/badge/CNDP-Loi%2009--08%20Compliant-059669?style=for-the-badge)](https://www.cndp.ma/)

**The Digital Operating System for Moroccan Private Medical Cabinets & Clinics**  
*Cabinet Médical • Clinique Privée • Pratique Médicale Marocaine*

[Architecture Spec (Word)](docs/Dossia_Architecture_Master_Spec.docx) • [Quick Start](#quick-start--local-development) • [Modules](#core-platform-modules) • [CNDP Compliance](#moroccan-regulatory--clinical-pillars)

</div>

---

## Executive Overview & Mission

**Dossia** modernizes and streamlines private healthcare practices across Morocco. Designed from the ground up for the realities of Moroccan private medicine, Dossia eliminates the friction between clinical consultations, fast-paced reception desks, social security claims (AMO / CNSS / CNOPS), and strict patient confidentiality laws (**CNDP Loi 09-08**).

### The "Secretary-First" (*L'Assistante Médicale*) Philosophy
The primary day-to-day operator of Dossia is the **medical secretary**, not the physician:
- **Operating Reality**: Managing 30 to 60 patients daily, answering continuous phone calls while checking in walk-ins and collecting payments under high waiting-room pressure.
- **The 3-Second SLA**: Any recurring action—booking an appointment, checking in a walk-in, recording an encaissement, or generating a *Feuille de Soins*—is executable in **under 3 seconds**.
- **Ergonomics**: High data density (`h-9` table rows), zero layout shifts, tabular monospace typography for currency in MAD, and keyboard-first navigation via global command palette (`Ctrl+K`).

---

## Core Platform Modules

```
                    ┌────────────────────────────────────────────────────────┐
                    │               DOSSIA PLATFORM GATEWAY                  │
                    │         Nginx Reverse Proxy + SSE Event Broker         │
                    └───────────────────────────┬────────────────────────────┘
                                                │
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         ▼                                                                             ▼
┌─────────────────────────────────┐                                   ┌─────────────────────────────────┐
│        REACT 18/19 SPA          │                                   │     SPRING MODULITH BACKEND     │
│   • Three.js Interactive Hero   │                                   │   • Java 21 Virtual Threads     │
│   • Secretary Reception Cockpit │                                   │   • Multi-Tenant Isolation      │
│   • Doctor Speed Workspace      │◄────────── REST / SSE ───────────►│   • OpenPDF Vector Engines      │
│   • Caisse Journalière in MAD   │                                   │   • RFC 7807 Error Responses    │
│   • Super Admin SaaS Portal     │                                   │   • PostgreSQL 16 + Flyway      │
└─────────────────────────────────┘                                   └─────────────────────────────────┘
```

### 1. ⚡ Clinical Speed Engine
- **Moroccan Drug Catalog**: Integrated 28+ pre-seeded Moroccan medication library with brand names, DCIs, standard posology, and official prices (PPV in MAD).
- **1-Click Prescription Templates**: Reusable ordonnance templates for common pathologies (Angine Bactérienne, HTA, Gastro-entérite, Rhinopharyngite).
- **Demandes de Bilans**: Biological and radiological investigation requests with OpenPDF generation.
- **Certified Medical Certificates**: Official medical leave (*Arrêt de Travail* with French spelled-out days) and aptitude/school certificates.
- **OpenPDF Generators**: Vector high-definition PDF rendering with clinic headers, practitioner INPE, and CNDP notices.

### 2. ⏱️ Smart Agenda & Real-Time Waiting Room
- **Multi-Practitioner Scheduling**: Dynamic calendar with conflict detection and optimistic locking (`@Version`).
- **Real-Time FIFO Waiting Queue**: Real-time arrival (`arrived_at`) and call (`called_at`) metrics.
- **Server-Sent Events (SSE)**: Dedicated unbuffered event channel (`/api/v1/agenda/stream`) syncing reception and doctor rooms instantly.
- **Doctor Pager CTA**: One-click notification summoning the next waiting patient into the consultation office.

### 3. 💵 Facturation & Caisse Journalière in MAD
- **Strict Currency Precision**: Mathematical arithmetic enforced via Java `BigDecimal` (precision 10, scale 2) and `HALF_UP` rounding in Moroccan Dirhams (MAD).
- **Split Payment Methods**: Instant recording of `ESPECES` (Cash), `TPE` (Card), `CHEQUE`, and `VIREMENT` (Bank Transfer).
- **Direct Encaissement**: 1-click invoice creation and instant payment settlement.
- **Live Cash Ledger**: Real-time daily summary of all received funds and outstanding balances with official printable receipts.

### 4. 📑 AMO / CNSS / CNOPS Reimbursement Orchestrator
- **Official Feuilles de Soins**: Automated generation of Moroccan standard claims conforming to **FIP-1 through FIP-8** form models.
- **Institutional Mapping**: Auto-fills patient CIN, CNSS registration number, and physician 9-digit INPE.
- **Audit & Print Tracking**: Tracks claim status (`DRAFT`, `PRINTED`) for CNDP compliance.

### 5. 🏢 SaaS Multi-Tenancy & Governance
- **Practice Tenant Isolation**: Every operational entity is strictly scoped by `clinic_id`.
- **RBAC Security Hierarchy**:
  - `SUPER_ADMIN`: Clinic provisioning, 15-digit ICE validation, subscription controls (`ACTIVE` / `SUSPENDED`), cross-tenant audit trail.
  - `DOCTOR`: Clinical consultation workspace, speed engine, prescriptions, certificates, and doctor pager.
  - `SECRETARY`: Front-desk check-in, agenda booking (<3s SLA), direct encaissement, and CNSS claim generation.

---

## Moroccan Regulatory & Clinical Pillars

| Standard | Moroccan Regulation | Implementation in Dossia |
| :--- | :--- | :--- |
| **Data Privacy** | **CNDP Loi 09-08** | Non-destructive soft deletes (`deleted_at`), `X-Real-IP` forward headers, audit columns (`created_by`, `updated_by`). |
| **Financial Accounting** | **Code Général des Impôts** | Strict `BigDecimal(10, 2)` MAD currency representation; no floating-point rounding errors. |
| **Social Security** | **AMO / ANAM / CNSS** | Standardized *Feuille de Soins Maladie* (FIP-1 to FIP-8) generation with AMO act coding. |
| **Healthcare ID** | **INPE (9 digits)** | Mandatory practitioner national identification format enforced via Bean Validation (`@ValidInpe`). |
| **Practice Entity** | **ICE (15 digits)** | Practice tax identification validated before clinic provisioning. |

---

## Repository Structure

```
dossia/
├── backend/                        # Java 21 Spring Modulith Modular Monolith
│   ├── src/main/java/com/dossia/backend/
│   │   ├── admin/                  # Super Admin cabinet governance & subscriptions
│   │   ├── agenda/                 # Scheduling, waiting room FIFO queue & SSE streams
│   │   ├── auth/                   # JWT authentication, RBAC & multi-tenancy context
│   │   ├── billing/                # Facturation, encaissement & caisse in MAD
│   │   ├── cnss/                   # AMO/CNSS Feuille de Soins generation (FIP-1 to FIP-8)
│   │   ├── consultation/           # Clinical Speed Engine, Moroccan drugs & OpenPDF
│   │   ├── patient/                # Demographics, CIN uniqueness & mutuelle registry
│   │   └── common/                 # CNDP auditing, RFC 7807 exceptions & MAD utils
│   └── src/main/resources/db/migration/ # Flyway SQL migrations (V1 to V8)
├── frontend/                       # React 18/19 Single Page Application
│   ├── src/
│   │   ├── components/             # Reusable UI primitives (Radix, Dialogs, Modals)
│   │   ├── layouts/                # ClinicLayout (Secretary/Doctor) & AdminLayout
│   │   ├── pages/
│   │   │   ├── Landing/            # Three.js 3D medical network & MAD ROI calculator
│   │   │   ├── Dashboard/          # Secretary cockpit, Smart Agenda & Command Palette
│   │   │   ├── ConsultationWorkspace/ # Doctor Cockpit, drug search & bilans/certificats
│   │   │   ├── Caisse/             # Daily cash register, ledger & encaissement
│   │   │   └── admin/              # Super Admin cabinet onboarding & audit logs
│   │   └── store/                  # Zustand state slices (Auth, Theme, Agenda)
├── docker/                         # Production & Dev container configs
│   └── nginx/default.conf          # Nginx reverse proxy, security headers & SSE tuning
├── docs/                           # Living Architecture Documentation
│   └── Dossia_Architecture_Master_Spec.docx # Auto-generated Master Technical Spec
├── scripts/                        # Automation & Generation Engines
│   └── generate_architecture_docx.py # Living Word docx specification compiler
├── skills/                         # Engineering Knowledge Base & Governance Rules
│   ├── 01-premium-ui-craft.md      # Clinical UI design tokens & 3-second SLA
│   ├── 02-moroccan-domain.md       # Moroccan healthcare regulations & rules
│   ├── 03-testing-standards.md     # QA, unit, and integration testing mandates
│   ├── 04-spring-modulith-craft.md # Spring Modulith decoupled event architecture
│   ├── 05-backend-moroccan-domain.md # Backend schemas, MAD precision, INPE, CNDP
│   └── 06-living-docx-documentation.md # Living Architecture Document Protocol (.docx)
├── docker-compose.yml              # Multi-tier container orchestration
├── AGENTS.md                       # Monorepo Agent Governance & Operational Directives
└── README.md                       # This File
```

---

## Technology Stack

### Backend
- **Core Runtime**: Java 21 LTS (Oracle OpenJDK) with Project Loom Virtual Threads
- **Framework**: Spring Boot 3.4+ / 4.x
- **Architecture**: Spring Modulith (Application Modules, `@ApplicationModuleListener`)
- **Persistence**: Spring Data JPA, Hibernate 6, Flyway Migrations
- **Database**: PostgreSQL 16 Alpine with connection pooling (HikariCP)
- **Security**: Spring Security 6, Stateless JWT (JJWT 0.12.6), BCrypt
- **Document Engine**: OpenPDF 2.0.3 (Vector medical prescriptions, bilans, and CNSS forms)
- **Real-Time Streaming**: Spring MVC `SseEmitter` with multi-tenant broadcast registry

### Frontend
- **Framework**: React 18 / 19, TypeScript 5+, Vite
- **Styling**: Tailwind CSS v4, Lucide React icons
- **State & Caching**: Zustand, TanStack Query (React Query)
- **Primitives**: Radix UI accessible headless components
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Notifications**: Sonner (RFC 7807 ProblemDetail localized French error toasts)

### Infrastructure & Reverse Proxy
- **Gateway**: Nginx 1.27 Alpine with unbuffered SSE chunked streaming
- **Security Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`
- **Audit Forwarding**: `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto` for CNDP compliance

---

## Quick Start / Local Development

### Prerequisites
- **Docker & Docker Compose** (v2.20+)
- **Java 21 JDK** (for local backend development)
- **Node.js 20+** & **npm** (for local frontend development)
- **Python 3.12+** (for living documentation generation)

### 1. Instant Launch via Docker Compose (Recommended)
Clone the repository and run all services with unified Nginx gateway:
```bash
git clone https://github.com/Mohamed-Oulkadi/dossia.git
cd dossia

# Launch PostgreSQL, Backend, Frontend, and Nginx reverse proxy
docker-compose up -d --build
```
Once healthy, access the application:
- **Application Portal**: `http://localhost`
- **API Health Check**: `http://localhost/api/actuator/health`

### 2. Manual Local Development

#### A. Database Tier
Start a local PostgreSQL instance (or run via docker):
```bash
docker run --name dossia-postgres -e POSTGRES_DB=dossia_db -e POSTGRES_USER=dossia_user -e POSTGRES_PASSWORD=dossia_dev_password_2026 -p 5432:5432 -d postgres:16-alpine
```

#### B. Backend Tier (Spring Boot)
```bash
cd backend
./mvnw clean spring-boot:run
```
*Backend runs on `http://localhost:8080` (Flyway migrations V1–V8 apply automatically on boot).*

#### C. Frontend Tier (React / Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server runs on `http://localhost:5173`.*

---

## Seed Accounts (Development & Staging)

The database migration `V6__init_auth_schema.sql` automatically seeds the default test clinic and users:

| Persona | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@dossia.ma` | `Dossia2026!` | `SUPER_ADMIN` | Platform SaaS governance & clinic management |
| **Doctor** | `dr.amrani@dossia.ma` | `Dossia2026!` | `DOCTOR` | Practice physician (Clinique Ibn Sina Agadir) |
| **Secretary** | `secretaire.amina@dossia.ma` | `Dossia2026!` | `SECRETARY` | Front-desk medical assistant |

> **Practice Identity**: `Clinique Ibn Sina Agadir`  
> **ICE**: `001234567890123`  
> **Tenant ID**: `11111111-1111-1111-1111-111111111111`

---

## Living Architecture Specification (.docx)

Dossia enforces a **Living Word Documentation Protocol** (governed by [`skills/06-living-docx-documentation.md`](skills/06-living-docx-documentation.md)).  
The technical specification is maintained as a programmatically compiled executive Word document:

```bash
# Ensure python-docx is installed
pip install python-docx

# Compile the Master Specification Word Document
python scripts/generate_architecture_docx.py
```
Output: [`docs/Dossia_Architecture_Master_Spec.docx`](docs/Dossia_Architecture_Master_Spec.docx) (48+ KB, executive-styled with Deep Zinc `#18181B` headers, Medical Emerald `#059669` accents, zebra tables, and callouts).

---

## Testing & Quality Assurance

Dossia enforces zero tolerance for placeholder logic or unhandled promises:
```bash
# Run backend test suite (Unit & Spring Modulith Architecture Verification)
cd backend
./mvnw test

# Run frontend linting & TypeScript type checking
cd frontend
npm run lint
npm run build
```

---

## License & Governance

Confidential & Proprietary — Developed for Moroccan Healthcare Modernization.  
Governed by Moroccan Law 09-08 (CNDP) regarding the protection of personal and medical data.
