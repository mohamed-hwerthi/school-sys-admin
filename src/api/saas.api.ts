import api from "./axios";
import type {
  TenantOnboardingRequest,
  SuperAdminDashboard,
  TenantResponse,
  TenantUsage,
  TenantPlan,
} from "@/types/saas";

export const saasApi = {
  // Onboarding (public)
  onboard: async (data: TenantOnboardingRequest): Promise<TenantResponse> => {
    const res = await api.post<TenantResponse>("/onboarding", data);
    return res.data;
  },

  // Super Admin
  getDashboard: async (): Promise<SuperAdminDashboard> => {
    const res = await api.get<SuperAdminDashboard>("/super-admin/dashboard");
    return res.data;
  },

  getAllTenants: async (): Promise<TenantResponse[]> => {
    const res = await api.get<TenantResponse[]>("/super-admin/tenants");
    return res.data;
  },

  getTenantUsage: async (id: number): Promise<TenantUsage> => {
    const res = await api.get<TenantUsage>(`/super-admin/tenants/${id}/usage`);
    return res.data;
  },

  changePlan: async (id: number, plan: string): Promise<TenantPlan> => {
    const res = await api.put<TenantPlan>(`/super-admin/tenants/${id}/plan`, null, {
      params: { plan },
    });
    return res.data;
  },

  activateTenant: async (id: number): Promise<void> => {
    await api.put(`/super-admin/tenants/${id}/activate`);
  },

  deactivateTenant: async (id: number): Promise<void> => {
    await api.put(`/super-admin/tenants/${id}/deactivate`);
  },
};
