import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { absencesApi } from "@/api/absences.api";
import type { Absence, AbsenceBatchRequest, AbsenceStats } from "@/types/absence";

const ABSENCES_KEY = "absences";

/**
 * Absences by class + date.
 */
export function useAbsencesByClasseDate(classeId: number, date: string) {
  return useQuery<Absence[]>({
    queryKey: [ABSENCES_KEY, "classe", classeId, date],
    queryFn: () => absencesApi.getByClasseDate(classeId, date),
    enabled: classeId > 0 && !!date,
  });
}

/**
 * Absences by student.
 */
export function useAbsencesByEleve(eleveId: number) {
  return useQuery<Absence[]>({
    queryKey: [ABSENCES_KEY, "eleve", eleveId],
    queryFn: () => absencesApi.getByEleve(eleveId),
    enabled: eleveId > 0,
  });
}

/**
 * Absence statistics.
 */
export function useAbsenceStats(classeId?: number, dateDebut?: string, dateFin?: string) {
  return useQuery<AbsenceStats>({
    queryKey: [ABSENCES_KEY, "stats", classeId, dateDebut, dateFin],
    queryFn: () => absencesApi.getStats(classeId, dateDebut, dateFin),
  });
}

/**
 * Batch create absences mutation.
 */
export function useBatchCreateAbsences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AbsenceBatchRequest) => absencesApi.batchCreate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ABSENCES_KEY] });
    },
  });
}

/**
 * Justify absence mutation.
 */
export function useJustifyAbsence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: number; motif: string }) =>
      absencesApi.justifier(id, motif),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ABSENCES_KEY] });
    },
  });
}

/**
 * Delete absence mutation.
 */
export function useDeleteAbsence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => absencesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ABSENCES_KEY] });
    },
  });
}
