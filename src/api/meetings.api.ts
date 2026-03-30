import api from "./axios";

export interface MeetingRequest {
  title: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  enseignantId?: number;
  parentId?: number;
  studentId?: number;
  statut?: string;
  notes?: string;
}

export interface MeetingResponse {
  id: number;
  title: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  enseignantId?: number;
  enseignantName?: string;
  parentId?: number;
  parentName?: string;
  studentId?: number;
  studentName?: string;
  statut: "PLANIFIE" | "CONFIRME" | "ANNULE";
  notes?: string;
  createdAt: string;
}

const BASE = "/meetings";

export const meetingsApi = {
  getAll: async (): Promise<MeetingResponse[]> => {
    const res = await api.get<MeetingResponse[]>(BASE);
    return res.data;
  },

  getById: async (id: number): Promise<MeetingResponse> => {
    const res = await api.get<MeetingResponse>(`${BASE}/${id}`);
    return res.data;
  },

  getByTeacher: async (enseignantId: number): Promise<MeetingResponse[]> => {
    const res = await api.get<MeetingResponse[]>(`${BASE}/teacher/${enseignantId}`);
    return res.data;
  },

  getByParent: async (parentId: number): Promise<MeetingResponse[]> => {
    const res = await api.get<MeetingResponse[]>(`${BASE}/parent/${parentId}`);
    return res.data;
  },

  getByStudent: async (studentId: number): Promise<MeetingResponse[]> => {
    const res = await api.get<MeetingResponse[]>(`${BASE}/student/${studentId}`);
    return res.data;
  },

  getByDateRange: async (start: string, end: string): Promise<MeetingResponse[]> => {
    const res = await api.get<MeetingResponse[]>(`${BASE}/range`, {
      params: { start, end },
    });
    return res.data;
  },

  getByStatut: async (statut: string): Promise<MeetingResponse[]> => {
    const res = await api.get<MeetingResponse[]>(`${BASE}/statut/${statut}`);
    return res.data;
  },

  create: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const res = await api.post<MeetingResponse>(BASE, data);
    return res.data;
  },

  update: async (id: number, data: MeetingRequest): Promise<MeetingResponse> => {
    const res = await api.put<MeetingResponse>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};
