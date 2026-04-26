import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1a1a1a',
    background: '#fafaf5',
    backgroundElement: '#f0ede6',
    backgroundSelected: '#e5e2db',
    textSecondary: '#6b6b6b',
    primary: '#103956',
    accent: '#d4a843',
    border: '#103956',
    error: '#dc2626',
    statusCompleted: '#16a34a',
    statusProcessing: '#2563eb',
    statusFailed: '#dc2626',
    statusQueued: '#9333ea',
  },
  dark: {
    text: '#fafaf5',
    background: '#0a0a0a',
    backgroundElement: '#1a1a1a',
    backgroundSelected: '#2a2a2a',
    textSecondary: '#a0a0a0',
    primary: '#4a9eda',
    accent: '#d4a843',
    border: '#4a9eda',
    error: '#ef4444',
    statusCompleted: '#22c55e',
    statusProcessing: '#3b82f6',
    statusFailed: '#ef4444',
    statusQueued: '#a855f7',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
