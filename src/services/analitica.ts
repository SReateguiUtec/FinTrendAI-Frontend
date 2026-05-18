/**
 * MS5 — Analítica de Mercado
 * Consultas sobre datos históricos vía AWS Athena.
 * Retorna datos reales en producción o datos de ejemplo en MOCK MODE.
 */

import { ms5 } from './api';
export { ms5 };

export interface RendimientoSector {
  sector: string;
  rendimiento_promedio: string;
  total_acciones: string;
}

export interface RendimientoSimbolo {
  simbolo: string;
  fecha: string;
  rendimiento: string;
  precio_cierre?: string;
  volumen?: string;
  volatilidad?: string;
}

export interface TendenciaMercado {
  dia: string;
  precio_promedio: string;
  volumen_total: string;
}

export interface AlertaContradiccion {
  simbolo: string;
  volatilidad_promedio: string;
  noticias_bullish: string;
  noticias_bearish: string;
  total_noticias: string;
}

export interface PopularidadActivo {
  simbolo: string;
  menciones: number | string;
  estrategias: string;
}

export interface RendimientoDetallado {
  sector: string;
  sentimiento: string;
  volumen_noticias: string;
}

export async function getRendimientoSector(periodo: string = '30d'): Promise<RendimientoSector[]> {
  const { data } = await ms5.get<RendimientoSector[]>('/api/analitica/rendimiento-sector', {
    params: { periodo }
  });
  return data;
}

export async function getRendimientoSimbolo(simbolo: string): Promise<RendimientoSimbolo[]> {
  const { data } = await ms5.get<RendimientoSimbolo[]>('/api/analitica/rendimiento-simbolo', {
    params: { simbolo },
  });
  return data;
}

export async function getTendencias(): Promise<TendenciaMercado[]> {
  const { data } = await ms5.get<TendenciaMercado[]>('/api/analitica/tendencias');
  return data;
}

export async function getAlertasContradiccion(): Promise<AlertaContradiccion[]> {
  const { data } = await ms5.get<AlertaContradiccion[]>('/api/analitica/alertas-contradiccion');
  return data;
}

export async function getPopularidadActivos(): Promise<PopularidadActivo[]> {
  const { data } = await ms5.get<PopularidadActivo[]>('/api/analitica/popularidad-activos');
  return data;
}

export async function getRendimientoDetallado(): Promise<RendimientoDetallado[]> {
  const { data } = await ms5.get<RendimientoDetallado[]>('/api/analitica/rendimiento-detallado');
  return data;
}

export async function ejecutarQueryPersonalizado(query: string): Promise<unknown[]> {
  const { data } = await ms5.post<unknown[]>('/api/analitica/ejecutar', { query });
  return data;
}
