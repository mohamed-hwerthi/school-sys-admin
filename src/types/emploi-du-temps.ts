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
  message: string;
  jourSemaine: number;
  creneauId: number;
}
