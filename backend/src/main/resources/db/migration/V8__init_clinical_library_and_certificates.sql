-- ============================================================================
-- Flyway Migration V8: Clinical Library, Diagnostic Requests & Medical Certificates
-- CNDP Loi 09-08 Audit & Traceability Compliant
-- Multi-Tenancy Scoped & Moroccan Global Drug Catalog
-- ============================================================================

-- 1. Moroccan Medications Catalog Table (Global Read-Only Reference)
CREATE TABLE IF NOT EXISTS medications_catalog (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name        VARCHAR(150) NOT NULL,
    dci               VARCHAR(150) NOT NULL,
    dosage            VARCHAR(100) NOT NULL,
    form              VARCHAR(50)  NOT NULL,
    default_posology  VARCHAR(255),
    ppv_mad           NUMERIC(10, 2)
);

CREATE INDEX IF NOT EXISTS idx_medications_brand_name ON medications_catalog (brand_name);
CREATE INDEX IF NOT EXISTS idx_medications_dci ON medications_catalog (dci);

-- 2. Prescription Templates (Ordonnances Types) Table
-- Multi-Tenant: clinic_id IS NULL defines global/system default templates
CREATE TABLE IF NOT EXISTS prescription_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id   UUID REFERENCES clinics(id) ON DELETE CASCADE,
    title       VARCHAR(150) NOT NULL,
    category    VARCHAR(100),
    items_json  JSONB NOT NULL,

    -- CNDP (Loi 09-08) Audit Columns
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by  VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_prescription_templates_clinic_id ON prescription_templates (clinic_id);
CREATE INDEX IF NOT EXISTS idx_prescription_templates_deleted_at ON prescription_templates (deleted_at);

