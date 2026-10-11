# Skill: Testing Standards & Quality Assurance Mandates

> **Scope**: Testing architecture and verification protocols across `frontend/`, `backend/`, and `ai/`.  
> **Rule**: Every new feature, domain calculation, or workflow must include automated tests before merging.

---

## 1. Frontend Testing Mandates (`frontend/`)

The frontend application requires two distinct layers of automated verification: **Vitest** for unit and domain logic, and **Playwright** for high-velocity user workflows.

### A. Vitest (Unit & State Logic)
Vitest is dedicated to deterministic, fast-executing business logic tests without browser overhead:

1. **Zustand Store Transitions**:
   - Verify state modifications in `useAppStore` and `useAgendaStore`.
   - Test appointment scheduling, status transitions (`En attente` → `En consultation` → `Terminé`), and cancellation flows.
   - Test modal opening/closing and theme persistence across state cycles.

2. **Moroccan Domain Utilities & Schema Validation**:
   - Test phone number validation (`+212` prefix with 9 digits).
   - Test INPE (9-digit) and ICE (15-digit) structural validators.
   - Test MAD currency formatting and zero-loss centime calculations.
   - Test Zod form schemas for patient creation and appointment booking.

```ts
// Example: tests/unit/moroccan.test.ts
import { describe, it, expect } from 'vitest'
import { formatMAD, validateINPE } from '@/lib/moroccan-utils'

describe('Moroccan Domain Utilities', () => {
  it('formats currency correctly in MAD with tabular spacing', () => {
    expect(formatMAD(350)).toBe('350.00 MAD')
  })

  it('validates 9-digit INPE codes strictly', () => {
    expect(validateINPE('123456789')).toBe(true)
    expect(validateINPE('12345')).toBe(false)
  })
})
```

---

### B. Playwright (Secretary-First E2E Workflows)
Playwright validates critical end-to-end paths where UI speed and keyboard ergonomics are non-negotiable:

1. **Secretary Speed Workflows (< 3s SLA)**:
   - Rapid consultation creation via global shortcut (`Ctrl+K` → Select "Nouvelle Consultation" → Submit).
   - Instant patient check-in and status update via keyboard shortcuts.
   - Rapid payment recording in MAD (`Espèces` and `TPE`).

2. **Dual-Theme & Visual Stability**:
   - Verify seamless toggling between Light and Dark Mode via shortcut (`Alt+T`) and UI controls.
   - Assert zero layout shift (CLS < 0.05) during theme transitions.

3. **Accessibility & Keyboard Focus**:
   - Verify focus trapping in dialogs and modals (`DialogContent`).
   - Verify escape key handling and focus restoration after modal dismissal.

---

## 2. Backend Testing Mandates (`backend/`)

The backend layer protects clinical record integrity and financial reconciliation:

1. **API Contract & Route Tests**:
   - Schema validation for all incoming payloads matching frontend types.
   - Role-based authorization tests (Secretary vs Doctor access levels).

2. **Concurrency & Double-Booking Prevention**:
   - Integration tests simulating simultaneous appointment bookings for the same practitioner time slot.
   - Assert proper database lock acquisition and informative conflict resolution.

3. **Financial Ledger Integrity**:
   - Double-entry accounting consistency for all consultation payments.
   - Exact sum reconciliation in MAD with zero floating-point variance.

---

## 3. AI Service Testing Mandates (`ai/`)

The AI service handles medical voice transcription and unstructured clinical text extraction:

1. **Bilingual Clinical Transcription Benchmarks**:
   - Maintain a regression test suite of audio samples in mixed French and Moroccan Darija.
   - Assert Word Error Rate (WER) thresholds on clinical vocabulary (e.g., *tension artérielle*, *diabète*, *ordonnance*).

2. **Structured Medical Entity Extraction**:
   - Test LLM extraction prompts against gold-standard clinical notes.
   - Validate strict JSON schema conformance for extracted entities:
     - Symptoms (*Motifs*)
     - Diagnosis (*Diagnostic*)
     - Prescription list (*Médicament*, *Dosage*, *Fréquence*, *Durée*)
   - Zero hallucination validation: Assert that any unmentioned clinical entity is omitted rather than inferred.

3. **Latency & Fallback Guarantees**:
   - Assert transcription responses complete within defined latency budgets.
   - Test graceful offline/degraded fallbacks when AI inference endpoints are unreachable.

---

## 4. Quality Gate Checklist

Before submitting any code for review, ensure:
- [ ] `npm run lint` / Oxlint passes with **0 errors and 0 warnings**.
- [ ] `npm run build` succeeds cleanly with **0 TypeScript errors**.
- [ ] All Vitest unit tests pass.
- [ ] No hardcoded mock data that violates Moroccan formatting standards.
- [ ] No regression in keyboard accessibility or theme rendering.
