# Dossia Backend — Agent Governance & Architecture Framework

> **Scope**: `backend/` Service Domain  
> **Architecture Standard**: Strict Spring Modulith Modular Monolith  
> **Target Scale**: 1,000+ active Moroccan private practices & clinics with zero architectural drift.

---

## 1. Architectural Architecture & Module Topology

The Dossia backend is structured as a **Spring Modulith** application in Java 21+ and Spring Boot. Bounded domains are organized as top-level packages directly under `com.dossia.backend`:

```
com.dossia.backend/
├── DossiaApplication.java           # Spring Boot entry point & Modulith root
├── patient/                         # Bounded Context: Patient identity, CIN, CNDP audit, files
├── agenda/                          # Bounded Context: Smart Agenda, appointments, availability
├── billing/                         # Bounded Context: Invoices, MAD payments (Cash/TPE/Check)
└── cnss/                            # Bounded Context: CNSS / AMO claim sheets (FIP-1 to FIP-8)
```

Every domain package is a self-contained module. Modules expose public interfaces/records at the module root, while internal implementation details reside in unexported subpackages.

---

## 2. Specialized Backend Agent Personas

When working on backend tasks, AI agents assume one of two specialized personas:

### 🏛️ Agent `Modulith-Architect`
- **Responsibilities**:
  - Enforces module encapsulation and verifies package dependency graphs via `ApplicationModules.of(DossiaApplication.class).verify()`.
  - Designs inter-module asynchronous workflows via Spring `ApplicationEventPublisher` and `@ApplicationModuleListener`.
  - Manages database schemas exclusively through Flyway versioned migrations (`V{version}__{description}.sql`).
  - Guards transactional integrity (`@Transactional` boundaries with required isolation) for clinical appointments and financial ledgers.

### 🛡️ Agent `API-Security`
- **Responsibilities**:
  - Manages Spring Security configurations using stateless JWT authentication.
  - Enforces strict role-based access control (`ROLE_SECRETARY` for front-desk operations, `ROLE_DOCTOR` for clinical consultation notes and prescriptions).
  - Enforces Moroccan **CNDP Law 09-08** compliance: audit trails (`created_by`, `updated_by`, timestamps) and soft-deletion (`deleted_at`) for medical record retention.
  - Implements RFC 7807 `ProblemDetail` standardized JSON error responses with clear French human-readable messages.

---

## 3. Zero-Tolerance Anti-Patterns (Critical Defects)

Any PR, commit, or code modification that introduces the following patterns is rejected immediately:

1. ❌ **Cross-Module Direct Repository or Entity Imports**:
   - **Banned**: The `agenda` module importing `com.dossia.backend.patient.internal.PatientRepository` or `Patient` entity directly.
   - **Enforced**: Call the module's exported service API (`PatientService`) or consume a Spring `ApplicationEvent` (e.g., `PatientRegisteredEvent`).

2. ❌ **Automatic Schema Generation (`ddl-auto=update`)**:
   - **Banned**: Using `spring.jpa.hibernate.ddl-auto=update` or `create-drop` in production or staging profiles.
   - **Enforced**: 100% of schema evolution must be authored as explicit Flyway migrations under `src/main/resources/db/migration/V{timestamp|seq}__{desc}.sql`.

3. ❌ **Exposing JPA Entities in Controller Responses**:
   - **Banned**: Returning JPA entities (e.g., `@Entity class Patient`) directly from `@RestController` methods.
   - **Enforced**: Always map domain models to immutable Java 21 `record` DTOs (e.g., `PatientResponseRecord`) to prevent accidental N+1 queries, lazy-loading exceptions, and internal schema leaks.

4. ❌ **Floating-Point Currency Types**:
   - **Banned**: Using `double` or `float` for pricing, payments, or reimbursement amounts.
   - **Enforced**: Always use `BigDecimal` with exact scale (2 decimal places) and `RoundingMode.HALF_UP`.

---

## 4. Mandatory Verification Gate

Before completing any backend task, the agent must run:
```bash
./mvnw test
```
The test suite includes `ModularityTests.java`, which validates that the Spring Modulith module graph is acyclic and strictly obeys all encapsulation boundaries.
