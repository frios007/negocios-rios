// ─── Patient Types ─────────────────────────────────────────
export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  color: string | null;
  dateOfBirth: string | null;
  isActive: boolean;
  clientId: string;
  client: { id: string; firstName: string; lastName: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface PatientDetail extends Patient {
  client: {
    id: string;
    firstName: string;
    lastName: string | null;
    phoneNumber: string | null;
  };
  clinicalRecords: ClinicalRecord[];
  hospitalizations: Hospitalization[];
}

export interface PatientOption {
  id: string;
  name: string;
  species: string;
  client: { firstName: string; lastName: string | null };
}

export interface CreatePatientPayload {
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  color?: string;
  dateOfBirth?: string;
  clientId: string;
}

export interface UpdatePatientPayload {
  name?: string;
  species?: string;
  breed?: string | null;
  sex?: string | null;
  color?: string | null;
  dateOfBirth?: string | null;
  clientId?: string;
  isActive?: boolean;
}

// ─── Clinical Record Types ──────────────────────────────────
export type RecordStatus =
  | "CONSULTATION"
  | "ADMITTED"
  | "DISCHARGED"
  | "CANCELLED";

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
  CONSULTATION: "Consulta",
  ADMITTED: "Ingresado",
  DISCHARGED: "Alta",
  CANCELLED: "Cancelado",
};

export const RECORD_STATUS_COLORS: Record<RecordStatus, string> = {
  CONSULTATION: "bg-blue-100 text-blue-800",
  ADMITTED: "bg-amber-100 text-amber-800",
  DISCHARGED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export interface ClinicalRecord {
  id: string;
  patientId: string;
  vetId: string;
  weight: string | null;
  temperature: string | null;
  reason: string;
  diagnosis: string | null;
  prescription: string | null;
  internalNotes: string | null;
  status: RecordStatus;
  hospitalizationId: string | null;
  saleId: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    name: string;
    species: string;
    client?: { firstName: string; lastName: string | null };
  };
  vet?: { firstName: string; lastName: string };
}

export interface CreateRecordPayload {
  patientId: string;
  weight?: string;
  temperature?: string;
  reason: string;
  diagnosis?: string;
  prescription?: string;
  internalNotes?: string;
}

export interface UpdateRecordPayload {
  weight?: string;
  temperature?: string;
  reason?: string;
  diagnosis?: string | null;
  prescription?: string | null;
  internalNotes?: string | null;
  status?: RecordStatus;
}

// ─── Hospitalization Types ──────────────────────────────────
export type HospitalizationStatus = "ACTIVE" | "DISCHARGED" | "DECEASED";

export const HOSP_STATUS_LABELS: Record<HospitalizationStatus, string> = {
  ACTIVE: "Internado",
  DISCHARGED: "Alta",
  DECEASED: "Fallecido",
};

export const HOSP_STATUS_COLORS: Record<HospitalizationStatus, string> = {
  ACTIVE: "bg-blue-100 text-blue-800",
  DISCHARGED: "bg-emerald-100 text-emerald-800",
  DECEASED: "bg-gray-100 text-gray-800",
};

export interface HospitalizationNote {
  id: string;
  weight: string | null;
  temperature: string | null;
  observations: string;
  treatment: string | null;
  createdAt: string;
  vet?: { firstName: string; lastName: string };
}

export interface HospitalizationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  createdAt: string;
}

export interface Hospitalization {
  id: string;
  patientId: string;
  vetId: string;
  reason: string;
  diagnosis: string | null;
  admittedAt: string;
  dischargedAt: string | null;
  estimatedDays: number | null;
  dailyRate: string | null;
  status: HospitalizationStatus;
  dischargeNotes: string | null;
  saleId: string | null;
  createdAt: string;
  patient?: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    clientId: string;
    client?: {
      id: string;
      firstName: string;
      lastName: string | null;
      phoneNumber?: string | null;
    };
  };
  vet?: { firstName: string; lastName: string };
  notes?: HospitalizationNote[];
  items?: HospitalizationItem[];
  sale?: any;
}

export interface CreateHospitalizationPayload {
  patientId: string;
  reason: string;
  diagnosis?: string;
  estimatedDays?: number;
  dailyRate?: string;
  weight?: string;
  temperature?: string;
}

export interface AddNotePayload {
  weight?: string;
  temperature?: string;
  observations: string;
  treatment?: string;
}

export interface AddItemPayload {
  description: string;
  quantity?: number;
  unitPrice: string;
}

// ─── Species Helpers ────────────────────────────────────────
export const COMMON_SPECIES = [
  "Perro",
  "Gato",
  "Ave",
  "Conejo",
  "Hamster",
  "Tortuga",
  "Loro",
  "Cabro",
  "Cerdo",
  "Oveja",
  "Vaca",
  "Caballo",
  "Otro",
];
