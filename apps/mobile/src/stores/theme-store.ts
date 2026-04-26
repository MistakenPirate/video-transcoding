import { Appearance } from 'react-native';
import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const systemTheme = (): Theme =>
  Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: systemTheme(),
  toggleTheme: () => {
    set({ theme: get().theme === 'dark' ? 'light' : 'dark' });
  },
}));
