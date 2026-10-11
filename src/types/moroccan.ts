/**
 * Moroccan Medical SaaS — Strict TypeScript Types
 * Dossia — Le cœur digital de votre cabinet médical
 */

// ─────────────────────────────────────────────────
// Primitive branded types
// ─────────────────────────────────────────────────

/** Moroccan phone number — must start with +212 */
export type MarocPhoneNumber = `+212${string}`;

/** CNSS identifier — numeric string (8-10 digits) */
export type CNSSNumber = string & { readonly __brand: 'CNSSNumber' };

/** AMO identifier */
export type AMONumber = string & { readonly __brand: 'AMONumber' };

/** Identifiant National du Praticien Établi */
export type INPECode = string & { readonly __brand: 'INPECode' };

/** Identifiant Commun de l'Entreprise */
export type ICECode = string & { readonly __brand: 'ICECode' };

/** Currency — always Moroccan Dirham (MAD) */
export type MAD = number;

/** Accepted payment methods in Moroccan cabinets */
export type PaymentMethod = 'Espèces' | 'Chèque' | 'TPE';

/** Appointment status */
export type AppointmentStatus = 'Confirmé' | 'En attente' | 'En consultation' | 'Terminé' | 'Annulé';

/** Insurance type */
export type InsuranceType = 'CNSS' | 'AMO' | 'RAMED' | 'Privé' | 'Aucun';

// ─────────────────────────────────────────────────
// Domain entities
// ─────────────────────────────────────────────────

export interface Patient {
  id: string;
  /** Full name — supports Arabic/Darija input */
  nomComplet: string;
  telephone: MarocPhoneNumber;
  dateNaissance: string; // ISO 8601
  adresse: string; // e.g. "12 Rue Ibn Batouta, Agadir 80000"
  ville: string;
  assurance: InsuranceType;
  cnss?: CNSSNumber;
  amo?: AMONumber;
  createdAt: string;
}

export interface Doctor {
  id: string;
  nomComplet: string;
  specialite: string;
  inpe: INPECode;
  telephone: MarocPhoneNumber;
  cabinet: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO 8601
  heureDebut: string; // HH:mm
  heureFin: string;   // HH:mm
  motif: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  honoraire: MAD;
  paiement: PaymentMethod;
  cnssRef?: CNSSNumber;
  amoRef?: AMONumber;
  diagnostic?: string;
  ordonnance?: string[];
}

export interface Payment {
  id: string;
  consultationId: string;
  montant: MAD;
  methode: PaymentMethod;
  date: string;
  reference?: string; // Chèque number or TPE transaction ID
}

// ─────────────────────────────────────────────────
// Mock data helpers
// ─────────────────────────────────────────────────

export const MOCK_DOCTOR: Doctor = {
  id: 'doc-001',
  nomComplet: 'Dr. Rachid Amrani',
  specialite: 'Médecine Générale',
  inpe: 'MA-2021-0042' as INPECode,
  telephone: '+212661234567' as MarocPhoneNumber,
  cabinet: 'Cabinet Médical Al Amal, Agadir',
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    nomComplet: 'Fatima Zahra Benali',
    telephone: '+212661987654' as MarocPhoneNumber,
    dateNaissance: '1985-03-14',
    adresse: '45 Rue du Prince Héritier, Agadir 80000',
    ville: 'Agadir',
    assurance: 'CNSS',
    cnss: '23456789' as CNSSNumber,
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'pat-002',
    nomComplet: 'محمد أيت باها',
    telephone: '+212670112233' as MarocPhoneNumber,
    dateNaissance: '1972-07-22',
    adresse: '12 Bd Hassan II, Inezgane 80350',
    ville: 'Inezgane',
    assurance: 'AMO',
    amo: '5512345678' as AMONumber,
    createdAt: '2024-02-05T09:30:00Z',
  },
  {
    id: 'pat-003',
    nomComplet: 'Karima Oufkir',
    telephone: '+212628445566' as MarocPhoneNumber,
    dateNaissance: '1990-11-05',
    adresse: '7 Résidence Tildi, Ait Melloul',
    ville: 'Ait Melloul',
    assurance: 'RAMED',
    createdAt: '2024-03-18T10:00:00Z',
  },
  {
    id: 'pat-004',
    nomComplet: 'Youssef Elhachimi',
    telephone: '+212644778899' as MarocPhoneNumber,
    dateNaissance: '1965-01-30',
    adresse: '3 Rue de la Palmeraie, Agadir 80000',
    ville: 'Agadir',
    assurance: 'Privé',
    createdAt: '2024-04-01T11:15:00Z',
  },
  {
    id: 'pat-005',
    nomComplet: 'Nadia Cherkaoui',
    telephone: '+212655321098' as MarocPhoneNumber,
    dateNaissance: '2001-09-17',
    adresse: '22 Lotissement Dakhla, Agadir',
    ville: 'Agadir',
    assurance: 'CNSS',
    cnss: '34567890' as CNSSNumber,
    createdAt: '2024-05-20T14:00:00Z',
  },
];
