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
