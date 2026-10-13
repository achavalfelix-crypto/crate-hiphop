import { useEffect, useState } from 'react';

// Botón "Instalar la app": en Android/Chrome usa el aviso del navegador;
// en iPhone explica cómo agregarla a la pantalla de inicio.
export default function Instalar() {
  const [aviso, setAviso] = useState(null);
  const [instalada, setInstalada] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true,
  );
  const esIphone = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const guardar = (e) => {
      e.preventDefault();
      setAviso(e);
    };
    const listo = () => setInstalada(true);
    window.addEventListener('beforeinstallprompt', guardar);
    window.addEventListener('appinstalled', listo);
    return () => {
      window.removeEventListener('beforeinstallprompt', guardar);
      window.removeEventListener('appinstalled', listo);
    };
  }, []);

  if (instalada) return null;
  if (aviso) {
    return (
      <p className="instalar">
        <button
          type="button"
          className="btn btn-primario"
          onClick={async () => {
            aviso.prompt();
            await aviso.userChoice;
            setAviso(null);
          }}
        >
          Instalar la app en tu celu
        </button>
      </p>
    );
  }
  if (esIphone) {
    return (
      <p className="instalar">
        Para tenerla como app: tocá Compartir y después “Agregar a inicio”.
      </p>
    );
  }
  return null;
}
