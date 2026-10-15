-- ============================================================================
-- Flyway Migration V10: Authentic Moroccan Clinical Practice Seed Data
-- Practice: Clinique Ibn Sina Agadir (11111111-1111-1111-1111-111111111111)
-- Practitioner: Dr. Rachid Amrani (33333333-3333-3333-3333-333333333333)
-- Secretary: Amina Benali (44444444-4444-4444-4444-444444444444)
-- Compliant with CNDP Loi 09-08, ANAM INPE, ICE, and Moroccan MAD Accounting
-- ============================================================================

-- 1. Patients Seed (10 Diverse Moroccan Patients)
INSERT INTO patients (
    id, clinic_id, first_name, last_name, cin, phone_number, birth_date,
    cnss_number, mutuelle_type, created_at, created_by, updated_at, updated_by
) VALUES
    ('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'Mohamed', 'Mansouri', 'JC458921', '+212661234567', '1982-05-14',
     '192837465', 'CNSS', CURRENT_TIMESTAMP - interval '30 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),

    ('a1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'Fatima Zahra', 'El Idrissi', 'BE892341', '+212662987654', '1990-11-23',
     '284759302', 'CNOPS', CURRENT_TIMESTAMP - interval '25 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),

    ('a1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'Youssef', 'Berrada', 'BK304912', '+212663554433', '1975-03-30',
     '394857201', 'CNSS', CURRENT_TIMESTAMP - interval '20 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),

    ('a1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
     'Khadija', 'Benjelloun', 'A748291', '+212664778899', '1968-08-19',
     '485729103', 'AMO_TADAMON', CURRENT_TIMESTAMP - interval '18 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),

    ('a1000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
     'Mehdi', 'Chraibi', 'D928374', '+212665123987', '1995-12-05',
     '592847102', 'CNSS', CURRENT_TIMESTAMP - interval '15 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),

    ('a1000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
     'Aicha', 'Tazi', 'C394821', '+212666443322', '1988-02-17',
     '683920194', 'CNOPS', CURRENT_TIMESTAMP - interval '12 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),

    ('a1000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111',
     'Omar', 'Alaoui', 'G583920', '+212667889900', '1962-09-10',
     '719283049', 'CNSS', CURRENT_TIMESTAMP - interval '10 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),

    ('a1000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111',
     'Salma', 'Bennani', 'AA920394', '+212668112233', '2001-07-28',
     '829304918', 'AUCUNE', CURRENT_TIMESTAMP - interval '8 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),

    ('a1000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111',
     'Brahim', 'Ait Ahmed', 'JB492018', '+212669332211', '1985-04-12',
     '938475019', 'CNSS', CURRENT_TIMESTAMP - interval '5 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),

    ('a1000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111',
     'Zineb', 'Kabbaj', 'FA384920', '+212670556677', '1993-10-02',
     '102938475', 'FAR', CURRENT_TIMESTAMP - interval '2 days', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 2. Appointments Seed (Dynamic Relative to CURRENT_DATE)
-- Populates Today's Waiting Room, In-Consultation, Completed, and Scheduled Queues
INSERT INTO appointments (
    id, clinic_id, patient_id, doctor_name, start_time, end_time,
    status, type, notes, arrived_at, called_at, version, created_at, created_by
) VALUES
    -- Today: Completed Appointments (Matinée)
    ('b1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000001', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '8 hours 30 minutes')::timestamptz,
     (CURRENT_DATE + interval '9 hours 00 minutes')::timestamptz,
     'TERMINE', 'CONSULTATION', 'Contrôle trimestriel hypertension artérielle.',
     (CURRENT_DATE + interval '8 hours 15 minutes')::timestamptz,
     (CURRENT_DATE + interval '8 hours 32 minutes')::timestamptz,
     1, (CURRENT_DATE - interval '2 days')::timestamptz, 'SYSTEM'),

    ('b1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000002', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '9 hours 00 minutes')::timestamptz,
     (CURRENT_DATE + interval '9 hours 30 minutes')::timestamptz,
     'TERMINE', 'CONSULTATION', 'Angine aiguë fébrile et céphalées intenses.',
     (CURRENT_DATE + interval '8 hours 50 minutes')::timestamptz,
     (CURRENT_DATE + interval '9 hours 05 minutes')::timestamptz,
     1, (CURRENT_DATE - interval '1 day')::timestamptz, 'SYSTEM'),

    ('b1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000003', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '9 hours 30 minutes')::timestamptz,
     (CURRENT_DATE + interval '10 hours 00 minutes')::timestamptz,
     'TERMINE', 'CONTROLE', 'Suivi diabète type 2 et résultats bilan lipidique.',
     (CURRENT_DATE + interval '9 hours 20 minutes')::timestamptz,
     (CURRENT_DATE + interval '9 hours 35 minutes')::timestamptz,
     1, (CURRENT_DATE - interval '3 days')::timestamptz, 'SYSTEM'),

    ('b1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000004', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '10 hours 00 minutes')::timestamptz,
     (CURRENT_DATE + interval '10 hours 30 minutes')::timestamptz,
     'TERMINE', 'CONSULTATION', 'Douleurs épigastriques et pyrosis post-prandial.',
     (CURRENT_DATE + interval '9 hours 55 minutes')::timestamptz,
     (CURRENT_DATE + interval '10 hours 05 minutes')::timestamptz,
     1, (CURRENT_DATE - interval '2 days')::timestamptz, 'SYSTEM'),

    -- Today: Currently in Consultation with Doctor
    ('b1000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000005', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '10 hours 30 minutes')::timestamptz,
     (CURRENT_DATE + interval '11 hours 00 minutes')::timestamptz,
     'EN_CONSULTATION', 'URGENCE', 'Lumbago aigu après effort physique intense.',
     (CURRENT_DATE + interval '10 hours 15 minutes')::timestamptz,
     (CURRENT_DATE + interval '10 hours 32 minutes')::timestamptz,
     0, (CURRENT_DATE + interval '10 hours 15 minutes')::timestamptz, 'SYSTEM'),

    -- Today: Patients in Waiting Room (Salle d''attente FIFO Queue)
    ('b1000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000006', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '11 hours 00 minutes')::timestamptz,
     (CURRENT_DATE + interval '11 hours 30 minutes')::timestamptz,
     'EN_ATTENTE', 'CONSULTATION', 'Bilan thyroïdien et asthénie matinale.',
     (CURRENT_DATE + interval '10 hours 45 minutes')::timestamptz,
     NULL, 0, (CURRENT_DATE - interval '1 day')::timestamptz, 'SYSTEM'),

    ('b1000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000007', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '11 hours 30 minutes')::timestamptz,
     (CURRENT_DATE + interval '12 hours 00 minutes')::timestamptz,
     'EN_ATTENTE', 'CONTROLE', 'Contrôle post-traitement bronchite aiguë.',
     (CURRENT_DATE + interval '11 hours 05 minutes')::timestamptz,
     NULL, 0, (CURRENT_DATE - interval '4 days')::timestamptz, 'SYSTEM'),

    -- Today: Afternoon Scheduled Appointments
    ('b1000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000008', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '15 hours 00 minutes')::timestamptz,
     (CURRENT_DATE + interval '15 hours 30 minutes')::timestamptz,
     'EN_ATTENTE', 'CONSULTATION', 'Certificat médical d''aptitude sportive.',
     NULL, NULL, 0, (CURRENT_DATE - interval '2 days')::timestamptz, 'SYSTEM'),

    ('b1000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000009', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '15 hours 30 minutes')::timestamptz,
     (CURRENT_DATE + interval '16 hours 00 minutes')::timestamptz,
     'EN_ATTENTE', 'CONSULTATION', 'Asthme allergique et gêne respiratoire à l''effort.',
     NULL, NULL, 0, (CURRENT_DATE - interval '1 day')::timestamptz, 'SYSTEM'),

    ('b1000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000010', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '16 hours 00 minutes')::timestamptz,
     (CURRENT_DATE + interval '16 hours 30 minutes')::timestamptz,
     'EN_ATTENTE', 'CONSULTATION', 'Migraine ophtalmique récidivante.',
     NULL, NULL, 0, (CURRENT_DATE - interval '3 days')::timestamptz, 'SYSTEM'),

    -- Yesterday: Completed Historical Appointments
    ('b1000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000001', 'Dr. Rachid Amrani',
     (CURRENT_DATE - interval '1 day' + interval '9 hours 00 minutes')::timestamptz,
     (CURRENT_DATE - interval '1 day' + interval '9 hours 30 minutes')::timestamptz,
     'TERMINE', 'CONSULTATION', 'Bilan médical annuel préliminaire.',
     (CURRENT_DATE - interval '1 day' + interval '8 hours 50 minutes')::timestamptz,
     (CURRENT_DATE - interval '1 day' + interval '9 hours 02 minutes')::timestamptz,
     1, (CURRENT_DATE - interval '5 days')::timestamptz, 'SYSTEM'),

    -- Tomorrow & Next Week: Future Planned Appointments
    ('b1000000-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000002', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '1 day' + interval '10 hours 00 minutes')::timestamptz,
     (CURRENT_DATE + interval '1 day' + interval '10 hours 30 minutes')::timestamptz,
     'EN_ATTENTE', 'CONTROLE', 'Contrôle clinique post-antibiothérapie angine.',
     NULL, NULL, 0, CURRENT_TIMESTAMP, 'SYSTEM'),

    ('b1000000-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000004', 'Dr. Rachid Amrani',
     (CURRENT_DATE + interval '3 days' + interval '11 hours 00 minutes')::timestamptz,
     (CURRENT_DATE + interval '3 days' + interval '11 hours 30 minutes')::timestamptz,
     'EN_ATTENTE', 'CONTROLE', 'Lecture résultats fibroscopie gastro-duodénale.',
     NULL, NULL, 0, CURRENT_TIMESTAMP, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 3. Consultations Seed (Clinical Notes, Vitals, Diagnoses)
INSERT INTO consultations (
    id, clinic_id, patient_id, appointment_id, motif, clinical_notes,
    diagnosis, blood_pressure, weight_kg, heart_rate_bpm, version,
    created_at, created_by, updated_at, updated_by
) VALUES
    ('c1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
     'Renouvellement traitement HTA et céphalées matinales',
     'Patient de 44 ans hypertendu connu sous monothérapie. Pression artérielle mal équilibrée au réveil (150/95 mmHg). Pas de signes de souffrance viscérale. Auscultation cardio-pulmonaire normale. Bruits du cœur réguliers sans souffle. Adaptation posologique: bithérapie Amlor + Co-Aprovel.',
     'Hypertension artérielle essentielle stade 2 mal équilibrée',
     '150/95', 84.50, 76, 1,
     (CURRENT_DATE + interval '8 hours 45 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '8 hours 55 minutes')::timestamptz, 'SYSTEM'),

    ('c1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
     'Fièvre à 38.8°C, odynophagie intense et adénopathies cervicales',
     'Patiente de 36 ans sans antécédent médical particulier. Début brutal des symptômes il y a 48 heures. Examen oropharyngé: amygdales augmentées de volume, érythémato-pultacées avec exsudat blanchâtre non adhérent. Adénopathies sous-angulo-mandibulaires bilatérales sensibles. TDR Streptocoque A positif.',
     'Angine aiguë érythémato-pultacée bactérienne à Streptocoque A',
     '120/75', 62.00, 92, 1,
     (CURRENT_DATE + interval '9 hours 18 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 28 minutes')::timestamptz, 'SYSTEM'),

    ('c1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003',
     'Suivi du Diabète de type 2 et bilan annuel',
     'Patient de 51 ans suivi pour DT2 sous Metformine. HbA1c récente à 7.4%. Sensibilité vibratoire conservée aux membres inférieurs (test au monofilament normal). Pas de lésions trophiques des pieds. Pouls pédieux et tibiaux postérieurs bien perçus. Prescription bilan métabolique complet.',
     'Diabète type 2 modérément équilibré sans complication décelable',
     '130/80', 79.00, 72, 1,
     (CURRENT_DATE + interval '9 hours 45 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 55 minutes')::timestamptz, 'SYSTEM'),

    ('c1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004',
     'Brûlures épigastriques rétro-sternales post-prandiales',
     'Patiente de 58 ans se plaignant de pyrosis et régurgitations acides nocturnes chroniques récidivantes. Palpation abdominale: sensibilité épigastrique sans défense ni contracture. Prescription IPP Inexium 40mg et règles hygiéno-diététiques.',
     'Reflux gastro-œsophagien (RGO) avec suspicion d''œsophagite peptique',
     '135/85', 68.50, 68, 1,
     (CURRENT_DATE + interval '10 hours 18 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 26 minutes')::timestamptz, 'SYSTEM'),

    ('c1000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005',
     'Dorsolombalgie aiguë mécanique suite à effort de soulèvement',
     'Patient de 31 ans, survenue brutale d''une douleur lombo-sacrée suite à port de charge lourde. Contracture musculaire paravertébrale lombaire droite, Schober 10+1 cm. Lasègue négatif bilatéral. Absence de déficit moteur (marche sur talons et pointes possible). Cliché Rx demandé.',
     'Lumbago aigu mécanique invalidant sans radiculalgie',
     '125/80', 74.00, 80, 0,
     (CURRENT_DATE + interval '10 hours 38 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 45 minutes')::timestamptz, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 4. Prescriptions Seed (Ordonnances Médicales)
INSERT INTO prescriptions (
    id, consultation_id, notes, version, created_at, created_by, updated_at, updated_by
) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
     'Traitement antihypertenseur d''entretien pour 3 mois. Surveillance régulière de la PA à domicile.',
     1, (CURRENT_DATE + interval '8 hours 50 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '8 hours 52 minutes')::timestamptz, 'SYSTEM'),

    ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002',
     'Antibiothérapie curative et antalgiques antipyrétiques. Bien respecter la durée complète de 7 jours.',
     1, (CURRENT_DATE + interval '9 hours 22 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 24 minutes')::timestamptz, 'SYSTEM'),

    ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003',
     'Antidiabétique oral et hypolipémiant. Contrôle bilan biologique à jeun dans 3 mois.',
     1, (CURRENT_DATE + interval '9 hours 48 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 50 minutes')::timestamptz, 'SYSTEM'),

    ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004',
     'Traitement antisécrétoire gastrique IPP. Éviter aliments gras, café, tabac et repas tardifs.',
     1, (CURRENT_DATE + interval '10 hours 22 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 24 minutes')::timestamptz, 'SYSTEM'),

    ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005',
     'AINS et myorelaxant en cure courte. Repos au lit sur plan dur. Pas de port de charges.',
     0, (CURRENT_DATE + interval '10 hours 42 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 44 minutes')::timestamptz, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 5. Prescription Items Seed (Lignes de Médicaments du Catalogue Marocain)
INSERT INTO prescription_items (
    id, prescription_id, medication_name, dosage, duration, instructions
) VALUES
    -- Prescription 1 (Mohamed Mansouri - HTA)
    ('d1100000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001',
     'Amlor 5mg', '5mg', '3 mois', '1 gélule le matin au petit-déjeuner'),
    ('d1100000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001',
     'Co-Aprovel 150mg/12.5mg', '150mg/12.5mg', '3 mois', '1 comprimé le matin'),
    ('d1100000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001',
     'Kardegic 75mg', '75mg', '3 mois', '1 sachet le midi au cours du repas'),

    -- Prescription 2 (Fatima Zahra El Idrissi - Angine)
    ('d1100000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002',
     'Augmentin 1g/125mg', '1g/125mg', '7 jours', '1 sachet matin et soir au début des repas'),
    ('d1100000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000002',
     'Doliprane 1000mg', '1000mg', '5 jours', '1 cp toutes les 8h si fièvre ou douleur (max 3g/j)'),

    -- Prescription 3 (Youssef Berrada - Diabète)
    ('d1100000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000003',
     'Glucophage 850mg', '850mg', '3 mois', '1 comprimé matin et soir au milieu des repas'),
    ('d1100000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000003',
     'Tahor 20mg', '20mg', '3 mois', '1 comprimé le soir au coucher'),

    -- Prescription 4 (Khadija Benjelloun - RGO)
    ('d1100000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000004',
     'Inexium 40mg', '40mg', '4 semaines', '1 comprimé le matin à jeun 30 minutes avant le repas'),
    ('d1100000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000004',
     'Spasfon 80mg', '80mg', '10 jours', '2 comprimés en cas de douleur épigastrique spastique'),

    -- Prescription 5 (Mehdi Chraibi - Lumbago)
    ('d1100000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000005',
     'Voltarène 50mg', '50mg', '5 jours', '1 comprimé matin et soir au cours des repas'),
    ('d1100000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000005',
     'Doliprane 1000mg', '1000mg', '5 jours', '1 comprimé toutes les 8h si douleur')
ON CONFLICT (id) DO NOTHING;

-- 6. Invoices Seed (Factures Médicales en MAD)
INSERT INTO invoices (
    id, clinic_id, patient_id, consultation_id, total_amount, status, issue_date,
    version, created_at, created_by, updated_at, updated_by
) VALUES
    ('e1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
     300.00, 'PAYE', (CURRENT_DATE + interval '8 hours 55 minutes')::timestamptz,
     1, (CURRENT_DATE + interval '8 hours 55 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '8 hours 58 minutes')::timestamptz, 'SYSTEM'),

    ('e1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002',
     350.00, 'PAYE', (CURRENT_DATE + interval '9 hours 28 minutes')::timestamptz,
     1, (CURRENT_DATE + interval '9 hours 28 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 30 minutes')::timestamptz, 'SYSTEM'),

    ('e1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003',
     250.00, 'PAYE', (CURRENT_DATE + interval '9 hours 55 minutes')::timestamptz,
     1, (CURRENT_DATE + interval '9 hours 55 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 57 minutes')::timestamptz, 'SYSTEM'),

    ('e1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004',
     300.00, 'PAYE', (CURRENT_DATE + interval '10 hours 25 minutes')::timestamptz,
     1, (CURRENT_DATE + interval '10 hours 25 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 28 minutes')::timestamptz, 'SYSTEM'),

    -- Consultation en cours: Facture générée, en attente de règlement au départ
    ('e1000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005',
     300.00, 'NON_PAYE', (CURRENT_DATE + interval '10 hours 45 minutes')::timestamptz,
     0, (CURRENT_DATE + interval '10 hours 45 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 45 minutes')::timestamptz, 'SYSTEM'),

    -- Facture hier réglée
    ('e1000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000001', NULL,
     300.00, 'PAYE', (CURRENT_DATE - interval '1 day' + interval '9 hours 30 minutes')::timestamptz,
     1, (CURRENT_DATE - interval '1 day' + interval '9 hours 30 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE - interval '1 day' + interval '9 hours 32 minutes')::timestamptz, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 7. Payments Seed (Règlements Caisse Journalière en MAD)
-- Populates Active Cash Ledger: Espèces (550 MAD), TPE (350 MAD), Chèque (300 MAD)
INSERT INTO payments (
    id, invoice_id, amount, payment_method, reference_number,
    payment_date, created_at, created_by, updated_at, updated_by
) VALUES
    ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001',
     300.00, 'ESPECES', 'REC-2026-001',
     (CURRENT_DATE + interval '8 hours 58 minutes')::timestamptz,
     (CURRENT_DATE + interval '8 hours 58 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '8 hours 58 minutes')::timestamptz, 'SYSTEM'),

    ('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002',
     350.00, 'TPE', 'TPE-AGADIR-94821',
     (CURRENT_DATE + interval '9 hours 30 minutes')::timestamptz,
     (CURRENT_DATE + interval '9 hours 30 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 30 minutes')::timestamptz, 'SYSTEM'),

    ('f1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003',
     250.00, 'ESPECES', 'REC-2026-002',
     (CURRENT_DATE + interval '9 hours 57 minutes')::timestamptz,
     (CURRENT_DATE + interval '9 hours 57 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 57 minutes')::timestamptz, 'SYSTEM'),

    ('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000004',
     300.00, 'CHEQUE', 'CHQ-BP-8472910',
     (CURRENT_DATE + interval '10 hours 28 minutes')::timestamptz,
     (CURRENT_DATE + interval '10 hours 28 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 28 minutes')::timestamptz, 'SYSTEM'),

    ('f1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000006',
     300.00, 'ESPECES', 'REC-2026-000',
     (CURRENT_DATE - interval '1 day' + interval '9 hours 32 minutes')::timestamptz,
     (CURRENT_DATE - interval '1 day' + interval '9 hours 32 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE - interval '1 day' + interval '9 hours 32 minutes')::timestamptz, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 8. Feuilles de Soins Seed (CNSS / CNOPS Bordereaux d''Assurance)
INSERT INTO feuilles_de_soins (
    id, clinic_id, patient_id, consultation_id, invoice_id, form_type,
    generated_at, status, version, created_at, created_by, updated_at, updated_by
) VALUES
    ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
     'e1000000-0000-0000-0000-000000000001', 'CNSS',
     (CURRENT_DATE + interval '8 hours 56 minutes')::timestamptz, 'PRINTED', 1,
     (CURRENT_DATE + interval '8 hours 56 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '8 hours 56 minutes')::timestamptz, 'SYSTEM'),

    ('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002',
     'e1000000-0000-0000-0000-000000000002', 'CNOPS',
     (CURRENT_DATE + interval '9 hours 29 minutes')::timestamptz, 'PRINTED', 1,
     (CURRENT_DATE + interval '9 hours 29 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 29 minutes')::timestamptz, 'SYSTEM'),

    ('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003',
     'e1000000-0000-0000-0000-000000000003', 'CNSS',
     (CURRENT_DATE + interval '9 hours 56 minutes')::timestamptz, 'DRAFT', 0,
     (CURRENT_DATE + interval '9 hours 56 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 56 minutes')::timestamptz, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 9. Diagnostic Requests Seed (Demandes de Bilans Biologie & Radiologie)
INSERT INTO diagnostic_requests (
    id, clinic_id, consultation_id, patient_id, request_type, items, clinical_indication,
    created_at, created_by, updated_at, updated_by
) VALUES
    ('20000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003',
     'BIOLOGIE',
     '[
       {"name": "Hémoglobine glyquée (HbA1c)", "code": "HBA1C", "urgent": false},
       {"name": "Glycémie à jeun", "code": "GLYC_JEUN", "urgent": false},
       {"name": "Créatininémie + Clairance DFG (CKD-EPI)", "code": "CREAT_DFG", "urgent": false},
       {"name": "Bilan lipidique complet (CT, HDL, LDL, TG)", "code": "BILAN_LIPID", "urgent": false},
       {"name": "Microalbuminurie des 24h", "code": "MICROALB", "urgent": false}
     ]'::jsonb,
     'Bilan de surveillance métabolique annuel pour diabète type 2.',
     (CURRENT_DATE + interval '9 hours 52 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 52 minutes')::timestamptz, 'SYSTEM'),

    ('20000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005',
     'RADIOLOGIE',
     '[
       {"name": "Radiographie du rachis lombaire face et profil", "code": "RX_LOMBAIRE", "urgent": true},
       {"name": "Radiographie du bassin de face", "code": "RX_BASSIN", "urgent": false}
     ]'::jsonb,
     'Lumbago aigu hyperalgique après effort violent. Recherche de tassement vertébral ou anomalie transitionnelle lombo-sacrée.',
     (CURRENT_DATE + interval '10 hours 43 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 43 minutes')::timestamptz, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 10. Medical Certificates Seed (Certificats Médicaux)
INSERT INTO medical_certificates (
    id, clinic_id, consultation_id, patient_id, certificate_type,
    rest_days, start_date, end_date, is_prolongation, custom_notes,
    created_at, created_by, updated_at, updated_by
) VALUES
    ('30000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005',
     'ARRET_TRAVAIL', 5, CURRENT_DATE, CURRENT_DATE + 4, FALSE,
     'Arrêt de travail motivé par un lumbago aigu invalidant nécessitant un repos strict au lit.',
     (CURRENT_DATE + interval '10 hours 44 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 44 minutes')::timestamptz, 'SYSTEM'),

    ('30000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002',
     'ARRET_TRAVAIL', 3, CURRENT_DATE, CURRENT_DATE + 2, FALSE,
     'Épisode fébrile d''angine aiguë avec état général altéré. Éviction professionnelle de 3 jours.',
     (CURRENT_DATE + interval '9 hours 26 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 26 minutes')::timestamptz, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 11. Patient Documents Seed (Coffre-Fort & Imagerie Médicale MinIO Metadata)
INSERT INTO patient_documents (
    id, clinic_id, patient_id, consultation_id, original_filename,
    content_type, file_size_bytes, object_key, category, visibility_level,
    description, created_at, created_by, updated_at, updated_by
) VALUES
    ('40000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
     'Bilan_Biologique_Mansouri_2026.pdf', 'application/pdf', 5153,
     '11111111-1111-1111-1111-111111111111/a1000000-0000-0000-0000-000000000001/biologie/bilan_biologique_mansouri_2026.pdf',
     'BIOLOGIE', 'SHARED_SECRETARY',
     'Bilan biologique complet: Ionogramme sanguin, créatinine et bilan lipidique.',
     (CURRENT_DATE + interval '8 hours 40 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '8 hours 40 minutes')::timestamptz, 'SYSTEM'),

    ('40000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002',
     'Attestation_Adhesion_CNOPS.pdf', 'application/pdf', 5059,
     '11111111-1111-1111-1111-111111111111/a1000000-0000-0000-0000-000000000002/administratif/attestation_cnops.pdf',
     'ADMINISTRATIF_CNSS', 'SHARED_SECRETARY',
     'Attestation de déclaration et droits ouverts CNOPS pour prise en charge AMO.',
     (CURRENT_DATE + interval '9 hours 10 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 10 minutes')::timestamptz, 'SYSTEM'),

    ('40000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003',
     'Echo_Abdominale_Berrada_2025.png', 'image/png', 93179,
     '11111111-1111-1111-1111-111111111111/a1000000-0000-0000-0000-000000000003/radiologie/echo_abdominale_berrada.png',
     'RADIOLOGIE_IMAGERIE', 'DOCTOR_ONLY',
     'Échographie abdominale haute: foie stéatosique modéré sans lésion focale suspecte.',
     (CURRENT_DATE + interval '9 hours 40 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '9 hours 40 minutes')::timestamptz, 'SYSTEM'),

    ('40000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
     'a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005',
     'Radiographie_Rachis_Lombaire.jpeg', 'image/jpeg', 36342,
     '11111111-1111-1111-1111-111111111111/a1000000-0000-0000-0000-000000000005/radiologie/rx_lombaire_chraibi.jpeg',
     'RADIOLOGIE_IMAGERIE', 'DOCTOR_ONLY',
     'Cliché radiologique du rachis lombaire face/profil: absence de tassement corporéal visible.',
     (CURRENT_DATE + interval '10 hours 40 minutes')::timestamptz, 'SYSTEM',
     (CURRENT_DATE + interval '10 hours 40 minutes')::timestamptz, 'SYSTEM')
ON CONFLICT (id) DO NOTHING;
