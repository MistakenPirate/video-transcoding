import { create } from 'zustand';

import { apiFetch, clearTokens, decodeAccessToken, getTokens, setTokens } from '@/services/api';
import type { AuthResponse, User } from '@/types/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const tokens = await getTokens();
      if (!tokens) return;
      const user = decodeAccessToken(tokens.accessToken);
      if (!user) {
        await clearTokens();
        return;
      }
      set({ user, isAuthenticated: true });
    } catch {
      await clearTokens();
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    set({ user: data.user, isAuthenticated: true });
  },

  signOut: async () => {
    try {
      const tokens = await getTokens();
      if (tokens) {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      }
    } catch {
      // Best effort
    } finally {
      await clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },
}));
