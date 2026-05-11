import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disponibilitesApi,
  type DisponibiliteDTO,
  type DisponibiliteRequest,
} from "@/api/disponibilites.api";

const KEY = "disponibilites";

export function useDisponibilites(enseignantId?: number) {
  return useQuery<DisponibiliteDTO[]>({
    queryKey: [KEY, enseignantId ?? "all"],
    queryFn: () => disponibilitesApi.getAll(enseignantId),
    enabled: enseignantId === undefined || enseignantId > 0,
  });
}

export function useCreateDisponibilite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DisponibiliteRequest) => disponibilitesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateDisponibilite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; data: DisponibiliteRequest }) =>
      disponibilitesApi.update(vars.id, vars.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteDisponibilite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => disponibilitesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
