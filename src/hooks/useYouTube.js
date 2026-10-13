import { useEffect, useState } from 'react';
import { pedirDatos, youtubeConfigurado } from '../services/youtube';

const CADA = 60_000; // se actualiza cada minuto mientras la pestaña está visible

// Devuelve { datos: { [videoId]: { duracion, vistas } }, actualizado: Date | null, error }
export default function useYouTube(ids) {
  const [estado, setEstado] = useState({ datos: {}, actualizado: null, error: null });
  const clave = [...new Set(ids)].sort().join(',');

  useEffect(() => {
    if (!youtubeConfigurado || !clave) return;
    let cancelado = false;
    const lista = clave.split(',');

    async function cargar() {
      if (document.hidden) return;
      try {
        const datos = await pedirDatos(lista);
        if (!cancelado) setEstado({ datos, actualizado: new Date(), error: null });
      } catch (err) {
        if (!cancelado) setEstado((e) => ({ ...e, error: err.message }));
      }
    }

    cargar();
    const intervalo = setInterval(cargar, CADA);
    document.addEventListener('visibilitychange', cargar);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', cargar);
    };
  }, [clave]);

  return estado;
}
