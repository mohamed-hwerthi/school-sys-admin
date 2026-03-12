import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { anneeScolaireApi } from "@/api/annee-scolaire.api";
import type {
  AnneeScolaire,
  Trimestre,
  Vacance,
  JourFerie,
} from "@/types/annee-scolaire";

const ANNEES_KEY = "annees-scolaires";
const TRIMESTRES_KEY = "trimestres";
const VACANCES_KEY = "vacances";
const JOURS_FERIES_KEY = "jours-feries";

// ─── Annee Scolaire ──────────────────────────────

/**
 * Active academic year.
 */
export function useActiveAnneeScolaire() {
  return useQuery<AnneeScolaire>({
    queryKey: [ANNEES_KEY, "active"],
    queryFn: () => anneeScolaireApi.getActive(),
  });
}

/**
 * All academic years.
 */
export function useAllAnneesScolaires() {
  return useQuery<AnneeScolaire[]>({
    queryKey: [ANNEES_KEY],
    queryFn: () => anneeScolaireApi.getAll(),
  });
}

/**
 * Create academic year.
 */
export function useCreateAnneeScolaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AnneeScolaire, "id" | "active" | "cloturee">) =>
      anneeScolaireApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ANNEES_KEY] });
    },
  });
}

/**
 * Update academic year.
 */
export function useUpdateAnneeScolaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AnneeScolaire> }) =>
      anneeScolaireApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ANNEES_KEY] });
    },
  });
}

/**
 * Close academic year.
 */
export function useCloturerAnneeScolaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anneeScolaireApi.cloturer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ANNEES_KEY] });
    },
  });
}

/**
 * Activate academic year.
 */
export function useActivateAnneeScolaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anneeScolaireApi.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ANNEES_KEY] });
    },
  });
}

// ─── Trimestres ──────────────────────────────

/**
 * Trimesters for an academic year.
 */
export function useTrimestres(anneeScolaireId: number) {
  return useQuery<Trimestre[]>({
    queryKey: [TRIMESTRES_KEY, anneeScolaireId],
    queryFn: () => anneeScolaireApi.getTrimestres(anneeScolaireId),
    enabled: anneeScolaireId > 0,
  });
}

/**
 * Create trimester.
 */
export function useCreateTrimestre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      anneeScolaireId,
      data,
    }: {
      anneeScolaireId: number;
      data: Omit<Trimestre, "id" | "anneeScolaireId">;
    }) => anneeScolaireApi.createTrimestre(anneeScolaireId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TRIMESTRES_KEY] });
    },
  });
}

/**
 * Update trimester.
 */
export function useUpdateTrimestre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Trimestre> }) =>
      anneeScolaireApi.updateTrimestre(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TRIMESTRES_KEY] });
    },
  });
}

/**
 * Delete trimester.
 */
export function useDeleteTrimestre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anneeScolaireApi.deleteTrimestre(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TRIMESTRES_KEY] });
    },
  });
}

// ─── Vacances ──────────────────────────────

/**
 * Holidays for an academic year.
 */
export function useVacances(anneeScolaireId: number) {
  return useQuery<Vacance[]>({
    queryKey: [VACANCES_KEY, anneeScolaireId],
    queryFn: () => anneeScolaireApi.getVacances(anneeScolaireId),
    enabled: anneeScolaireId > 0,
  });
}

/**
 * Create holiday.
 */
export function useCreateVacance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      anneeScolaireId,
      data,
    }: {
      anneeScolaireId: number;
      data: Omit<Vacance, "id" | "anneeScolaireId">;
    }) => anneeScolaireApi.createVacance(anneeScolaireId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [VACANCES_KEY] });
    },
  });
}

/**
 * Delete holiday.
 */
export function useDeleteVacance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anneeScolaireApi.deleteVacance(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [VACANCES_KEY] });
    },
  });
}

// ─── Jours Feries ──────────────────────────────

/**
 * Public holidays for an academic year.
 */
export function useJoursFeries(anneeScolaireId: number) {
  return useQuery<JourFerie[]>({
    queryKey: [JOURS_FERIES_KEY, anneeScolaireId],
    queryFn: () => anneeScolaireApi.getJoursFeries(anneeScolaireId),
    enabled: anneeScolaireId > 0,
  });
}

/**
 * Create public holiday.
 */
export function useCreateJourFerie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      anneeScolaireId,
      data,
    }: {
      anneeScolaireId: number;
      data: Omit<JourFerie, "id" | "anneeScolaireId">;
    }) => anneeScolaireApi.createJourFerie(anneeScolaireId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [JOURS_FERIES_KEY] });
    },
  });
}

/**
 * Delete public holiday.
 */
export function useDeleteJourFerie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anneeScolaireApi.deleteJourFerie(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [JOURS_FERIES_KEY] });
    },
  });
}
