import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { Video } from '@/types/api';

const STATUS_LABELS: Record<string, string> = {
  completed: 'COMPLETED',
  processing: 'PROCESSING',
  failed: 'FAILED',
  queued: 'QUEUED',
  uploaded: 'UPLOADED',
};

export function StatusBadge({ status }: { status: Video['status'] }) {
  const theme = useTheme();

  const colorMap: Record<string, string> = {
    completed: theme.statusCompleted,
    processing: theme.statusProcessing,
    failed: theme.statusFailed,
    queued: theme.statusQueued,
    uploaded: theme.statusQueued,
  };

  const color = colorMap[status] ?? theme.textSecondary;

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>
        {STATUS_LABELS[status] ?? status.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
