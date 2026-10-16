import { useEffect, useRef } from 'react';
import { actualizarAlbum } from '../services/albums';
import { buscarVideo, youtubeConfigurado } from '../services/youtube';

// Las canciones que se suman desde Spotify no traen video de YouTube, y sin video no hay reproducciones.
// Este hook busca el video de cada una UNA sola vez y lo guarda en el cajón (videoId).
// Cada búsqueda gasta 100 de las 10.000 unidades diarias de YouTube: se hacen pocas por visita
// y, si se acaba la cuota, se corta hasta el día siguiente.
const POR_VISITA = 20;
const CLAVE_SIN = 'yt:sin-video'; // canciones que no tienen video (para no volver a buscarlas)
const CLAVE_CUOTA = 'yt:sin-cuota'; // fecha en que se acabó la cuota

const leer = (k, def) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? def;
  } catch {
    return def;
  }
};
const escribir = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* sin almacenamiento */
  }
};
const hoy = () => new Date().toISOString().slice(0, 10);
const clave = (artista, titulo) => `${artista}|${titulo}`.toLowerCase();

export default function useVideosFaltantes(uid, albums) {
  const enCurso = useRef(false);
  const gastadas = useRef(0);

  useEffect(() => {
    if (!youtubeConfigurado || !uid || enCurso.current || gastadas.current >= POR_VISITA) return;
    if (leer(CLAVE_CUOTA, '') === hoy()) return;
    const sin = new Set(leer(CLAVE_SIN, []));
    const falta = (artista, titulo) => !sin.has(clave(artista, titulo));

    // Primero las canciones sueltas, después las canciones de cada disco.
    const sueltas = albums.filter((a) => a.type === 'cancion' && !a.videoId && falta(a.artist, a.title));
    const discos = albums.filter((a) => a.type === 'album' && a.tracks.some((t) => !t.videoId && falta(a.artist, t.title)));
    if (!sueltas.length && !discos.length) return;

    enCurso.current = true;
    (async () => {
      const buscar = async (artista, titulo) => {
        gastadas.current++;
        const id = await buscarVideo(titulo, artista);
        if (!id) {
          sin.add(clave(artista, titulo));
          escribir(CLAVE_SIN, [...sin].slice(-500));
        }
        return id;
      };
      try {
        for (const a of sueltas) {
          if (gastadas.current >= POR_VISITA) return;
          const id = await buscar(a.artist, a.title);
          if (id) await actualizarAlbum(uid, a, { videoId: id });
        }
        for (const a of discos) {
          if (gastadas.current >= POR_VISITA) return;
          const tracks = [...a.tracks];
          let cambio = false;
          for (let i = 0; i < tracks.length && gastadas.current < POR_VISITA; i++) {
            const t = tracks[i];
            if (t.videoId || !falta(a.artist, t.title)) continue;
            const id = await buscar(a.artist, t.title);
            if (id) {
              tracks[i] = { ...t, videoId: id };
              cambio = true;
            }
          }
          if (cambio) await actualizarAlbum(uid, a, { tracks });
        }
      } catch (e) {
        // 403 = se terminó la cuota del día (u otro límite): no se vuelve a intentar hasta mañana.
        if (e.estado === 403 || e.estado === 429) escribir(CLAVE_CUOTA, hoy());
        else console.error(e);
      } finally {
        enCurso.current = false;
      }
    })();
  }, [uid, albums]);
}
