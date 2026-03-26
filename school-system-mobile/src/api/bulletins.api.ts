import api from "./axios";

export const bulletinsApi = {
  getStudentBulletin: (studentId: number, classeId: number, trimestre = 1, version = "etatique"): Promise<any> =>
    api.get(`/bulletins/student/${studentId}`, { params: { classeId, trimestre, version } }),

  getStatsReussite: (classeId: number, trimestre: number): Promise<any> =>
    api.get(`/bulletins/stats/classe/${classeId}/trimestre/${trimestre}`),
};
