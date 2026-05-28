import { useQuery } from "@tanstack/react-query";
import { vitrinePublicApi } from "@/api/vitrine.api";
import { normalizeVitrinePublicData } from "@/lib/vitrine-defaults";

/**
 * Hook for public vitrine data (no auth).
 */
export function useVitrine(slug: string | undefined, preview = false) {
  return useQuery({
    queryKey: ["vitrine", slug, preview ? "preview" : "public"],
    queryFn: async () => {
      const data = await vitrinePublicApi.getFullVitrine(slug!, { preview });
      return normalizeVitrinePublicData(data);
    },
    enabled: !!slug,
    staleTime: preview ? 0 : 10 * 60 * 1000,
  });
}

export function useVitrinePage(slug: string | undefined, pageSlug: string | undefined) {
  return useQuery({
    queryKey: ["vitrine", slug, "page", pageSlug],
    queryFn: () => vitrinePublicApi.getPage(slug!, pageSlug!),
    enabled: !!slug && !!pageSlug,
    staleTime: 10 * 60 * 1000,
  });
}
