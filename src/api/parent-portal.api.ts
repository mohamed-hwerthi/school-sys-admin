import api from "./axios";
import type { Child } from "@/types/notification";

const BASE = "/parent-portal";

export interface ParentNote {
  id: number;
  studentId: number;
  studentName: string;
  examenId: number;
  examenName: string;
  trimestre: number;
  valeur: number;
  observation?: string;
}

export interface ParentAbsence {
  id: number;
  eleveId: number;
  date: string;
  type: string;
  seance: string;
  heureArrivee?: string;
  justifie: boolean;
  motif?: string;
  enseignantId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParentBulletin {
  studentId: number;
  studentName: string;
  classe: string;
  niveau: string;
  trimestre: number;
  moyenneGenerale?: number;
  moyenneClasse?: number;
  rang?: number;
  totalEleves?: number;
  domaines: unknown[];
  modulesHorsDomaine: unknown[];
}

export interface ParentEmploiDuTemps {
  id: number;
  classeId: number;
  creneauId: number;
  jourSemaine: number;
  moduleId?: number;
  enseignantId?: number;
  salle?: string;
  createdAt: string;
  updatedAt: string;
}

export const parentPortalApi = {
  getChildren: async (): Promise<Child[]> => {
    const res = await api.get<Child[]>(`${BASE}/children`);
    return res.data;
  },

  getChildNotes: async (studentId: number, trimestre = 1): Promise<ParentNote[]> => {
    const res = await api.get<ParentNote[]>(`${BASE}/children/${studentId}/notes`, {
      params: { trimestre },
    });
    return res.data;
  },

  getChildAbsences: async (studentId: number): Promise<ParentAbsence[]> => {
    const res = await api.get<ParentAbsence[]>(`${BASE}/children/${studentId}/absences`);
    return res.data;
  },

  getChildBulletin: async (
    studentId: number,
    classeId: number,
    trimestre = 1
  ): Promise<ParentBulletin> => {
    const res = await api.get<ParentBulletin>(`${BASE}/children/${studentId}/bulletin`, {
      params: { classeId, trimestre },
    });
    return res.data;
  },

  getChildEmploiDuTemps: async (studentId: number): Promise<ParentEmploiDuTemps[]> => {
    const res = await api.get<ParentEmploiDuTemps[]>(
      `${BASE}/children/${studentId}/emploi-du-temps`
    );
    return res.data;
  },
};
