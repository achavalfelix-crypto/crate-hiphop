import { useEffect, useState } from 'react';

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
      setPartes(leer());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', cambio);
    return () => window.removeEventListener('hashchange', cambio);
  }, []);

  return partes;
}

export const link = (...partes) => `#/${partes.map(encodeURIComponent).join('/')}`;
