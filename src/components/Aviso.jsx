import { useEffect } from 'react';

// Mensaje de éxito o error que se cierra solo a los 3,5 segundos.
export default function Aviso({ aviso, onCerrar }) {
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(onCerrar, 3500);
    return () => clearTimeout(t);
  }, [aviso, onCerrar]);

  return (
    <div className="aviso-zona" aria-live="polite">
      {aviso && (
        <div className={`aviso aviso-${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
          {aviso.texto}
        </div>
      )}
    </div>
  );
}
