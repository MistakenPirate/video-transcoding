import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { API_URL } from '@/constants/config';
import { useTheme } from '@/hooks/use-theme';
import { apiFetch, getTokens } from '@/services/api';
import type { Video } from '@/types/api';

const QUALITIES = [
  { label: 'Auto', path: 'master.m3u8' },
  { label: '480p', path: '480p/index.m3u8' },
  { label: '360p', path: '360p/index.m3u8' },
];

export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedQuality, setSelectedQuality] = useState(0);

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/videos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      router.back();
    },
    onError: (e: Error) => Alert.alert('Delete failed', e.message),
  });

  const confirmDelete = (filename: string) => {
    Alert.alert(
      'Delete video',
      `Delete "${filename}"? This permanently removes the video and its files.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ],
    );
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const [videosData, tokens] = await Promise.all([
        apiFetch<{ videos: Video[] }>('/videos'),
        getTokens(),
      ]);
      const found = videosData.videos.find((v) => v.uploadId === id);
      if (!found) throw new Error('Video not found');
      if (found.status !== 'completed' || !found.jobId) {
        throw new Error('Video is not ready for playback');
      }
      return { video: found, token: tokens?.accessToken ?? null };
    },
  });

  const video = data?.video ?? null;
  const token = data?.token ?? null;

  const hlsUrl =
    video?.jobId && token
      ? `${API_URL}/videos/stream/${video.jobId}/${QUALITIES[selectedQuality].path}`
      : null;

  const player = useVideoPlayer(
    hlsUrl && token
      ? {
          uri: hlsUrl,
          headers: { Authorization: `Bearer ${token}` },
        }
      : null,
    (p) => {
      p.play();
    },
  );

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.diamond, { color: theme.accent }]}>{'\u25C6'}</Text>
        <Text style={[styles.errorText, { color: theme.error }]}>{error.message}</Text>
      </View>
    );
  }

  if (isLoading || !hlsUrl || !token) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls
        contentFit="contain"
        fullscreenOptions={{
          enable: true,
          orientation: 'landscape',
          autoExitOnRotate: true,
        }}
      />

      <View style={styles.pills}>
        {QUALITIES.map((q, i) => (
          <Pressable
            key={q.label}
            style={[
              styles.pill,
              {
                backgroundColor:
                  selectedQuality === i ? theme.primary : 'transparent',
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setSelectedQuality(i)}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: selectedQuality === i ? '#fafaf5' : theme.primary,
                },
              ]}
            >
              {q.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {video && (
        <View style={styles.info}>
          <Text style={[styles.filename, { color: theme.text }]}>
            {video.filename}
          </Text>
          <Text style={[styles.uploadId, { color: theme.textSecondary }]}>
            {video.uploadId}
          </Text>
          <Pressable
            style={[styles.deleteButton, { borderColor: theme.error }]}
            onPress={() => confirmDelete(video.filename)}
            disabled={deleteMutation.isPending}
          >
            <Text style={[styles.deleteText, { color: theme.error }]}>
              {deleteMutation.isPending ? 'DELETING...' : 'DELETE VIDEO'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  diamond: {
    fontSize: 32,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  info: {
    padding: 16,
  },
  filename: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadId: {
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  deleteButton: {
    marginTop: 20,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
