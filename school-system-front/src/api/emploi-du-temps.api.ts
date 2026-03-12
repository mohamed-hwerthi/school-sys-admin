import api from "./axios";
import type { EmploiDuTempsEntry, Creneau, Conflit } from "@/types/emploi-du-temps";

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
    const res = await api.post<Conflit[]>(`${BASE}/check-conflits`, { classeId, entries });
    return res.data;
  },

  getCreneaux: async (): Promise<Creneau[]> => {
    const res = await api.get<Creneau[]>(`${BASE}/creneaux`);
    return res.data;
  },

  createCreneau: async (data: Omit<Creneau, "id">): Promise<Creneau> => {
    const res = await api.post<Creneau>(`${BASE}/creneaux`, data);
    return res.data;
  },
};
