import { useEffect, useMemo, useState } from 'react';
import { ARTISTAS } from '../data/archivo';
import { todasLasDiscografias } from '../services/spotify';

// La discografía completa (según Spotify, hasta 2016) de todos los artistas del archivo.
// Es un solo pedido: el servidor junta las 26 y Vercel lo guarda una semana.
export default function useTodosLosDiscos() {
  const [estado, setEstado] = useState({ cargando: true, error: '', porArtista: {} });

  useEffect(() => {
    let vivo = true;
    todasLasDiscografias()
      .then((r) => {
        if (!vivo) return;
        const porArtista = {};
        (r?.artistas ?? []).forEach((a) => (porArtista[a.id] = a.discos));
        setEstado({ cargando: false, error: '', porArtista });
      })
      .catch((e) => vivo && setEstado({ cargando: false, error: e.message || 'No pudimos traer las discografías.', porArtista: {} }));
    return () => {
      vivo = false;
    };
  }, []);

  const discos = useMemo(() => {
    const vistos = new Set();
    const lista = [];
    for (const a of ARTISTAS) {
      for (const d of estado.porArtista[a.id] ?? []) {
        if (vistos.has(d.id)) continue;
        vistos.add(d.id);
        lista.push({ ...d, artistaId: a.id, artistaNombre: a.nombre, costa: a.costa });
      }
    }
    return lista.sort((x, y) => x.anio - y.anio || x.nombre.localeCompare(y.nombre));
  }, [estado.porArtista]);

  const desde = discos.length ? discos[0].anio : null;
  return { discos, desde, cargando: estado.cargando, error: estado.error, total: ARTISTAS.length };
}
