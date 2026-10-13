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
      // Si un artista falla (Spotify frena cuando hay muchos pedidos juntos), se reintenta hasta 3 veces esperando un poco más cada vez.
      const traer = async (a) => {
        for (let intento = 0; intento < 4; intento++) {
          try {
            return await discografiaSpotify(a.nombre);
          } catch {
            await new Promise((r) => setTimeout(r, 1500 * (intento + 1)));
          }
        }
        fallos++;
        return null;
      };
      for (let i = 0; i < ARTISTAS.length; i += 3) {
        const lote = ARTISTAS.slice(i, i + 3);
        const res = await Promise.all(lote.map(traer));
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
