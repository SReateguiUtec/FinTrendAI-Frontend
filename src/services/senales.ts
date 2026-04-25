/**
 * MS4 — Orquestador de Señales
 * Genera recomendaciones Compra / Venta / Mantener
 * combinando datos de MS2 (precios) y MS3 (sentimiento)
 */

import { ms4 } from './api';

export type TipoSenal = 'Compra' | 'Venta' | 'Mantener' | 'Sin datos suficientes';

export interface Senal {
  simbolo: string;
  senal: TipoSenal;
  confianza: number;
  mensaje: string;
  sentimiento: string;
  variacion_precio: number;
  precios_disponibles: number;
}

export async function getSenal(simbolo: string): Promise<Senal> {
  const { data } = await ms4.get<Senal>(`/api/senales/${simbolo}`);
  return data;
}
