import api from "./axios";

// ─── Backend DTOs ────────────────────────────────────────

export interface AuditFinancierDTO {
  id: number;
  entityType: string;
  entityId: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  userId: number | null;
  userName: string | null;
  oldValues: string | null;
  newValues: string | null;
  createdAt: string;
}

// ─── API calls ───────────────────────────────────────────

export const auditFinancierApi = {
  getAll: async (entityType?: string): Promise<AuditFinancierDTO[]> => {
    const params = entityType ? `?entityType=${entityType}` : "";
    const res = await api.get<AuditFinancierDTO[]>(`/audit-financier${params}`);
    return res.data;
  },

  getByEntity: async (entityType: string, entityId: number): Promise<AuditFinancierDTO[]> => {
    const res = await api.get<AuditFinancierDTO[]>(
      `/audit-financier/${entityType}/${entityId}`
    );
    return res.data;
  },
};
