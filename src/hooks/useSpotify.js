import { useEffect, useState } from 'react';

// Ejecuta un pedido a Spotify y devuelve { estado: 'cargando' | 'listo' | 'vacio' | 'error', datos }.
// `pedido` es una función; `clave` cambia cuando hay que volver a pedir.
export default function useSpotify(pedido, clave) {
  const [r, setR] = useState({ clave: null, estado: 'cargando', datos: null });

  useEffect(() => {
    if (!clave) return;
    let vivo = true;
    pedido()
      .then((datos) => vivo && setR({ clave, estado: datos ? 'listo' : 'vacio', datos }))
      .catch(() => vivo && setR({ clave, estado: 'error', datos: null }));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return r.clave === clave ? r : { estado: 'cargando', datos: null };
}
