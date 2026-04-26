import { useCallback, useEffect, useState } from 'react';

import { apiFetch } from '@/services/api';
import type { Video } from '@/types/api';

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<{ videos: Video[] }>('/videos');
      setVideos(data.videos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, error, refreshing, refresh };
}
