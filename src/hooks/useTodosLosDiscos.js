import { useEffect, useMemo, useState } from 'react';
import { ARTISTAS } from '../data/archivo';
import { discografiaSpotify } from '../services/spotify';

// La discografía completa (según Spotify) de todos los artistas del archivo, en una sola lista.
// Se pide de a 4 artistas por vez y se va mostrando a medida que llega.
export default function useTodosLosDiscos() {
  const [porArtista, setPorArtista] = useState({});
  const [error, setError] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      let fallos = 0;
      for (let i = 0; i < ARTISTAS.length; i += 4) {
        const lote = ARTISTAS.slice(i, i + 4);
        const res = await Promise.all(lote.map((a) => discografiaSpotify(a.nombre).catch(() => (fallos++, null))));
        if (!vivo) return;
        setPorArtista((prev) => {
          const sig = { ...prev };
          lote.forEach((a, k) => (sig[a.id] = res[k]?.discos ?? []));
          return sig;
        });
      }
      if (vivo && fallos === ARTISTAS.length) setError(true);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const discos = useMemo(() => {
    const vistos = new Set();
    const lista = [];
    for (const a of ARTISTAS) {
      for (const d of porArtista[a.id] ?? []) {
        if (vistos.has(d.id)) continue;
        vistos.add(d.id);
        lista.push({ ...d, artistaId: a.id, artistaNombre: a.nombre, costa: a.costa });
      }
    }
    return lista.sort((x, y) => (x.anio || 9999) - (y.anio || 9999) || x.nombre.localeCompare(y.nombre));
  }, [porArtista]);

  const listos = Object.keys(porArtista).length;
  return { discos, cargando: listos < ARTISTAS.length, listos, total: ARTISTAS.length, error };
}
