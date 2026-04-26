import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { API_URL } from '@/constants/config';
import { useTheme } from '@/hooks/use-theme';
import type { Video } from '@/types/api';

interface Props {
  video: Video;
  token: string | null;
  onPress: () => void;
}

export function VideoCard({ video, token, onPress }: Props) {
  const theme = useTheme();
  const isPlayable = video.status === 'completed';
  const date = new Date(video.uploadedAt).toLocaleDateString();
  const hasThumbnail = isPlayable && video.jobId && token;

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          opacity: isPlayable ? 1 : 0.7,
        },
      ]}
      onPress={onPress}
      disabled={!isPlayable}
    >
      {hasThumbnail ? (
        <Image
          source={{
            uri: `${API_URL}/videos/stream/${video.jobId}/thumbnail.jpg`,
            headers: { Authorization: `Bearer ${token}` },
          }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.backgroundSelected }]}>
          <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
            {video.status === 'processing' ? 'Processing...' : '\u25B6'}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.filename, { color: theme.text }]} numberOfLines={1}>
            {video.filename}
          </Text>
          <StatusBadge status={video.status} />
        </View>
        <Text style={[styles.date, { color: theme.textSecondary }]}>{date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  thumbnailPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  info: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filename: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 11,
    marginTop: 4,
  },
});
