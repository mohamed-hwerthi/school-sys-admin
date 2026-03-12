export type TypeRegime = 'STANDARD' | 'VEGETARIEN' | 'SANS_GLUTEN' | 'HALAL';
export type TypeAbonnement = 'JOURNALIER' | 'HEBDOMADAIRE' | 'MENSUEL' | 'ANNUEL';
export type TypeRepas = 'PETIT_DEJEUNER' | 'DEJEUNER' | 'GOUTER';

export interface Menu {
  id: number;
  dateMenu: string;
  jourSemaine: string;
  entree?: string;
  platPrincipal: string;
  accompagnement?: string;
  dessert?: string;
  allergenes: string[];
  typeRegime: TypeRegime;
  semaine?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuRequest {
  dateMenu: string;
  jourSemaine: string;
  entree?: string;
  platPrincipal: string;
  accompagnement?: string;
  dessert?: string;
  allergenes?: string[];
  typeRegime?: TypeRegime;
  semaine?: number;
}

export interface AbonnementCantine {
  id: number;
  eleveId: number;
  typeAbonnement: TypeAbonnement;
  dateDebut: string;
  dateFin?: string;
  montant: number;
  actif: boolean;
  allergies?: string;
  regime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAbonnementRequest {
  eleveId: number;
  typeAbonnement: TypeAbonnement;
  dateDebut: string;
  dateFin?: string;
  montant: number;
  allergies?: string;
  regime?: string;
}

export interface PointageRepas {
  id: number;
  eleveId: number;
  dateRepas: string;
  typeRepas: TypeRepas;
  present: boolean;
  createdAt: string;
}

export interface PointageBatchRequest {
  dateRepas: string;
  typeRepas?: TypeRepas;
  pointages: Array<{
    eleveId: number;
    present: boolean;
  }>;
}

export interface CantineStats {
  totalAbonnes: number;
  repasAujourdHui: number;
  tauxPresence: number;
  revenuesMensuel: number;
}