-- 3. Diagnostic Requests (Demandes de Bilans Biologie & Radiologie) Table
CREATE TABLE IF NOT EXISTS diagnostic_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    consultation_id     UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    request_type        VARCHAR(50) NOT NULL CHECK (request_type IN ('BIOLOGIE', 'RADIOLOGIE')),
    items               JSONB NOT NULL,
    clinical_indication TEXT,

    -- CNDP (Loi 09-08) Audit Columns
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_requests_clinic_id ON diagnostic_requests (clinic_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_requests_consultation_id ON diagnostic_requests (consultation_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_requests_patient_id ON diagnostic_requests (patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_requests_deleted_at ON diagnostic_requests (deleted_at);

-- 4. Medical Certificates (Certificats Médicaux) Table
CREATE TABLE IF NOT EXISTS medical_certificates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    consultation_id     UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    certificate_type    VARCHAR(50) NOT NULL CHECK (certificate_type IN ('ARRET_TRAVAIL', 'APTITUDE', 'SCOLAIRE', 'SPORT')),
    rest_days           INTEGER,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    is_prolongation     BOOLEAN NOT NULL DEFAULT FALSE,
    custom_notes        TEXT,

    -- CNDP (Loi 09-08) Audit Columns
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_medical_certificates_clinic_id ON medical_certificates (clinic_id);
CREATE INDEX IF NOT EXISTS idx_medical_certificates_consultation_id ON medical_certificates (consultation_id);
CREATE INDEX IF NOT EXISTS idx_medical_certificates_patient_id ON medical_certificates (patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_certificates_deleted_at ON medical_certificates (deleted_at);

-- ============================================================================
-- Seed Data: Moroccan Medications Catalog (28 Common Practice Drugs)
-- ============================================================================
INSERT INTO medications_catalog (brand_name, dci, dosage, form, default_posology, ppv_mad) VALUES
    ('Augmentin 1g/125mg', 'Amoxicilline / Acide clavulanique', '1g/125mg', 'Sachet', '1 sachet matin et soir au début des repas', 112.50),
    ('Doliprane 1000mg', 'Paracétamol', '1000mg', 'Comprimé', '1 cp toutes les 6h à 8h en cas de douleur ou fièvre (max 3g/j)', 15.60),
    ('Doliprane 500mg', 'Paracétamol', '500mg', 'Gélule', '1 à 2 gélules toutes les 6h en cas de besoin', 12.00),
    ('Spasfon 80mg', 'Phloroglucinol', '80mg', 'Comprimé', '2 comprimés en cas de crise douloureuse spastique', 28.50),
    ('Amoxil 1g', 'Amoxicilline', '1g', 'Comprimé', '1 comprimé matin et soir pendant 6 à 7 jours', 65.00),
    ('Clamoxyl 500mg', 'Amoxicilline', '500mg', 'Gélule', '1 gélule 3 fois par jour', 35.00),
    ('Voltarène 50mg', 'Diclofénac sodique', '50mg', 'Comprimé', '1 cp 2 à 3 fois par jour au cours des repas', 42.00),
    ('Tahor 20mg', 'Atorvastatine', '20mg', 'Comprimé', '1 cp par jour le soir au coucher', 145.00),
    ('Amlor 5mg', 'Amlodipine', '5mg', 'Gélule', '1 gélule le matin à heure fixe', 84.50),
    ('Glucophage 850mg', 'Metformine', '850mg', 'Comprimé', '1 cp 2 fois par jour au milieu des repas', 48.00),
    ('Inexium 40mg', 'Ésoméprazole', '40mg', 'Comprimé', '1 cp le matin à jeun 30 minutes avant le repas', 110.00),
    ('Inexium 20mg', 'Ésoméprazole', '20mg', 'Comprimé', '1 cp le matin à jeun', 78.00),
    ('Célestène 2mg', 'Bétaméthasone', '2mg', 'Comprimé', '1 cp le matin au petit-déjeuner pendant 3 à 5 jours', 32.50),
    ('Solupred 20mg', 'Prednisolone', '20mg', 'Comprimé', '1 à 2 comprimés le matin au petit-déjeuner', 45.00),
    ('Aerius 5mg', 'Desloratadine', '5mg', 'Comprimé', '1 cp le soir au coucher', 56.00),
    ('Aspegic 100mg', 'Acétylsalicylate de lysine', '100mg', 'Sachet', '1 sachet par jour au milieu du repas', 22.00),
    ('Kardegic 75mg', 'Acétylsalicylate de lysine', '75mg', 'Sachet', '1 sachet le midi au cours du repas', 26.00),
    ('Co-Aprovel 150mg/12.5mg', 'Irbésartan / Hydrochlorothiazide', '150mg/12.5mg', 'Comprimé', '1 cp le matin', 155.00),
    ('Flagyl 500mg', 'Métronidazole', '500mg', 'Comprimé', '1 cp 3 fois par jour au cours des repas', 36.00),
    ('Zithromax 250mg', 'Azithromycine', '250mg', 'Comprimé', '2 cp le 1er jour puis 1 cp/j pendant 4 jours', 79.00),
    ('Smecta 3g', 'Diosmectite', '3g', 'Sachet', '1 sachet 3 fois par jour dilué dans de l''eau', 33.50),
    ('Primperan 10mg', 'Métoclopramide', '10mg', 'Comprimé', '1 cp 15 à 30 min avant chaque repas', 18.00),
    ('Ventoline 100µg', 'Salbutamol', '100µg/dose', 'Solution', '1 à 2 bouffées inhalées en cas de crise d''asthme', 44.00),
    ('Fucidine 2%', 'Acide fusidique', '2%', 'Pommade', '1 application locale 2 à 3 fois par jour', 38.00),
    ('Maxidrol', 'Dexaméthasone / Néomycine', 'Collyre', 'Collyre', '1 goutte 3 à 4 fois par jour dans l''œil atteint', 31.00),
    ('Betadine 10%', 'Povidone iodée', '10%', 'Solution', 'Application locale pure ou diluée pour antisepsie', 25.00),
    ('Tobrex 0.3%', 'Tobramycine', '0.3%', 'Collyre', '1 goutte 4 fois par jour pendant 7 jours', 34.00),
    ('Gaviscon', 'Alginate de sodium / Bicarbonate', 'Sirop', 'Sirop', '1 sachet ou 2 cuillères à café après les 3 repas et au coucher', 39.00);

-- ============================================================================
-- Seed Data: System Default Prescription Templates (clinic_id IS NULL)
-- ============================================================================
INSERT INTO prescription_templates (id, clinic_id, title, category, items_json, created_by) VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        'Angine Bactérienne Adulte',
        'ORL / Infectiologie',
        '[
            {"medicationName": "Augmentin 1g/125mg", "dosage": "1 sachet 2 fois par jour", "duration": "7 jours", "instructions": "Au début des repas"},
            {"medicationName": "Doliprane 1000mg", "dosage": "1 comprimé 3 fois par jour", "duration": "5 jours", "instructions": "En cas de douleur ou fièvre, espacer de 6h"},
            {"medicationName": "Maxilase Sirop", "dosage": "1 cuillère à soupe 3 fois par jour", "duration": "5 jours", "instructions": "En dehors des repas"}
        ]'::jsonb,
        'SYSTEM'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        NULL,
        'Gastro-entérite Aiguë',
        'Gastro-entérologie',
        '[
            {"medicationName": "Spasfon 80mg", "dosage": "2 comprimés 3 fois par jour", "duration": "3 jours", "instructions": "En cas de douleurs spasmodiques"},
            {"medicationName": "Smecta 3g", "dosage": "1 sachet 3 fois par jour", "duration": "3 jours", "instructions": "À distance des repas et des autres médicaments"},
            {"medicationName": "Doliprane 1000mg", "dosage": "1 comprimé si fièvre", "duration": "3 jours", "instructions": "Espacer de 6h"}
        ]'::jsonb,
        'SYSTEM'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        NULL,
        'HTA Stade 1 (Initiation)',
        'Cardiologie',
        '[
            {"medicationName": "Amlor 5mg", "dosage": "1 gélule le matin", "duration": "30 jours", "instructions": "Prendre à heure fixe, surveillance tensionnelle hebdomadaire"},
            {"medicationName": "Kardegic 75mg", "dosage": "1 sachet par jour", "duration": "30 jours", "instructions": "Au cours du déjeuner"}
        ]'::jsonb,
        'SYSTEM'
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        NULL,
        'Rhinopharyngite Virale Adulte',
        'Médecine Générale',
        '[
            {"medicationName": "Doliprane 1000mg", "dosage": "1 comprimé 3 fois par jour", "duration": "5 jours", "instructions": "Si céphalées ou fébricule"},
            {"medicationName": "Sérum Physiologique 0.9%", "dosage": "3 lavages nasaux par jour", "duration": "7 jours", "instructions": "Bien moucher après chaque lavage"},
            {"medicationName": "Célestène 2mg", "dosage": "1 comprimé le matin", "duration": "3 jours", "instructions": "Au cours du petit-déjeuner"}
        ]'::jsonb,
        'SYSTEM'
    )
ON CONFLICT (id) DO NOTHING;
