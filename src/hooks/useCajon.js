import { useEffect, useState } from 'react';
import { normalizar } from '../data/constantes';
import { escucharAlbums, iniciarSesion } from '../services/albums';
import { escucharPlaylists } from '../services/playlists';

// Sesión anónima + discos y playlists del visitante, en tiempo real.
export default function useCajon() {
  const [estado, setEstado] = useState({ uid: null, albums: [], playlists: [], cargando: true, error: null });

  useEffect(() => {
    const cortes = [];
    let vivo = true;
    let listos = 0;
    const fallo = () => vivo && setEstado((e) => ({ ...e, cargando: false, error: 'No pudimos abrir tu cajón. Probá recargar la página.' }));
    iniciarSesion()
      .then((uid) => {
        if (!vivo) return;
        setEstado((e) => ({ ...e, uid }));
        const listo = () => (listos += 1) >= 2 && setEstado((e) => ({ ...e, cargando: false }));
        cortes.push(
          escucharAlbums(uid, (datos) => { setEstado((e) => ({ ...e, albums: datos.map(normalizar) })); listo(); }, fallo),
          escucharPlaylists(uid, (playlists) => { setEstado((e) => ({ ...e, playlists })); listo(); }, fallo),
        );
      })
      .catch(fallo);
    return () => {
      vivo = false;
      cortes.forEach((c) => c());
    };
  }, []);

  return estado;
}
