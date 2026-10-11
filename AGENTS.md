# Dossia — Agent Governance & Operational Framework

> **Scope**: Monorepo Root Orchestration (`frontend/`, `backend/`, `ai/`)  
> **Mission**: The digital operating system for Moroccan private medical cabinets and clinics.

---

## 1. Core Mission & Philosophy

Dossia modernizes and streamlines private healthcare practices across Morocco. It handles patient records, appointments, billing in MAD, social security claims (CNSS/AMO), and clinical documentation with zero friction.

### The "Secretary-First" (*L'Assistante Médicale*) Philosophy
The primary day-to-day operator of Dossia is the **medical secretary**, not the physician.
- **Operating Reality**: The secretary manages 30 to 60 patients daily, answering continuous phone calls while checking in walk-ins and processing payments under high waiting-room pressure.
- **The 3-Second SLA**: Any recurring action—booking an appointment, checking in a patient, recording a payment, or generating a *Feuille de Soins*—must be executable in **under 3 seconds**.
- **Ergonomic Mandates**:
  - **Zero Layout Shifts**: No content jumping during loading or theme toggling.
  - **High Information Density**: Dense, compact data tables without excessive whitespace or infinite scrolling.
  - **Keyboard-First Navigation**: Global command palette (`Ctrl+K`) and keyboard shortcuts for all frequent actions.

---

## 2. Monorepo Architecture & Directory Boundaries

The repository is organized into three distinct operational domains:

```
d:/My Projects/Dossia/
├── frontend/               # Single Page Application (Secretary Dashboard & Public Portal)
├── backend/                # Java 21+, Spring Boot, Spring Modulith Modular Monolith
├── ai/                     # Clinical Transcription, Darija/French NLP, and Assistant Agents
├── AGENTS.md               # Master Monorepo Governance (This File)
└── skills/                 # Universal Cross-Cutting Knowledge Base
    ├── 01-premium-ui-craft.md          # UI/UX design tokens & anti-pattern rules (Frontend)
    ├── 02-moroccan-domain.md           # Moroccan healthcare business logic & regulations (All)
    ├── 03-testing-standards.md         # Testing standards & QA mandates (All)
    ├── 04-spring-modulith-craft.md     # Spring Modulith modular architecture & Java 21 idioms (Backend)
    └── 05-backend-moroccan-domain.md   # Moroccan backend schemas, BigDecimal MAD, INPE, CNDP (Backend)
```

### Boundary & Ownership Matrix

| Service | Technology Foundation | Primary Responsibilities | Mandatory Governance |
| :--- | :--- | :--- | :--- |
| **`frontend/`** | React 18, TypeScript, Tailwind CSS v4, Zustand, Radix UI, Three.js | Dashboard layout, Smart Agenda, Command Palette, Modals, dual-theme rendering | [`skills/01-premium-ui-craft.md`](file:///d:/My%20Projects/Dossia/skills/01-premium-ui-craft.md) |
| **`backend/`** | Java 21+, Spring Boot, Spring Modulith, PostgreSQL, Flyway | Bounded domain modules (patient, agenda, billing, cnss), JWT security, CNDP audit | [`backend/AGENTS.md`](file:///d:/My%20Projects/Dossia/backend/AGENTS.md), [`skills/04-spring-modulith-craft.md`](file:///d:/My%20Projects/Dossia/skills/04-spring-modulith-craft.md), [`skills/05-backend-moroccan-domain.md`](file:///d:/My%20Projects/Dossia/skills/05-backend-moroccan-domain.md) |
| **`ai/`** | Python, Whisper, LLM inference pipelines, LangChain | Voice-to-text clinical notes, Darija-to-French medical transcription, extraction | [`skills/02-moroccan-domain.md`](file:///d:/My%20Projects/Dossia/skills/02-moroccan-domain.md) |

---

## 3. Mandatory Agent Directives

Before proposing plans, creating files, or modifying code in any folder, every AI agent or subagent **MUST** observe the following rules:

1. **Mandatory Skill Loading**:
   - Every agent **MUST** read all skills located in [`skills/`](file:///d:/My%20Projects/Dossia/skills/) before authoring or modifying code.
   - Any architectural decision or code change that contradicts rules in [`skills/`](file:///d:/My%20Projects/Dossia/skills/) is considered a critical defect.

2. **Cross-Service Separation of Concerns**:
   - Agents working in `frontend/` must never invent domain schemas that conflict with the centralized business definitions in [`skills/02-moroccan-domain.md`](file:///d:/My%20Projects/Dossia/skills/02-moroccan-domain.md).
   - Agents working in `backend/` must provide typed contracts (OpenAPI / tRPC schemas) matching the exact frontend expectations.
   - Agents working in `ai/` must ensure complete patient data confidentiality in accordance with Morocco's **CNDP Law 09-08**.

3. **Code Hygiene & Verification**:
   - Zero tolerance for placeholder logic, unhandled promises, or mock data that fails Moroccan domain validation rules.
   - All monetary amounts must be stored and computed using strict non-floating arithmetic in `MAD`.
   - Every code modification must satisfy the testing standards defined in [`skills/03-testing-standards.md`](file:///d:/My%20Projects/Dossia/skills/03-testing-standards.md).
