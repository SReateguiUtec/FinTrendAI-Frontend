/**
 * MS1 — Gestión de Portafolios
 * Portafolios y lista de favoritos (watchlist) por portafolio
 */

import { ms1 } from './api';

export interface Portafolio {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at: string;
}

export interface Favorito {
  id: number;
  simbolo: string;
  nombreEmpresa: string;
  added_at: string;
}

// ------------------------------------------------------------------
// Portafolios
// ------------------------------------------------------------------

export async function getPortafolios(): Promise<Portafolio[]> {
  const { data } = await ms1.get<Portafolio[]>('/api/portafolios/');
  return data;
}

export async function getPortafolio(portafolioId: number): Promise<Portafolio> {
  const { data } = await ms1.get<Portafolio>(`/api/portafolios/${portafolioId}`);
  return data;
}

export async function createPortafolio(
  nombre: string,
  descripcion?: string
): Promise<{ id: number; nombre: string }> {
  const { data } = await ms1.post('/api/portafolios/', { nombre, descripcion });
  return data;
}

export async function deletePortafolio(portafolioId: number): Promise<void> {
  await ms1.delete(`/api/portafolios/${portafolioId}`);
}

// ------------------------------------------------------------------
// Favoritos
// ------------------------------------------------------------------

export async function getFavoritos(portafolioId: number): Promise<Favorito[]> {
  const { data } = await ms1.get<Favorito[]>(`/api/favoritos/${portafolioId}`);
  return data;
}

export async function addFavorito(
  portafolioId: number,
  simbolo: string,
  nombreEmpresa?: string
): Promise<{ id: number; simbolo: string }> {
  const { data } = await ms1.post(`/api/favoritos/${portafolioId}`, { simbolo, nombreEmpresa });
  return data;
}

export async function removeFavorito(portafolioId: number, simbolo: string): Promise<void> {
  await ms1.delete(`/api/favoritos/${portafolioId}/${simbolo}`);
}
