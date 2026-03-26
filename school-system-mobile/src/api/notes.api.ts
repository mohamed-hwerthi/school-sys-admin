import api from "./axios";

export const notesApi = {
  getByStudent: (studentId: number, trimestre = 1): Promise<any[]> =>
    api.get(`/notes/student/${studentId}`, { params: { trimestre } }),

  getMoyennes: (classeId: number, trimestre = 1): Promise<any[]> =>
    api.get("/notes/moyennes", { params: { classeId, trimestre } }),
};
