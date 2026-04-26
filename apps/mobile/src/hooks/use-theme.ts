import { Colors } from '@/constants/theme';
import { useThemeContext } from '@/contexts/theme-context';

export function useTheme() {
  const { theme } = useThemeContext();
  return Colors[theme];
}
