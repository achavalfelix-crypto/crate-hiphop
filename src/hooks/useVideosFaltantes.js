import { useEffect, useRef, useState } from 'react';
import { actualizarAlbum } from '../services/albums';
import { buscarVideo, buscarVideosDelDisco, normalTema, youtubeConfigurado } from '../services/youtube';

// Las canciones que se suman desde Spotify no traen video de YouTube, y sin video no hay reproducciones.
// Este hook busca el video de cada una UNA sola vez y lo guarda en el cajón (videoId).
//
// La cuota gratis de YouTube es de 10.000 unidades por día y cada búsqueda cuesta 100 (unas 100 por día).
// Para que alcance:
// - un disco se resuelve con una sola búsqueda (la lista del álbum en YouTube Music);
// - va primero lo último que agregaste;
// - lo que no tiene video no se vuelve a buscar;
// - si se acaba la cuota, se espera al día siguiente.
const BUSQUEDAS_POR_VISITA = 25;
const CLAVE_SIN = 'yt:sin-video:v2'; // canciones / discos ya buscados sin resultado
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
const clave = (...partes) => partes.join('|').toLowerCase();
// Lo más nuevo primero (lo que se acaba de guardar todavía no tiene fecha: va adelante de todo).
const fecha = (a) => a.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;

// Devuelve 'sin-cuota' si hoy ya no se puede buscar más, o '' si está todo bien.
export default function useVideosFaltantes(uid, albums) {
  const enCurso = useRef(false);
  const busquedas = useRef(0);
  const hechos = useRef(new Set()); // lo que ya se revisó en esta visita
  const [vuelta, setVuelta] = useState(0); // para revisar lo que se agregó mientras buscaba
  const [sinCuota, setSinCuota] = useState(() => leer(CLAVE_CUOTA, '') === hoy());

  useEffect(() => {
    if (!youtubeConfigurado || !uid || sinCuota || enCurso.current || busquedas.current >= BUSQUEDAS_POR_VISITA) return;
    const sin = new Set(leer(CLAVE_SIN, []));
    const faltantes = (a) => a.tracks.filter((t) => !t.videoId && !sin.has(clave(a.artist, t.title)));
    const marca = (a) => `${a.id}:${a.type === 'cancion' ? a.videoId : faltantes(a).map((t) => t.id).join(',')}`;
    const pendientes = [...albums]
      .sort((a, b) => fecha(b) - fecha(a))
      .filter((a) => !hechos.current.has(marca(a)))
      .filter((a) => (a.type === 'cancion' ? !a.videoId && !sin.has(clave(a.artist, a.title)) : faltantes(a).length > 0));
    if (!pendientes.length) return;

    enCurso.current = true;
    const marcarSin = (k) => {
      sin.add(k);
      escribir(CLAVE_SIN, [...sin].slice(-1000));
    };
    (async () => {
      try {
        for (const a of pendientes) {
          if (busquedas.current >= BUSQUEDAS_POR_VISITA) break;
          hechos.current.add(marca(a));
          if (a.type === 'cancion') {
            busquedas.current++;
            const id = await buscarVideo(a.title, a.artist);
            if (id) await actualizarAlbum(uid, a, { videoId: id });
            else marcarSin(clave(a.artist, a.title));
            continue;
          }
          // Disco: primero la lista del álbum (una búsqueda para todas sus canciones).
          const faltan = faltantes(a);
          let porTema = {};
          if (!sin.has(clave('disco', a.artist, a.title))) {
            busquedas.current++;
            porTema = await buscarVideosDelDisco(a.title, a.artist, faltan.map((t) => t.title));
            marcarSin(clave('disco', a.artist, a.title)); // la lista del disco se busca una sola vez
          }
          const tracks = a.tracks.map((t) =>
            !t.videoId && porTema[normalTema(t.title)] ? { ...t, videoId: porTema[normalTema(t.title)] } : t,
          );
          // Las que no estaban en la lista: de a una, mientras quede lugar en esta visita.
          for (let i = 0; i < tracks.length; i++) {
            const t = tracks[i];
            if (t.videoId || sin.has(clave(a.artist, t.title))) continue;
            if (busquedas.current >= BUSQUEDAS_POR_VISITA) break;
            busquedas.current++;
            const id = await buscarVideo(t.title, a.artist);
            if (id) tracks[i] = { ...t, videoId: id };
            else marcarSin(clave(a.artist, t.title));
          }
          if (tracks.some((t, i) => t.videoId !== a.tracks[i].videoId)) await actualizarAlbum(uid, a, { tracks });
        }
      } catch (e) {
        // 403 = se terminó la cuota del día (u otro límite): no se vuelve a intentar hasta mañana.
        if (e.estado === 403 || e.estado === 429) {
          escribir(CLAVE_CUOTA, hoy());
          setSinCuota(true);
        } else console.error(e);
      } finally {
        enCurso.current = false;
        setVuelta((v) => v + 1); // revisa si se agregó algo mientras buscaba
      }
    })();
  }, [uid, albums, sinCuota, vuelta]);

  return sinCuota ? 'sin-cuota' : '';
}
