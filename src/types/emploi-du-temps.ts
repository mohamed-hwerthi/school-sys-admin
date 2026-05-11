export interface Creneau {
  id: number;
  label: string;
  heureDebut: string;
  heureFin: string;
  type: 'COURS' | 'PAUSE' | 'RECREATION';
}

export interface EmploiDuTempsEntry {
  id?: number;
  classeId: number;
  creneauId: number;
  jourSemaine: number;
  moduleId?: number;
  moduleName?: string;
  enseignantId?: number;
  enseignantNom?: string;
  salle?: string;
}

export interface Conflit {
  typeConflit?: string;
  message: string;
  jourSemaine: number;
  creneauId: number;
  enseignantId?: number;
  salle?: string;
}

export interface RemplacementRequest {
  emploiDuTempsId: number;
  enseignantRemplacantId: number;
  dateDebut: string;
  dateFin: string;
  motif?: string;
}

export interface Remplacement {
  id: number;
  emploiDuTempsId: number;
  enseignantRemplacantId: number;
  dateDebut: string;
  dateFin: string;
  motif?: string;
  createdAt?: string;
}

// --- Auto-generation types ---

export interface TeachingAssignment {
  classeId: number;
  moduleId: number;
  enseignantId: number;
  nbHeures: number;
}

export interface TimetableGenerateRequest {
  // Legacy mode — caller provides assignments/rooms explicitly
  assignments?: TeachingAssignment[];
  rooms?: string[];
  // Auto mode — service loads from DB
  niveauId?: number;
  anneeScolaireId?: number;
  solverTimeoutSeconds?: number;
}

export interface TimetableGenerateResponse {
  status: 'SOLVED' | 'INFEASIBLE';
  score: string;
  entries: EmploiDuTempsEntry[];
  unresolvedConflicts: string[];
}

export interface TimetablePreviewCheck {
  anneeScolaireId: number | null;
  anneeScolaireLabel: string | null;
  niveauId: number | null;
  niveauName: string | null;
  totalModules: number;
  modulesWithVolume: number;
  volumesWithoutTeacher: number;
  totalLessonsToSchedule: number;
  totalTeachersInvolved: number;
  teachersWithoutDispos: number;
  teachersWithoutDisposList: { id: number; name: string }[];
  totalAvailableRooms: number;
  roomsByType: Record<string, number>;
  missingRoomTypes: string[];
  courseSlotsPerWeek: number;
  totalSlotCapacity: number;
  canGenerate: boolean;
  blockers: string[];
  warnings: string[];
}
