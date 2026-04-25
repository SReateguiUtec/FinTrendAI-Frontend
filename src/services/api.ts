import axios from 'axios';

/**
 * En desarrollo, el cliente usa rutas `/proxy/msN` (mismo origen) y Vite
 * reenvía a las URLs definidas en `VITE_MS*_URL` del `.env` (ver `vite.config.ts`).
 * En producción, `VITE_MS*_URL` deben estar definidas en el entorno de build.
 */
const isDev = import.meta.env.DEV;

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function requireProdBaseUrl(envKey: keyof ImportMetaEnv): string {
  const raw = import.meta.env[envKey];
  const v = typeof raw === 'string' ? raw.trim() : '';
  if (!v) {
    throw new Error(
      `Falta ${String(envKey)}. Defínela en Frontend/.env (plantilla: .env.example) y vuelve a construir el frontend.`,
    );
  }
  return trimTrailingSlash(v);
}

const BASE_URLS = {
  ms1: isDev ? '/proxy/ms1' : requireProdBaseUrl('VITE_MS1_URL'),
  ms2: isDev ? '/proxy/ms2' : requireProdBaseUrl('VITE_MS2_URL'),
  ms3: isDev ? '/proxy/ms3' : requireProdBaseUrl('VITE_MS3_URL'),
  ms4: isDev ? '/proxy/ms4' : requireProdBaseUrl('VITE_MS4_URL'),
  ms5: isDev ? '/proxy/ms5' : requireProdBaseUrl('VITE_MS5_URL'),
} as const;

function createClient(baseURL: string) {
  const instance = axios.create({ baseURL, timeout: 60_000 });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('fintrend_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

export const ms1 = createClient(BASE_URLS.ms1);
export const ms2 = createClient(BASE_URLS.ms2);
export const ms3 = createClient(BASE_URLS.ms3);
export const ms4 = createClient(BASE_URLS.ms4);
export const ms5 = createClient(BASE_URLS.ms5);

export async function sendChatMessage(messages: any[], context: any) {
  const { data } = await ms4.post('/api/chat', { messages, contexto: context });
  return data;
}
