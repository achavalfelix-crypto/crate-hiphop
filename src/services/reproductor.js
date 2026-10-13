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
let buscando = false;
const oyentes = new Set();

function avisar() {
  oyentes.forEach((f) => f());
}

export function reproducir(pista) {
  actual = pista;
  buscando = false;
  avisar();
}

export function cerrarReproductor() {
  actual = null;
  avisar();
}

// Reproduce una canción del cajón con lo que tenga: Spotify, YouTube o, si no tiene nada,
// la busca en Spotify por título y artista. Devuelve el ID de Spotify si lo encontró.
export async function reproducirCancion({ titulo, artista, spotifyId, videoId }) {
  if (spotifyId) {
    reproducir({ fuente: 'spotify', tipo: 'track', id: spotifyId, titulo, artista });
    return spotifyId;
  }
  if (videoId) {
    reproducir({ fuente: 'youtube', id: videoId, titulo, artista });
    return '';
  }
  buscando = true;
  actual = { fuente: 'buscando', titulo, artista };
  avisar();
  try {
    const c = await cancionSpotify(titulo, artista);
    if (actual?.fuente !== 'buscando' || actual.titulo !== titulo) return c?.id ?? ''; // ya eligieron otra
    if (!c) {
      actual = { fuente: 'no-encontrada', titulo, artista };
      avisar();
      return '';
    }
    reproducir({ fuente: 'spotify', tipo: 'track', id: c.id, titulo, artista });
    return c.id;
  } catch {
    actual = { fuente: 'error', titulo, artista };
    avisar();
    return '';
  } finally {
    buscando = false;
  }
}

const suscribir = (f) => {
  oyentes.add(f);
  return () => oyentes.delete(f);
};

export function useReproductor() {
  return useSyncExternalStore(suscribir, () => actual);
}

export const estaBuscando = () => buscando;
