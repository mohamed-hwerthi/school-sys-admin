import api from "./axios";
import type { EmploiDuTempsEntry, Creneau, Conflit, Remplacement, RemplacementRequest } from "@/types/emploi-du-temps";

const BASE = "/emploi-du-temps";

export const emploiDuTempsApi = {
  getByClasse: async (classeId: number): Promise<EmploiDuTempsEntry[]> => {
    const res = await api.get<EmploiDuTempsEntry[]>(`${BASE}/classe/${classeId}`);
    return res.data;
  },

  getByEnseignant: async (enseignantId: number): Promise<EmploiDuTempsEntry[]> => {
    const res = await api.get<EmploiDuTempsEntry[]>(`${BASE}/enseignant/${enseignantId}`);
    return res.data;
  },

  saveAll: async (classeId: number, entries: EmploiDuTempsEntry[]): Promise<EmploiDuTempsEntry[]> => {
    const res = await api.put<EmploiDuTempsEntry[]>(`${BASE}/classe/${classeId}`, entries);
    return res.data;
  },

  checkConflits: async (classeId: number, entries: EmploiDuTempsEntry[]): Promise<Conflit[]> => {
    const res = await api.post<Conflit[]>(`${BASE}/check-conflits`, entries);
    return res.data;
  },

  // Creneaux
  getCreneaux: async (): Promise<Creneau[]> => {
    const res = await api.get<Creneau[]>("/creneaux");
    return res.data;
  },

  createCreneau: async (data: Omit<Creneau, "id">): Promise<Creneau> => {
    const res = await api.post<Creneau>("/creneaux", data);
    return res.data;
  },

  deleteCreneau: async (id: number): Promise<void> => {
    await api.delete(`/creneaux/${id}`);
  },

  // Remplacements
  getRemplacements: async (): Promise<Remplacement[]> => {
    const res = await api.get<Remplacement[]>(`${BASE}/remplacements`);
    return res.data;
  },

  createRemplacement: async (data: RemplacementRequest): Promise<Remplacement> => {
    const res = await api.post<Remplacement>(`${BASE}/remplacements`, data);
    return res.data;
  },

  deleteRemplacement: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/remplacements/${id}`);
  },
};
