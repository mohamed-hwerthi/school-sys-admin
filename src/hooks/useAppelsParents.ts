import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appelsParentsApi,
  type AppelParentDTO,
  type AppelParentRequest,
} from "@/api/appels-parents.api";

const KEY = "appels-parents";

export function useAppelsParents(eleveId?: number) {
  return useQuery<AppelParentDTO[]>({
    queryKey: [KEY, eleveId ?? "all"],
    queryFn: () => appelsParentsApi.getAll(eleveId),
    enabled: eleveId === undefined || eleveId > 0,
  });
}

export function useCreateAppelParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AppelParentRequest) => appelsParentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteAppelParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appelsParentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
