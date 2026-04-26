import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { VideoCard } from '@/components/video-card';
import { useTheme } from '@/hooks/use-theme';
import { useVideos } from '@/hooks/use-videos';
import { getTokens } from '@/services/api';

export default function VideoLibraryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { videos, loading, error, refreshing, refresh } = useVideos();
  const [token, setToken] = useState<string | null>(null);

  const refreshToken = useCallback(() => {
    getTokens().then((t) => setToken(t?.accessToken ?? null));
  }, []);

  useEffect(() => {
    refreshToken();
  }, [refreshToken]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.uploadId}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            token={token}
            onPress={() => router.push(`/(app)/watch/${item.uploadId}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => { refresh(); refreshToken(); }}
        ListHeaderComponent={
          <Text style={[styles.header, { color: theme.textSecondary }]}>
            YOUR VIDEOS
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {error ? (
              <Text style={[styles.emptyText, { color: theme.error }]}>{error}</Text>
            ) : (
              <>
                <Text style={[styles.emptyDiamond, { color: theme.accent }]}>
                  {'\u25C6'}
                </Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No videos yet. Upload from the web app to get started.
                </Text>
              </>
            )}
          </View>
        }
      />
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
  },
  list: {
    padding: 16,
  },
  header: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 16,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyDiamond: {
    fontSize: 32,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
