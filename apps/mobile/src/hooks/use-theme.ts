import { Colors } from '@/constants/theme';
import { useThemeStore } from '@/stores/theme-store';

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  return Colors[theme];
}
