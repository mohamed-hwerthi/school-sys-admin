import api from "./axios";

export const DISPO_TYPES = ["INDISPONIBLE", "PREFERE", "EVITER"] as const;
export type DispoType = (typeof DISPO_TYPES)[number];

export interface DisponibiliteDTO {
  id: number;
  enseignantId: number;
  jourSemaine: number; // 1=Lundi ... 6=Samedi
  creneauId: number;
  type: DispoType;
  motif: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DisponibiliteRequest {
  enseignantId: number;
  jourSemaine: number;
  creneauId: number;
  type: DispoType;
  motif?: string;
}

const BASE = "/disponibilites-enseignants";

export const disponibilitesApi = {
  getAll: async (enseignantId?: number): Promise<DisponibiliteDTO[]> => {
    const res = await api.get<DisponibiliteDTO[]>(BASE, {
      params: enseignantId ? { enseignantId } : undefined,
    });
    return res.data;
  },

  create: async (data: DisponibiliteRequest): Promise<DisponibiliteDTO> => {
    const res = await api.post<DisponibiliteDTO>(BASE, data);
    return res.data;
  },

  update: async (
    id: number,
    data: DisponibiliteRequest
  ): Promise<DisponibiliteDTO> => {
    const res = await api.put<DisponibiliteDTO>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};
