export type VehiculeStatut = 'ACTIF' | 'EN_PANNE' | 'EN_MAINTENANCE';

export interface Vehicule {
  id: number;
  immatriculation: string;
  marque?: string;
  modele?: string;
  capacite: number;
  chauffeurNom?: string;
  chauffeurTelephone?: string;
  dateAssurance?: string;
  dateControleTechnique?: string;
  statut: VehiculeStatut;
  createdAt: string;
  updatedAt: string;
}

export interface Arret {
  id?: number;
  circuitId?: number;
  nom: string;
  adresse?: string;
  ordre: number;
  heurePassage?: string;
  latitude?: number;
  longitude?: number;
}

export interface Circuit {
  id: number;
  nom: string;
  description?: string;
  vehiculeId?: number;
  vehiculeImmatriculation?: string;
  heureDepart?: string;
  heureRetour?: string;
  distanceKm?: number;
  coutMensuel?: number;
  actif: boolean;
  arrets: Arret[];
  nbEleves?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AffectationTransport {
  id: number;
  eleveId: number;
  circuitId: number;
  circuitNom?: string;
  arretId?: number;
  arretNom?: string;
  anneeScolaire: string;
  actif: boolean;
  createdAt: string;
}

export interface TransportStats {
  totalCircuits: number;
  totalVehicules: number;
  totalEleves: number;
  tauxRemplissage: number;
}

export interface CreateCircuitRequest {
  nom: string;
  description?: string;
  vehiculeId?: number;
  heureDepart?: string;
  heureRetour?: string;
  distanceKm?: number;
  coutMensuel?: number;
  arrets?: Arret[];
}

export interface CreateAffectationRequest {
  eleveId: number;
  circuitId: number;
  arretId?: number;
  anneeScolaire: string;
}
