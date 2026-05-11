import api from "./axios";

export const SALLE_TYPES = [
  "NORMAL",
  "LABO_SVT",
  "LABO_PHYSIQUE",
  "INFO",
  "GYMNASE",
  "ARTS",
  "MUSIQUE",
] as const;
export type SalleType = (typeof SALLE_TYPES)[number];

export const PREFERENCES_HORAIRES = ["MATIN", "APRES_MIDI", "INDIFFERENT"] as const;
export type PreferenceHoraire = (typeof PREFERENCES_HORAIRES)[number];

export interface ModuleDTO {
  id: number;
  name: string;
  nameVp: string | null;
  coeffEtatique: number;
  coeffPrive: number;
  ordreEtatique: number;
  ordrePrive: number;
  niveauId: number;
  niveauName: string;
  domaineId: number | null;
  domaineName: string | null;
  sousDomaineId: number | null;
  sousDomaineName: string | null;
  versionEtatique: boolean;
  versionPrivee: boolean;
  salleTypeRequise: SalleType;
  dureeMinSeance: number;
  dureeMaxSeance: number;
  preferenceHoraire: PreferenceHoraire;
}

export interface ModuleRequest {
  name: string;
  nameVp?: string;
  coeffEtatique: number;
  coeffPrive: number;
  ordreEtatique: number;
  ordrePrive: number;
  niveauId: number;
  domaineId?: number;
  sousDomaineId?: number;
  versionEtatique: boolean;
  versionPrivee: boolean;
  salleTypeRequise?: SalleType;
  dureeMinSeance?: number;
  dureeMaxSeance?: number;
  preferenceHoraire?: PreferenceHoraire;
}

const BASE = "/modules";

export const modulesApi = {
  getAll: async (niveauId?: number): Promise<ModuleDTO[]> => {
    const params = niveauId ? `?niveauId=${niveauId}` : "";
    const res = await api.get<ModuleDTO[]>(`${BASE}${params}`);
    return res.data;
  },

  getById: async (id: number): Promise<ModuleDTO> => {
    const res = await api.get<ModuleDTO>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: ModuleRequest): Promise<ModuleDTO> => {
    const res = await api.post<ModuleDTO>(BASE, data);
    return res.data;
  },

  update: async (id: number, data: ModuleRequest): Promise<ModuleDTO> => {
    const res = await api.put<ModuleDTO>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: (id: number) => api.delete(`${BASE}/${id}`),
};
