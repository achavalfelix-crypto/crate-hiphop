import { useEffect, useState } from 'react';
import { datosWiki } from '../services/wiki';

// Trae los datos de Wikipedia de un artículo. estado: 'cargando' | 'listo' | 'error'
export default function useWiki(titulo) {
  const [r, setR] = useState({ estado: 'cargando', datos: null, titulo });

  useEffect(() => {
    if (!titulo) return;
    let vivo = true;
    datosWiki(titulo)
      .then((datos) => vivo && setR({ estado: 'listo', datos, titulo }))
      .catch(() => vivo && setR({ estado: 'error', datos: null, titulo }));
    return () => {
      vivo = false;
    };
  }, [titulo]);

  // Mientras llega el pedido de un título nuevo, no mostrar los datos del anterior.
  return r.titulo === titulo ? r : { estado: 'cargando', datos: null, titulo };
}
