import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { apiFetch } from '@/services/api';
import type { Video } from '@/types/api';

const PAGE_SIZE = 4;

interface VideosResponse {
  videos: Video[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    nextOffset: number | null;
  };
}

export function useVideos(search = '') {
  const q = search.trim();
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['videos', q],
    queryFn: ({ pageParam }) =>
      apiFetch<VideosResponse>(
        `/videos?limit=${PAGE_SIZE}&offset=${pageParam}` +
          (q ? `&q=${encodeURIComponent(q)}` : ''),
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.pagination.nextOffset ?? undefined,
    placeholderData: keepPreviousData,
  });

  return {
    videos: data?.pages.flatMap((page) => page.videos) ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refreshing: isRefetching,
    refresh: refetch,
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    loadingMore: isFetchingNextPage,
  };
}
