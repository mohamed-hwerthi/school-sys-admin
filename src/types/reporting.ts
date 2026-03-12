export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalRevenue: number;
  totalPending: number;
  tauxRecouvrement: number;
  tauxAbsence: number;
  moyenneGenerale: number;
  studentsByNiveau: Record<string, number>;
}

export interface MonthlyTrend {
  month: string;
  inscriptions: number;
  paiements: number;
  absences: number;
}
