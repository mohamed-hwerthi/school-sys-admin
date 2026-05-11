import api from "./axios";

export interface VolumeHoraireDTO {
  id: number;
  moduleId: number;
  classeId: number;
  enseignantId: number | null;
  anneeScolaireId: number | null;
  nbHeuresHebdo: number;
  createdAt: string;
  updatedAt: string;
}

export interface VolumeHoraireRequest {
  moduleId: number;
  classeId: number;
  enseignantId?: number;
  anneeScolaireId?: number;
  nbHeuresHebdo: number;
}

const BASE = "/volume-horaire";

export const volumeHoraireApi = {
  getAll: async (params?: {
    classeId?: number;
    anneeScolaireId?: number;
  }): Promise<VolumeHoraireDTO[]> => {
    const res = await api.get<VolumeHoraireDTO[]>(BASE, { params });
    return res.data;
  },

  create: async (data: VolumeHoraireRequest): Promise<VolumeHoraireDTO> => {
    const res = await api.post<VolumeHoraireDTO>(BASE, data);
    return res.data;
  },

  update: async (
    id: number,
    data: VolumeHoraireRequest
  ): Promise<VolumeHoraireDTO> => {
    const res = await api.put<VolumeHoraireDTO>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};
