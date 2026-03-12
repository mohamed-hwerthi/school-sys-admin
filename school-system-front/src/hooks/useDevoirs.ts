import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { devoirsApi } from "@/api/devoirs.api";
import type {
  Devoir,
  CreateDevoirRequest,
  Soumission,
  CreateSoumissionRequest,
  CorrectionRequest,
  RessourcePedagogique,
  CreateRessourceRequest,
  DevoirStats,
} from "@/types/devoir";

const DEVOIRS_KEY = "devoirs";
const SOUMISSIONS_KEY = "soumissions";
const RESSOURCES_KEY = "ressources";
const DEVOIR_STATS_KEY = "devoir-stats";

// ── Devoirs ──

export function useDevoirs(classeId?: number, moduleId?: number) {
  return useQuery<Devoir[]>({
    queryKey: [DEVOIRS_KEY, classeId, moduleId],
    queryFn: () => devoirsApi.getAll(classeId, moduleId),
  });
}

export function useCreateDevoir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDevoirRequest) => devoirsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEVOIRS_KEY] }),
  });
}

export function useUpdateDevoir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateDevoirRequest }) =>
      devoirsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEVOIRS_KEY] }),
  });
}

export function useCloseDevoir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devoirsApi.close(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEVOIRS_KEY] }),
  });
}

export function useDeleteDevoir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devoirsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEVOIRS_KEY] }),
  });
}

// ── Soumissions ──

export function useSoumissionsByDevoir(devoirId?: number) {
  return useQuery<Soumission[]>({
    queryKey: [SOUMISSIONS_KEY, "devoir", devoirId],
    queryFn: () => devoirsApi.getSoumissionsByDevoir(devoirId!),
    enabled: !!devoirId,
  });
}

export function useSoumissionsByEleve(eleveId?: number) {
  return useQuery<Soumission[]>({
    queryKey: [SOUMISSIONS_KEY, "eleve", eleveId],
    queryFn: () => devoirsApi.getSoumissionsByEleve(eleveId!),
    enabled: !!eleveId,
  });
}

export function useSubmitSoumission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSoumissionRequest) => devoirsApi.submitSoumission(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SOUMISSIONS_KEY] });
      qc.invalidateQueries({ queryKey: [DEVOIRS_KEY] });
    },
  });
}

export function useCorrectSoumission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CorrectionRequest }) =>
      devoirsApi.correctSoumission(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SOUMISSIONS_KEY] }),
  });
}

export function useDeleteSoumission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devoirsApi.deleteSoumission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SOUMISSIONS_KEY] });
      qc.invalidateQueries({ queryKey: [DEVOIRS_KEY] });
    },
  });
}

export function useDevoirStats(devoirId?: number) {
  return useQuery<DevoirStats>({
    queryKey: [DEVOIR_STATS_KEY, devoirId],
    queryFn: () => devoirsApi.getDevoirStats(devoirId!),
    enabled: !!devoirId,
  });
}

// ── Ressources ──

export function useRessources(moduleId?: number) {
  return useQuery<RessourcePedagogique[]>({
    queryKey: [RESSOURCES_KEY, moduleId],
    queryFn: () => devoirsApi.getRessources(moduleId),
  });
}

export function useCreateRessource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRessourceRequest) => devoirsApi.createRessource(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESSOURCES_KEY] }),
  });
}

export function useUpdateRessource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateRessourceRequest }) =>
      devoirsApi.updateRessource(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESSOURCES_KEY] }),
  });
}

export function useDeleteRessource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devoirsApi.deleteRessource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESSOURCES_KEY] }),
  });
}
