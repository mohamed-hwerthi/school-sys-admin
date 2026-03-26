import api from "./axios";

export const annoncesApi = {
  getAll: (activeOnly = true): Promise<any[]> =>
    api.get("/annonces", { params: { activeOnly } }),

  getById: (id: number): Promise<any> =>
    api.get(`/annonces/${id}`),
};
