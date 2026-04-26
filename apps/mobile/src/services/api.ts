import * as SecureStore from 'expo-secure-store';

import { API_URL } from '@/constants/config';
import type { TokenPair } from '@/types/api';

const ACCESS_TOKEN_KEY = 'reelflow_access_token';
const REFRESH_TOKEN_KEY = 'reelflow_refresh_token';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return !payload.exp || payload.exp * 1000 < Date.now() + 10_000;
  } catch {
    return true;
  }
}

export function decodeAccessToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.userId || !payload.email) return null;
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

export async function getTokens(): Promise<TokenPair | null> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function setTokens(tokens: TokenPair): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

let refreshPromise: Promise<TokenPair | null> | null = null;

async function refreshTokens(): Promise<TokenPair | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const tokens = await getTokens();
      if (!tokens?.refreshToken) return null;

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!res.ok) {
        await clearTokens();
        return null;
      }

      const data: TokenPair = await res.json();
      await setTokens(data);
      return data;
    } catch {
      await clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let tokens = await getTokens();

  // Proactively refresh if access token is expired, avoids a wasted 401 round-trip
  if (tokens && isTokenExpired(tokens.accessToken)) {
    const newTokens = await refreshTokens();
    tokens = newTokens ? { accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken } : null;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Fallback: if still 401 (e.g. token revoked server-side), try refresh once more
  if (res.status === 401 && tokens?.refreshToken) {
    const newTokens = await refreshTokens();
    if (newTokens) {
      headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? body.error ?? 'Request failed');
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
