/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MS1_URL?: string
  readonly VITE_MS2_URL?: string
  readonly VITE_MS3_URL?: string
  readonly VITE_MS4_URL?: string
  readonly VITE_MS5_URL?: string
  /** URL del repo (icono GitHub en el navbar del landing). */
  readonly VITE_GITHUB_URL?: string
}
