import { useState } from 'react';

// Estado vacío: invita a cargar el catálogo inicial o a agregar un disco a mano.
export default function CajonVacio({ cantidad, onCargarCatalogo, onAgregarAMano }) {
  const [cargando, setCargando] = useState(false);

  return (
    <div className="cajon-vacio">
      <p className="cajon-vacio-titulo">Tu cajón está vacío.</p>
      <p>
        Empezá con {cantidad} discos clave del género, de Schoolly D a Vince Staples, o agregá los tuyos
        uno por uno.
      </p>
      <div className="cajon-vacio-acciones">
        <button
          type="button"
          className="btn btn-primario"
          disabled={cargando}
          onClick={async () => {
            setCargando(true);
            await onCargarCatalogo();
            setCargando(false);
          }}
        >
          {cargando ? 'Cargando discos…' : `Cargar ${cantidad} clásicos`}
        </button>
        <button type="button" className="btn" onClick={onAgregarAMano}>
          Agregar un disco a mano
        </button>
      </div>
    </div>
  );
}
