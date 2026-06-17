import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { VideoCard } from '@/components/video-card';
import { useTheme } from '@/hooks/use-theme';
import { useVideos } from '@/hooks/use-videos';
import { getTokens } from '@/services/api';

export default function VideoLibraryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { videos, loading, error, refreshing, refresh, loadMore, loadingMore } =
    useVideos(debouncedSearch);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const refreshToken = useCallback(() => {
    getTokens().then((t) => setToken(t?.accessToken ?? null));
  }, []);

  useEffect(() => {
    refreshToken();
  }, [refreshToken]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search videos..."
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.search,
          { color: theme.text, borderColor: theme.primary },
        ]}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
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
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={styles.footer}
            />
          ) : null
        }
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
                  {debouncedSearch
                    ? `No videos match "${debouncedSearch}".`
                    : 'No videos yet. Upload from the web app to get started.'}
                </Text>
              </>
            )}
          </View>
        }
      />
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
  },
  search: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  footer: {
    paddingVertical: 16,
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
