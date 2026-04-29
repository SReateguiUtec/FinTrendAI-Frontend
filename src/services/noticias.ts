/**
 * MS3 — Feed de Noticias y Sentimiento
 * Noticias con etiqueta Bullish / Bearish / Neutral almacenadas en MongoDB
 */

import { ms3 } from './api';

export type Sentimiento = 'Bullish' | 'Bearish' | 'Neutral';

export interface Noticia {
  _id: string;
  titulo: string;
  simbolo: string;
  sentimiento: Sentimiento;
  fuente: string;
  url?: string;
  fechaPublicacion: string; // campo real en MongoDB
  fecha?: string; // alias por compatibilidad
  /** Cuerpo corto; cuando exista en Mongo, sustituye al resumen autogenerado. */
  resumen?: string;
  autor?: string;
  categoria?: string;
  /** URL de avatar (cuando haya almacenamiento en base de datos). */
  imagenAutorUrl?: string;
  /** Foto/hero del artículo; opcional, no se muestra aún en la card compacta. */
  imagenUrl?: string;
}

export interface SentimientoAgregado {
  sentimiento: Sentimiento;
  total: number;
  bullish: number;
  bearish: number;
  neutral: number;
}

export async function getNoticiasPorSimbolo(simbolo: string): Promise<Noticia[]> {
  const { data } = await ms3.get<Noticia[]>(`/api/noticias/${simbolo}`);
  return data;
}

export async function getSentimiento(simbolo: string): Promise<SentimientoAgregado> {
  const { data } = await ms3.get<SentimientoAgregado>(
    `/api/noticias/${simbolo}/sentimiento`
  );
  return data;
}

export async function getUltimasNoticias(limit = 50): Promise<Noticia[]> {
  const { data } = await ms3.get<Noticia[]>('/api/noticias/latest', {
    params: { limit },
  });
  return data;
}

export async function crearNoticia(
  noticia: Omit<Noticia, '_id' | 'fecha'>
): Promise<Noticia> {
  const { data } = await ms3.post<Noticia>('/api/noticias', noticia);
  return data;
}
