import api from "./axios";
import type { ContratEnseignant, Conge } from "@/types/contrat";

const BASE = "/contrats";

export const contratsApi = {
  // --- Contrats ---
  getAll: async (): Promise<ContratEnseignant[]> => {
    const res = await api.get<ContratEnseignant[]>(BASE);
    return res.data;
  },

  getByEnseignant: async (enseignantId: number): Promise<ContratEnseignant[]> => {
    const res = await api.get<ContratEnseignant[]>(`${BASE}/enseignant/${enseignantId}`);
    return res.data;
  },

  create: async (data: Omit<ContratEnseignant, "id">): Promise<ContratEnseignant> => {
    const res = await api.post<ContratEnseignant>(BASE, data);
    return res.data;
  },

  update: async (id: number, data: Partial<ContratEnseignant>): Promise<ContratEnseignant> => {
    const res = await api.put<ContratEnseignant>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },

  // --- Conges ---
  getAllConges: async (): Promise<Conge[]> => {
    const res = await api.get<Conge[]>(`${BASE}/conges`);
    return res.data;
  },

  getCongesByEnseignant: async (enseignantId: number): Promise<Conge[]> => {
    const res = await api.get<Conge[]>(`${BASE}/conges/enseignant/${enseignantId}`);
    return res.data;
  },

  createConge: async (data: Omit<Conge, "id" | "enseignantNom" | "statut">): Promise<Conge> => {
    const res = await api.post<Conge>(`${BASE}/conges`, data);
    return res.data;
  },

  approuverConge: async (id: number): Promise<Conge> => {
    const res = await api.patch<Conge>(`${BASE}/conges/${id}/approuver`);
    return res.data;
  },

  refuserConge: async (id: number): Promise<Conge> => {
    const res = await api.patch<Conge>(`${BASE}/conges/${id}/refuser`);
    return res.data;
  },

  deleteConge: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/conges/${id}`);
  },
};
