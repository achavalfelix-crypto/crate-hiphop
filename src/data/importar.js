import { idDeYouTube } from '../services/youtube';
import { ANIO_MAX, ANIO_MIN, COSTAS, ESTADOS } from './constantes';

// Revisa y limpia una entrada leída de un archivo JSON.
// Devuelve la entrada lista para guardar, o null si no es válida.
export function limpiarEntrada(e) {
  if (!e || typeof e !== 'object') return null;
  const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const title = texto(e.title, 120);
  const artist = texto(e.artist, 80);
  const year = Number(e.year);
  if (!title || !artist || !Number.isInteger(year) || year < ANIO_MIN || year > ANIO_MAX) return null;

  const type = e.type === 'cancion' ? 'cancion' : 'album';
  const coast = COSTAS.some((c) => c.id === e.coast) ? e.coast : 'east';
  const status = ESTADOS.some((s) => s.id === e.status) ? e.status : 'pendiente';
  const rating = Number.isInteger(e.rating) && e.rating >= 0 && e.rating <= 5 ? e.rating : 0;
  const tracks =
    type === 'album' && Array.isArray(e.tracks)
      ? e.tracks
          .filter((t) => t && typeof t.title === 'string' && t.title.trim())
          .slice(0, 60)
          .map((t, i) => ({
            id: `i${i}`,
            title: t.title.trim().slice(0, 120),
            fav: Boolean(t.fav),
            videoId: idDeYouTube(t.videoId),
          }))
      : [];

  const esCancion = type === 'cancion';
  return {
    type,
    title,
    artist,
    album: esCancion ? texto(e.album, 120) : '',
    videoId: esCancion ? idDeYouTube(e.videoId) : '',
    year,
    coast,
    status,
    rating,
    tracks,
  };
}

// Clave para detectar repetidos: mismo tipo, título y artista (sin importar mayúsculas).
export const claveEntrada = (e) =>
  `${e.type ?? 'album'}|${e.title.trim().toLowerCase()}|${e.artist.trim().toLowerCase()}`;

// Lee el archivo y separa lo nuevo de lo repetido o inválido.
export async function prepararImportacion(archivo, existentes) {
  let datos;
  try {
    datos = JSON.parse(await archivo.text());
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  if (!Array.isArray(datos)) throw new Error('El archivo tiene que ser una lista de discos y canciones.');

  const vistas = new Set(existentes.map(claveEntrada));
  const nuevas = [];
  let repetidas = 0;
  let invalidas = 0;
  for (const crudo of datos) {
    const e = limpiarEntrada(crudo);
    if (!e) {
      invalidas++;
      continue;
    }
    const k = claveEntrada(e);
    if (vistas.has(k)) {
      repetidas++;
      continue;
    }
    vistas.add(k);
    nuevas.push(e);
  }
  return { nuevas, repetidas, invalidas };
}
