import { useQuery } from "@tanstack/react-query";
import { reportingApi } from "@/api/reporting.api";
import type { DashboardStats, MonthlyTrend } from "@/types/reporting";

const DASHBOARD_KEY = "reporting-dashboard";
const TRENDS_KEY = "reporting-trends";

/**
 * Dashboard stats for a given academic year.
 */
export function useDashboardStats(anneeScolaire: string = "2025-2026") {
  return useQuery<DashboardStats>({
    queryKey: [DASHBOARD_KEY, anneeScolaire],
    queryFn: () => reportingApi.getDashboard(anneeScolaire),
  });
}

/**
 * Monthly trends for a given academic year.
 */
export function useMonthlyTrends(anneeScolaire: string = "2025-2026") {
  return useQuery<MonthlyTrend[]>({
    queryKey: [TRENDS_KEY, anneeScolaire],
    queryFn: () => reportingApi.getTrends(anneeScolaire),
  });
}
