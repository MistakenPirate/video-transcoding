import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

function getApiUrl(): string {
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  if (typeof configUrl === 'string' && configUrl.length > 0) return configUrl;
  if (debuggerHost) return `http://${debuggerHost}:8000`;
  return 'http://localhost:8000';
}

export const API_URL: string = getApiUrl();
