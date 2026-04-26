import { useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ videos: Video[] }>('/videos');
        const found = data.videos.find((v) => v.uploadId === id);
        if (!found) {
          setError('Video not found');
          return;
        }
        if (found.status !== 'completed' || !found.jobId) {
          setError('Video is not ready for playback');
          return;
        }
        setVideo(found);
        setJobId(found.jobId);
        const tokens = await getTokens();
        setToken(tokens?.accessToken ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load video');
      }
    })();
  }, [id]);

  const hlsUrl =
    jobId && token
      ? `${API_URL}/videos/stream/${jobId}/${QUALITIES[selectedQuality].path}`
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
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      </View>
    );
  }

  if (!hlsUrl || !token) {
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
});
