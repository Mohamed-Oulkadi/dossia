-- ============================================================================
-- Flyway Migration V12: Seed Urticaria / Allergy Drugs and Prescription Template
-- CNDP Loi 09-08 Compliant
-- ============================================================================

-- 1. Insert Primalan (Méquitazine) into Moroccan Medications Catalog
INSERT INTO medications_catalog (id, brand_name, dci, dosage, form, default_posology, ppv_mad) VALUES
    ('68111111-2222-3333-4444-555555555501', 'Primalan 10mg', 'Méquitazine', '10mg', 'Comprimé', '1 comprimé le soir au coucher', 48.00),
    ('68111111-2222-3333-4444-555555555502', 'Primalan 0.05% Sirop', 'Méquitazine', '0.05%', 'Sirop', '1 cuillère-mesure le soir en cas de prurit', 32.50)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Urticaire Aiguë & Allergie Adulte Template into Prescription Templates (1-Click)
INSERT INTO prescription_templates (id, clinic_id, title, category, items_json, created_by) VALUES
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        NULL,
        'Urticaire Aiguë Adulte',
        'Dermatologie / Allergologie',
        '[
            {"medicationName": "Aerius 5mg", "dosage": "1 comprimé par jour", "duration": "10 jours", "instructions": "Le soir au coucher"},
            {"medicationName": "Primalan 10mg", "dosage": "1 comprimé le soir", "duration": "5 jours", "instructions": "À prendre en cas de prurit intense"},
            {"medicationName": "Célestène 2mg", "dosage": "1 comprimé le matin", "duration": "3 jours", "instructions": "Au cours du petit-déjeuner si œdème facial associé"}
        ]'::jsonb,
        'SYSTEM'
    )
ON CONFLICT (id) DO NOTHING;
