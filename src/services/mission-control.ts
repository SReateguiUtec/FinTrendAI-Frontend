import { getUltimasNoticias, type Noticia } from './noticias';
import { getUltimoPrecio, type PrecioAccion } from './precios';
import { getSenal, type Senal, type TipoSenal } from './senales';

export const MISSION_CONTROL_SYMBOLS = [
  { simbolo: 'AAPL', nombre: 'Apple Inc.', venue: 'NASDAQ' },
  { simbolo: 'NVDA', nombre: 'NVIDIA', venue: 'NASDAQ' },
  { simbolo: 'MSFT', nombre: 'Microsoft', venue: 'NASDAQ' },
  { simbolo: 'GOOGL', nombre: 'Alphabet', venue: 'NASDAQ' },
  { simbolo: 'TSLA', nombre: 'Tesla', venue: 'NASDAQ' },
] as const;

export interface MissionControlQuote {
  simbolo: string;
  nombre: string;
  venue: string;
  precio: number | null;
  variacion: number | null;
  volumen: number | null;
  precioRaw: PrecioAccion | null;
}

export interface MissionControlSignalRow {
  simbolo: string;
  nombre: string;
  senal: TipoSenal;
  confianza: number;
  mensaje: string;
  sentimiento: string;
  variacion_precio: number | null;
  precios_disponibles: number;
  raw: Senal | null;
}

export interface MissionControlNewsRow {
  _id: string;
  simbolo: string;
  titulo: string;
  sentimiento: Noticia['sentimiento'];
  fuente: string;
  fechaPublicacion: string;
  resumen?: string;
  url?: string;
}

export async function getMissionControlMarketOverview(): Promise<MissionControlQuote[]> {
  const quotes = await Promise.all(
    MISSION_CONTROL_SYMBOLS.map(async ({ simbolo, nombre, venue }) => {
      try {
        const precio = await getUltimoPrecio(simbolo);
        if (!precio) {
          return { simbolo, nombre, venue, precio: null, variacion: null, volumen: null, precioRaw: null };
        }
        const base = precio.open || precio.close || 0;
        const variacion = base ? ((precio.close - precio.open) / base) * 100 : 0;
        return {
          simbolo,
          nombre,
          venue,
          precio: precio.close,
          variacion,
          volumen: precio.volumen,
          precioRaw: precio,
        };
      } catch {
        return { simbolo, nombre, venue, precio: null, variacion: null, volumen: null, precioRaw: null };
      }
    })
  );

  return quotes;
}

export async function getMissionControlSignals(): Promise<MissionControlSignalRow[]> {
  const signals = await Promise.all(
    MISSION_CONTROL_SYMBOLS.map(async ({ simbolo, nombre }) => {
      try {
        const signal = await getSenal(simbolo);
        return {
          simbolo,
          nombre,
          senal: signal.senal,
          confianza: Number(signal.confianza ?? 0),
          mensaje: signal.mensaje,
          sentimiento: signal.sentimiento ?? 'Neutral',
          variacion_precio: signal.variacion_precio ?? null,
          precios_disponibles: signal.precios_disponibles ?? 0,
          raw: signal,
        };
      } catch {
        return {
          simbolo,
          nombre,
          senal: 'Sin datos suficientes',
          confianza: 0,
          mensaje: 'No se pudo generar una señal en este momento.',
          sentimiento: 'Neutral',
          variacion_precio: null,
          precios_disponibles: 0,
          raw: null,
        };
      }
    })
  );

  return signals;
}

export async function getMissionControlNewsPulse(limit = 8): Promise<MissionControlNewsRow[]> {
  const noticias = await getUltimasNoticias(40);
  const targets = new Set(MISSION_CONTROL_SYMBOLS.map((item) => item.simbolo));

  const priorizadas = noticias
    .filter((item) => targets.has(item.simbolo))
    .sort((a, b) => new Date(b.fechaPublicacion ?? b.fecha ?? 0).getTime() - new Date(a.fechaPublicacion ?? a.fecha ?? 0).getTime())
    .slice(0, limit);

  return priorizadas.map((item) => ({
    _id: item._id,
    simbolo: item.simbolo,
    titulo: item.titulo,
    sentimiento: item.sentimiento,
    fuente: item.fuente,
    fechaPublicacion: item.fechaPublicacion ?? item.fecha ?? new Date().toISOString(),
    resumen: item.resumen,
    url: item.url,
  }));
}
