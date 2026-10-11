# Skill: Moroccan Healthcare Domain & Regulatory Standards

> **Scope**: Universal business logic and compliance standards across `frontend/`, `backend/`, and `ai/`.  
> **Domain**: Moroccan Private Medical Cabinets (*Cabinets Médicaux*) and Polyclinics.

---

## 1. Currency & Financial Accounting (MAD)

All financial transactions, invoices, and accounting records must strictly follow Moroccan monetary regulations:

1. **Currency Designation**:
   - Currency is exclusively **MAD** (*Dirham Marocain*).
   - Display format: Always suffix with `MAD` (e.g., `350.00 MAD`), never `$`, `€`, or untyped numbers.
   - Decimals: Formatted to 2 decimal places with comma or point separator.
   - Precision Rule: Financial arithmetic must **NEVER** use standard floating-point operations. Calculations must be performed in whole centimes (integers) or using high-precision decimal libraries to eliminate rounding artifacts.

2. **Accepted Cabinet Payment Methods**:
   | Method | Code | Operational Handling |
   | :--- | :--- | :--- |
   | **Espèces** | `CASH` | Cash collected at reception. Immediate receipt generation. |
   | **Chèque** | `CHEQUE` | Bank check. Mandatory record of Bank Name (*Banque Émettrice*) and Check Number. |
   | **TPE** | `TPE` | Electronic Payment Terminal (Card). Record transaction auth/receipt reference. |
   | **Virement** | `TRANSFER` | Bank wire (common for institutional or corporate accounts). |

---

## 2. Institutional & Practitioner Identifiers

Moroccan healthcare and tax authorities mandate strict structural identifiers on all medical documents, prescriptions, and invoices:

1. **INPE (*Identifiant National du Praticien Établi*)**:
   - **Structure**: 9-digit numeric string (e.g., `123456789`).
   - **Authority**: Assigned by ANAM (*Agence Nationale de l'Assurance Maladie*).
   - **Requirement**: Mandatory on all prescriptions (*Ordonnances*), medical certificates, and *Feuilles de Soins*. Documents missing an INPE are systematically rejected by insurance funds.

2. **ICE (*Identifiant Commun de l'Entreprise*)**:
   - **Structure**: 15-digit numeric string (e.g., `001234567000089`).
   - **Requirement**: Mandatory corporate tax identifier on all commercial invoices, patient billing summaries, and tax filings under Moroccan commercial law.

3. **Tax Identifiers (IF & Patente)**:
   - **IF (*Identifiant Fiscal*)**: 8-digit tax identifier of the medical practice.
   - **Patente / TP (*Taxe Professionnelle*)**: Local municipal business tax number.

---

## 3. Social Security & Health Insurance Framework

Morocco operates a unified compulsory health coverage ecosystem governed by ANAM:

1. **Coverage Entities**:
   - **CNSS (*Caisse Nationale de Sécurité Sociale*)**: Manages AMO for private-sector employees, liberal professions, self-employed workers, and AMO TADAMON beneficiaries.
   - **CNOPS (*Caisse Nationale des Organismes de Prévoyance Sociale*)**: Manages coverage for public-sector employees and civil servants.
   - **Assurances Privées / Mutuelles**: Complementary private insurance (e.g., Saham, RMA, Wafa Assurance, AtlantaSanad).

2. **Patient Identifiers**:
   - **Immatriculation CNSS**: 9-digit alphanumeric identifier.
   - **CIN (*Carte d'Identité Nationale*)**: Moroccan national ID (e.g., `JA123456`), required for patient verification.

3. **La Feuille de Soins (Reimbursement Form)**:
   - The standardized physical and digital claim form submitted by patients for reimbursement.
   - Must capture:
     - Practicing Doctor's Full Name, Specialty, and INPE.
     - Cabinet Address and ICE.
     - Patient CIN, Name, and CNSS/CNOPS registration number.
     - Date of consultation, medical act coding (NGAP - *Nomenclature Générale des Actes Professionnels*), and exact fee charged in MAD.
     - Doctor's official stamp and signature placeholder.

---

## 4. Communication & Localization Standards

1. **Phone Number Formatting**:
   - Standard: International E.164 Moroccan standard.
   - Format: `+212 [567]XX-XXXXXX` (e.g., `+212 661-234567` for mobile, `+212 528-123456` for fixed Agadir line).
   - Validation Rule: Must start with `+212` followed by 9 digits (mobile starting with 6 or 7; landlines starting with 5).

2. **Language Duality**:
   - **Administrative UI**: Exclusively in Professional French (*Français Administratif Médical*).
   - **Patient Data Inputs**: Must natively support Arabic and Darija script without database encoding issues (UTF-8 required across all schemas). Patient names, addresses, and voice-transcribed medical notes frequently alternate between French, Modern Standard Arabic, and Moroccan Darija.

3. **Data Protection & Compliance (CNDP Law 09-08)**:
   - Personal health data (*Données à caractère personnel relatives à la santé*) is legally classified as sensitive data under Moroccan law.
   - Patient records must be encrypted at rest and in transit.
   - Access to clinical records must be restricted strictly to authorized medical staff with comprehensive audit logging.
