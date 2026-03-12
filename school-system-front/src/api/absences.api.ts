import api from "./axios";
import type { Absence, AbsenceBatchRequest, AbsenceStats } from "@/types/absence";

const BASE = "/absences";

export const absencesApi = {
  batchCreate: async (data: AbsenceBatchRequest): Promise<Absence[]> => {
    const res = await api.post<Absence[]>(`${BASE}/batch`, data);
    return res.data;
  },

  getByClasseDate: async (classeId: number, date: string): Promise<Absence[]> => {
    const res = await api.get<Absence[]>(`${BASE}`, {
      params: { classeId, date },
    });
    return res.data;
  },

  getByEleve: async (eleveId: number): Promise<Absence[]> => {
    const res = await api.get<Absence[]>(`${BASE}/eleve/${eleveId}`);
    return res.data;
  },

  getStats: async (classeId?: number, dateDebut?: string, dateFin?: string): Promise<AbsenceStats> => {
    const params = new URLSearchParams();
    if (classeId) params.set("classeId", String(classeId));
    if (dateDebut) params.set("dateDebut", dateDebut);
    if (dateFin) params.set("dateFin", dateFin);

    const res = await api.get<AbsenceStats>(`${BASE}/stats?${params.toString()}`);
    return res.data;
  },

  justifier: async (id: number, motif: string): Promise<Absence> => {
    const res = await api.patch<Absence>(`${BASE}/${id}/justifier`, { motif });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};
