import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/services/api';
import type { Video } from '@/types/api';

export function useVideos() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['videos'],
    queryFn: () => apiFetch<{ videos: Video[] }>('/videos'),
  });

  return {
    videos: data?.videos ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refreshing: isRefetching,
    refresh: refetch,
  };
}
