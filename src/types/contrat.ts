export type TypeContrat = 'CDI' | 'CDD' | 'VACATAIRE';

export type TypeConge = 'ANNUEL' | 'MALADIE' | 'MATERNITE' | 'EXCEPTIONNEL' | 'SANS_SOLDE';

export type StatutConge = 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE';

export type StatutContrat = 'ACTIF' | 'TERMINE' | 'SUSPENDU';

export interface ContratEnseignant {
  id: number;
  enseignantId: number;
  enseignantNom?: string;
  typeContrat: TypeContrat;
  dateDebut: string;
  dateFin?: string;
  salaire: number;
  statut?: StatutContrat;
  observations?: string;
}

export interface Conge {
  id: number;
  enseignantId: number;
  enseignantNom?: string;
  typeConge: TypeConge;
  dateDebut: string;
  dateFin: string;
  motif?: string;
  statut: StatutConge;
}
