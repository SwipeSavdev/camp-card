import Constants from 'expo-constants';

function getString(name: string): string | undefined {
 // Expo public env vars (recommended)
 const env = (process?.env as any) ?? {};
 if (typeof env[name] === 'string' && env[name].trim().length > 0) return env[name].trim();

 // Expo config extra (app.json)
 const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, any>;
 if (typeof extra[name] === 'string' && extra[name].trim().length > 0) return extra[name].trim();

 return undefined;
}

export const ENV = {
 apiBaseUrl:
 getString('EXPO_PUBLIC_API_BASE_URL') ||
 getString('API_BASE_URL') ||
 'http://localhost:8080',
 apiTimeoutMs: Number(getString('API_TIMEOUT') || 30000),
 enableMockAuth: (getString('ENABLE_MOCK_AUTH') || 'true') === 'true',
};
