import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emploiDuTempsApi } from "@/api/emploi-du-temps.api";
import type { EmploiDuTempsEntry, Creneau, Conflit } from "@/types/emploi-du-temps";

const EDT_KEY = "emploi-du-temps";
const CRENEAUX_KEY = "creneaux";

/**
 * Schedule entries by class.
 */
export function useEmploiByClasse(classeId: number) {
  return useQuery<EmploiDuTempsEntry[]>({
    queryKey: [EDT_KEY, "classe", classeId],
    queryFn: () => emploiDuTempsApi.getByClasse(classeId),
    enabled: classeId > 0,
  });
}

/**
 * Schedule entries by teacher.
 */
export function useEmploiByEnseignant(enseignantId: number) {
  return useQuery<EmploiDuTempsEntry[]>({
    queryKey: [EDT_KEY, "enseignant", enseignantId],
    queryFn: () => emploiDuTempsApi.getByEnseignant(enseignantId),
    enabled: enseignantId > 0,
  });
}

/**
 * All time slots.
 */
export function useCreneaux() {
  return useQuery<Creneau[]>({
    queryKey: [CRENEAUX_KEY],
    queryFn: () => emploiDuTempsApi.getCreneaux(),
  });
}

/**
 * Save all schedule entries for a class.
 */
export function useSaveEmploi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classeId, entries }: { classeId: number; entries: EmploiDuTempsEntry[] }) =>
      emploiDuTempsApi.saveAll(classeId, entries),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EDT_KEY] });
    },
  });
}

/**
 * Check for scheduling conflicts.
 */
export function useCheckConflits() {
  return useMutation<Conflit[], Error, { classeId: number; entries: EmploiDuTempsEntry[] }>({
    mutationFn: ({ classeId, entries }) =>
      emploiDuTempsApi.checkConflits(classeId, entries),
  });
}

/**
 * Create a new time slot.
 */
export function useCreateCreneau() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Creneau, "id">) => emploiDuTempsApi.createCreneau(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CRENEAUX_KEY] });
    },
  });
}
