import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';

export default function AppLayout() {
  const theme = useTheme();
  const signOut = useAuthStore((s) => s.signOut);
  const { theme: themeMode, toggleTheme } = useThemeStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/signin');
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: '#fafaf5',
        headerTitle: () => (
          <Text style={styles.headerTitle}>REELFLOW</Text>
        ),
        headerRight: () => (
          <View style={styles.headerRight}>
            <Pressable onPress={toggleTheme} style={styles.signOutButton}>
              <Text style={styles.signOutText}>
                {themeMode === 'dark' ? 'LIGHT' : 'DARK'}
              </Text>
            </Pressable>
            <Pressable onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>SIGN OUT</Text>
            </Pressable>
          </View>
        ),
        headerBackTitle: 'Back',
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: '#fafaf5',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fafaf5',
  },
  signOutText: {
    color: '#fafaf5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
