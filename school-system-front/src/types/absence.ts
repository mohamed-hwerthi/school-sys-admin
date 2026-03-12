export type AbsenceType = 'ABSENCE' | 'RETARD';

export interface Absence {
  id: number;
  eleveId: number;
  eleveNom?: string;
  elevePrenom?: string;
  date: string;
  type: AbsenceType;
  seance: string;
  heureArrivee?: string;
  justifie: boolean;
  motif?: string;
  enseignantId?: number;
  createdAt: string;
}

export interface AbsenceBatchItem {
  eleveId: number;
  type: AbsenceType;
  seance: string;
  heureArrivee?: string;
}

export interface AbsenceBatchRequest {
  date: string;
  classeId: number;
  enseignantId?: number;
  absences: AbsenceBatchItem[];
}

export interface AbsenceStats {
  totalAbsences: number;
  totalRetards: number;
  tauxPresence: number;
  parEleve: Array<{
    eleveId: number;
    nom: string;
    prenom: string;
    absences: number;
    retards: number;
  }>;
}
