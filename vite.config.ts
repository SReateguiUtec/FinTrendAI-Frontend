import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/** Destino del proxy: env > fallback local (mismo stack que `npm run dev` en la raíz del monorepo). */
function resolveMsUrlForProxy(env: Record<string, string>, n: 1 | 2 | 3 | 4 | 5): string {
  const key = `VITE_MS${n}_URL`;
  const raw = env[key]?.trim();
  const fallback = `http://localhost:${5000 + n}`;
  return (raw || fallback).replace(/\/$/, '');
}

function proxyForMs(n: 1 | 2 | 3 | 4 | 5, target: string) {
  return {
    target,
    changeOrigin: true,
    rewrite: (p: string) => p.replace(new RegExp(`^/proxy/ms${n}`), ''),
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '.'), '');
  const isDev = mode === 'development';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: isDev
      ? {
          proxy: {
            '/proxy/ms1': proxyForMs(1, resolveMsUrlForProxy(env, 1)),
            '/proxy/ms2': proxyForMs(2, resolveMsUrlForProxy(env, 2)),
            '/proxy/ms3': proxyForMs(3, resolveMsUrlForProxy(env, 3)),
            '/proxy/ms4': proxyForMs(4, resolveMsUrlForProxy(env, 4)),
            '/proxy/ms5': proxyForMs(5, resolveMsUrlForProxy(env, 5)),
          },
        }
      : undefined,
    build: {
      chunkSizeWarningLimit: 2000,
    },
  };
});
