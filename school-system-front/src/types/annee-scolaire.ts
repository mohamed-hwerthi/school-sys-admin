export interface AnneeScolaire {
  id: number;
  label: string;
  dateDebut: string;
  dateFin: string;
  active: boolean;
  cloturee: boolean;
}

export interface Trimestre {
  id: number;
  anneeScolaireId: number;
  numero: number;
  label: string;
  dateDebut: string;
  dateFin: string;
  saisieNotesOuverte: boolean;
}

export interface Vacance {
  id: number;
  anneeScolaireId: number;
  label: string;
  dateDebut: string;
  dateFin: string;
}

export interface JourFerie {
  id: number;
  anneeScolaireId: number;
  label: string;
  date: string;
}
