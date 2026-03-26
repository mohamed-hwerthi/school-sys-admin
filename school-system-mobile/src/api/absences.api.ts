import api from "./axios";

export const absencesApi = {
  getByEleve: (eleveId: number): Promise<any[]> =>
    api.get(`/absences/eleve/${eleveId}`),

  getStats: (classeId: number): Promise<any> =>
    api.get("/absences/stats", { params: { classeId } }),

  getHistorique: (eleveId: number): Promise<any> =>
    api.get(`/absences/historique/${eleveId}`),
};
