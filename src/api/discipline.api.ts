import api from "./axios";
import type { Incident, Sanction } from "@/types/discipline";

const BASE = "/discipline";

export const disciplineApi = {
  // --- Incidents ---
  getIncidents: async (): Promise<Incident[]> => {
    const res = await api.get<Incident[]>(`${BASE}/incidents`);
    return res.data;
  },

  getIncidentById: async (id: number): Promise<Incident> => {
    const res = await api.get<Incident>(`${BASE}/incidents/${id}`);
    return res.data;
  },

  createIncident: async (data: Omit<Incident, "id" | "createdAt">): Promise<Incident> => {
    const res = await api.post<Incident>(`${BASE}/incidents`, data);
    return res.data;
  },

  updateIncident: async (id: number, data: Partial<Incident>): Promise<Incident> => {
    const res = await api.put<Incident>(`${BASE}/incidents/${id}`, data);
    return res.data;
  },

  deleteIncident: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/incidents/${id}`);
  },

  // --- Sanctions ---
  getSanctions: async (): Promise<Sanction[]> => {
    const res = await api.get<Sanction[]>(`${BASE}/sanctions`);
    return res.data;
  },

  getSanctionsByEleve: async (eleveId: number): Promise<Sanction[]> => {
    const res = await api.get<Sanction[]>(`${BASE}/sanctions/eleve/${eleveId}`);
    return res.data;
  },

  createSanction: async (data: Omit<Sanction, "id" | "createdAt">): Promise<Sanction> => {
    const res = await api.post<Sanction>(`${BASE}/sanctions`, data);
    return res.data;
  },

  updateSanction: async (id: number, data: Partial<Sanction>): Promise<Sanction> => {
    const res = await api.put<Sanction>(`${BASE}/sanctions/${id}`, data);
    return res.data;
  },

  deleteSanction: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/sanctions/${id}`);
  },

  // --- By student ---
  getByEleve: async (eleveId: number): Promise<{ incidents: Incident[]; sanctions: Sanction[] }> => {
    const res = await api.get<{ incidents: Incident[]; sanctions: Sanction[] }>(
      `${BASE}/eleve/${eleveId}`
    );
    return res.data;
  },
};
