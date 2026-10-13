// Estado del reproductor de la página: qué está sonando.
// Un solo reproductor para todo el sitio, así la música sigue al cambiar de sección.
//
// pista = {
//   fuente: 'spotify' | 'youtube',
//   tipo: 'track' | 'album',     // solo Spotify
//   id: string,                  // ID de Spotify o de YouTube
//   titulo, artista,
//   discoId?: string,            // id del disco del archivo, para que gire el vinilo
// }
import { useSyncExternalStore } from 'react';
import { cancionSpotify } from './spotify';

let actual = null;
let cola = null; // { nombre, canciones, indice } cuando suena una playlist
const oyentes = new Set();

function avisar() {
  oyentes.forEach((f) => f());
}

export function reproducir(pista, { deCola = false } = {}) {
  if (!deCola) cola = null;
  actual = pista;
  avisar();
}

export function cerrarReproductor() {
  actual = null;
  cola = null;
  avisar();
}

// Reproduce una canción del cajón con lo que tenga: Spotify, YouTube o, si no tiene nada,
// la busca en Spotify por título y artista. Devuelve el ID de Spotify si lo encontró.
export async function reproducirCancion({ titulo, artista, spotifyId, videoId }, { deCola = false } = {}) {
  if (!deCola) cola = null;
  if (spotifyId) {
    reproducir({ fuente: 'spotify', tipo: 'track', id: spotifyId, titulo, artista }, { deCola: true });
    return spotifyId;
  }
  if (videoId) {
    reproducir({ fuente: 'youtube', id: videoId, titulo, artista }, { deCola: true });
    return '';
  }
  actual = { fuente: 'buscando', titulo, artista };
  avisar();
  try {
    const c = await cancionSpotify(titulo, artista);
    if (actual?.fuente !== 'buscando' || actual.titulo !== titulo) return c?.id ?? ''; // ya eligieron otra
    if (!c) {
      actual = { fuente: 'no-encontrada', titulo, artista };
      avisar();
      if (cola) setTimeout(siguiente, 1500); // en una playlist, salta a la próxima
      return '';
    }
    reproducir({ fuente: 'spotify', tipo: 'track', id: c.id, titulo, artista }, { deCola: true });
    return c.id;
  } catch {
    actual = { fuente: 'error', titulo, artista };
    avisar();
    return '';
  }
}

// ── Cola: una playlist que suena tema tras tema ──
function tocarActual() {
  const c = cola.canciones[cola.indice];
  reproducirCancion(c, { deCola: true });
}

export function reproducirCola(nombre, canciones, indice = 0) {
  if (!canciones.length) return;
  cola = { nombre, canciones, indice };
  tocarActual();
}

export function siguiente() {
  if (!cola || cola.indice >= cola.canciones.length - 1) return false;
  cola = { ...cola, indice: cola.indice + 1 };
  tocarActual();
  return true;
}

export function anterior() {
  if (!cola || cola.indice === 0) return;
  cola = { ...cola, indice: cola.indice - 1 };
  tocarActual();
}

export function useCola() {
  return useSyncExternalStore(suscribir, () => cola);
}

const suscribir = (f) => {
  oyentes.add(f);
  return () => oyentes.delete(f);
};

export function useReproductor() {
  return useSyncExternalStore(suscribir, () => actual);
}

