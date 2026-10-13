import { useEffect, useMemo, useState } from 'react';
import { claveCancion } from '../services/playlists';
import { albumSpotify } from '../services/spotify';

// Todas las canciones del cajón en una sola lista: las sueltas, las de cada disco y,
// para los discos que no tienen canciones cargadas, su lista completa desde Spotify.
export default function useCancionesCajon(albums) {
  const [deSpotify, setDeSpotify] = useState({}); // id del disco → canciones
  const sinCanciones = useMemo(
    () => albums.filter((a) => a.type === 'album' && a.tracks.length === 0),
    [albums],
  );

  useEffect(() => {
    let vivo = true;
    const pendientes = sinCanciones.filter((a) => !(a.id in deSpotify));
    if (!pendientes.length) return;
    // De a 4 discos por vez para no saturar.
    (async () => {
      for (let i = 0; i < pendientes.length; i += 4) {
        const lote = pendientes.slice(i, i + 4);
        const res = await Promise.all(
          lote.map((a) => albumSpotify(a.title, a.artist, a.year).catch(() => null)),
        );
        if (!vivo) return;
        setDeSpotify((prev) => {
          const sig = { ...prev };
          lote.forEach((a, k) => (sig[a.id] = res[k]?.canciones ?? []));
          return sig;
        });
      }
    })();
    return () => {
      vivo = false;
    };
  }, [sinCanciones]); // eslint-disable-line react-hooks/exhaustive-deps

  const canciones = useMemo(() => {
    const lista = [];
    for (const a of albums) {
      const base = { anio: a.year, costa: a.coast, puntaje: a.rating, estado: a.status };
      if (a.type === 'cancion') {
        lista.push({ ...base, titulo: a.title, artista: a.artist, disco: a.album, spotifyId: a.spotifyId, videoId: a.videoId, fav: a.favorita });
      } else if (a.tracks.length) {
        a.tracks.forEach((t) =>
          lista.push({ ...base, titulo: t.title, artista: a.artist, disco: a.title, spotifyId: t.spotifyId ?? '', videoId: t.videoId ?? '', fav: t.fav || a.favorita }),
        );
      } else {
        (deSpotify[a.id] ?? []).forEach((c) =>
          lista.push({ ...base, titulo: c.nombre, artista: a.artist, disco: a.title, spotifyId: c.id, videoId: '', fav: a.favorita }),
        );
      }
    }
    // Sin repetidas
    const vistas = new Set();
    return lista
      .map((c) => ({ ...c, clave: claveCancion(c) }))
      .filter((c) => (vistas.has(c.clave) ? false : vistas.add(c.clave)));
  }, [albums, deSpotify]);

  const completando = sinCanciones.some((a) => !(a.id in deSpotify));
  return { canciones, completando };
}
