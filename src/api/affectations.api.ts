import api from "./axios";

export interface AffectationDTO {
  id: number;
  teacherId: number;
  teacherName: string;
  classeId: number;
  classeName: string;
  moduleId: number | null;
  moduleName: string | null;
  anneeScolaire: string;
  dateDebut: string | null;
  dateFin: string | null;
  notes: string | null;
}

export interface AffectationRequest {
  teacherId: number;
  classeId: number;
  moduleId: number | null;
  anneeScolaire: string;
  dateDebut?: string | null;
  dateFin?: string | null;
  notes?: string | null;
}

export interface AffectationFilters {
  teacherId?: number;
  classeId?: number;
  moduleId?: number;
  anneeScolaire?: string;
}

const BASE = "/affectations";

export const affectationsApi = {
  search: async (filters: AffectationFilters = {}): Promise<AffectationDTO[]> => {
    const params = new URLSearchParams();
    if (filters.teacherId != null) params.set("teacherId", String(filters.teacherId));
    if (filters.classeId != null) params.set("classeId", String(filters.classeId));
    if (filters.moduleId != null) params.set("moduleId", String(filters.moduleId));
    if (filters.anneeScolaire) params.set("anneeScolaire", filters.anneeScolaire);
    const qs = params.toString();
    const res = await api.get<AffectationDTO[]>(`${BASE}${qs ? `?${qs}` : ""}`);
    return res.data;
  },

  getOne: async (id: number): Promise<AffectationDTO> => {
    const res = await api.get<AffectationDTO>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (req: AffectationRequest): Promise<AffectationDTO> => {
    const res = await api.post<AffectationDTO>(BASE, req);
    return res.data;
  },

  update: async (id: number, req: AffectationRequest): Promise<AffectationDTO> => {
    const res = await api.put<AffectationDTO>(`${BASE}/${id}`, req);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};
