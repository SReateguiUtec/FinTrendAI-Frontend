/**
 * MS2 — Historial de Precios
 * Datos OHLC (Open, High, Low, Close) almacenados en PostgreSQL
 */

import { ms2 } from './api';

export interface PrecioAccion {
  id: number;
  simbolo: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volumen: number;
  fecha: string;
  esPremium: boolean;
}

export interface Simbolo {
  id: number;
  simbolo: string;
  nombre: string;
  sector?: string;
  industria?: string;
  bolsa?: string;
  pais?: string;
  activo: boolean;
}

/** Lista todos los símbolos activos en la BD (tabla `simbolos` de MS2). */
export async function getSimbolos(): Promise<Simbolo[]> {
  const { data } = await ms2.get<Simbolo[]>('/api/simbolos');
  return data;
}

/** Busca un símbolo concreto; lanza error 404 si no existe. */
export async function getSimboloByTicker(ticker: string): Promise<Simbolo | null> {
  try {
    const { data } = await ms2.get<Simbolo>(`/api/simbolos/${ticker}`);
    return data;
  } catch {
    return null;
  }
}


export async function getPrecios(simbolo: string): Promise<PrecioAccion[]> {
  const { data } = await ms2.get<PrecioAccion[]>(`/api/precios/${simbolo}`);
  return data;
}

export async function getUltimoPrecio(simbolo: string): Promise<PrecioAccion | null> {
  try {
    const { data } = await ms2.get<PrecioAccion>(`/api/precios/${simbolo}/latest`);
    return data;
  } catch {
    return null;
  }
}

export async function getPreciosRango(
  simbolo: string,
  inicio: string,
  fin: string
): Promise<PrecioAccion[]> {
  const { data } = await ms2.get<PrecioAccion[]>(`/api/precios/${simbolo}/range`, {
    params: { inicio, fin },
  });
  return data;
}

export async function getPreciosConPermiso(
  simbolo: string,
  usuarioId: number
): Promise<PrecioAccion[]> {
  const { data } = await ms2.get<PrecioAccion[]>(
    `/api/precios/${simbolo}/usuario/${usuarioId}`
  );
  return data;
}
