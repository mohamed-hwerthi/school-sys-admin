import api from "./axios";

export const absencesApi = {
  getByEleve: (eleveId: number): Promise<any[]> =>
    api.get(`/absences/eleve/${eleveId}`),

  getStats: (classeId: number, mois: number, annee: number): Promise<any> =>
    api.get("/absences/stats", { params: { classeId, mois, annee } }),

  getHistorique: (eleveId: number): Promise<any> =>
    api.get(`/absences/historique/${eleveId}`),
};
