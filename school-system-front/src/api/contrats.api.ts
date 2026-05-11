import api from "./axios";
import type { ContratEnseignant, Conge } from "@/types/contrat";

const CONTRATS = "/rh/contrats";
const CONGES = "/rh/conges";

export const contratsApi = {
  // --- Contrats ---
  getAll: async (): Promise<ContratEnseignant[]> => {
    const res = await api.get<ContratEnseignant[]>(CONTRATS);
    return res.data;
  },

  getByEnseignant: async (enseignantId: number): Promise<ContratEnseignant[]> => {
    const res = await api.get<ContratEnseignant[]>(`${CONTRATS}/enseignant/${enseignantId}`);
    return res.data;
  },

  create: async (data: Omit<ContratEnseignant, "id">): Promise<ContratEnseignant> => {
    const res = await api.post<ContratEnseignant>(CONTRATS, data);
    return res.data;
  },

  update: async (id: number, data: Partial<ContratEnseignant>): Promise<ContratEnseignant> => {
    const res = await api.put<ContratEnseignant>(`${CONTRATS}/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${CONTRATS}/${id}`);
  },

  // --- Conges ---
  getAllConges: async (): Promise<Conge[]> => {
    const res = await api.get<Conge[]>(CONGES);
    return res.data;
  },

  getCongesByEnseignant: async (enseignantId: number): Promise<Conge[]> => {
    const res = await api.get<Conge[]>(`${CONGES}/enseignant/${enseignantId}`);
    return res.data;
  },

  createConge: async (data: Omit<Conge, "id" | "enseignantNom" | "statut">): Promise<Conge> => {
    const res = await api.post<Conge>(CONGES, data);
    return res.data;
  },

  approuverConge: async (id: number): Promise<Conge> => {
    const res = await api.put<Conge>(`${CONGES}/${id}/approuver`);
    return res.data;
  },

  refuserConge: async (id: number): Promise<Conge> => {
    const res = await api.put<Conge>(`${CONGES}/${id}/refuser`);
    return res.data;
  },

  deleteConge: async (id: number): Promise<void> => {
    await api.delete(`${CONGES}/${id}`);
  },
};
