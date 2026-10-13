import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

// Ruteo simple con el hash de la URL: #/artistas/nas → ['artistas', 'nas']
// Con el hash no hace falta configurar nada en Vercel para que funcionen los links.
const leer = () =>
  window.location.hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);

export default function useRuta() {
  const [partes, setPartes] = useState(leer);

  useEffect(() => {
    const cambio = () => {
      const aplicar = () => {
        flushSync(() => setPartes(leer()));
        window.scrollTo(0, 0);
      };
      // Transición animada entre páginas: la foto viaja de la lista a la ficha.
      const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (document.startViewTransition && !quieto) document.startViewTransition(aplicar);
      else aplicar();
    };
    window.addEventListener('hashchange', cambio);
    return () => window.removeEventListener('hashchange', cambio);
  }, []);

  return partes;
}

export const link = (...partes) => `#/${partes.map(encodeURIComponent).join('/')}`;
