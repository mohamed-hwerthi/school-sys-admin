export interface Facture {
  id: number;
  numero: string;
  eleveId: number;
  eleveNom?: string;
  dateEmission: string;
  dateEcheance?: string;
  montantTotal: number;
  montantRemise: number;
  montantNet: number;
  statut: 'NON_PAYEE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'ANNULEE';
}

export interface Echeancier {
  id: number;
  eleveId: number;
  typeFraisId?: number;
  montantTotal: number;
  nbMensualites: number;
  dateDebut: string;
  echeances: Echeance[];
}

export interface Echeance {
  id: number;
  numero: number;
  montant: number;
  dateEcheance: string;
  statut: 'EN_ATTENTE' | 'PAYEE' | 'EN_RETARD';
  paiementId?: number;
}
