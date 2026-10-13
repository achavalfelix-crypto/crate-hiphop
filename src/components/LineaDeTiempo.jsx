import { ANIO_MAX, ANIO_MIN, nombreEstado } from '../data/constantes';

const ANIOS = Array.from({ length: ANIO_MAX - ANIO_MIN + 1 }, (_, i) => ANIO_MIN + i);

// Cada disco es un bloque apilado sobre su año.
// Color = costa. Relleno = escuchado, rayado = escuchando, contorno = por escuchar.
export default function LineaDeTiempo({ albums, anioActivo, onElegirAnio }) {
  const porAnio = {};
  albums.forEach((a) => (porAnio[a.year] ??= []).push(a));

  return (
    <div className="linea">
      <div className="linea-columnas">
        {ANIOS.map((anio) => {
          const lista = porAnio[anio] ?? [];
          const activo = anioActivo === anio;
          return (
            <button
              key={anio}
              type="button"
              className={`linea-anio ${activo ? 'activo' : ''}`}
              disabled={lista.length === 0}
              aria-pressed={activo}
              aria-label={`${anio}: ${lista.length} ${lista.length === 1 ? 'disco' : 'discos'}`}
              title={lista.length ? `${anio}\n${lista.map((a) => `${a.title} (${nombreEstado(a.status)})`).join('\n')}` : `${anio}`}
              onClick={() => onElegirAnio(activo ? null : anio)}
            >
              {lista.map((a) => (
                <span key={a.id} className={`bloque costa-${a.coast} estado-${a.status}`} />
              ))}
            </button>
          );
        })}
      </div>
      <div className="linea-eje" aria-hidden="true">
        {ANIOS.filter((a) => a % 4 === 0).map((a) => (
          <span key={a} className={a === ANIO_MAX ? 'eje-fin' : ''} style={{ gridColumn: a - ANIO_MIN + 1 }}>
            {a === ANIO_MIN || a === ANIO_MAX || a === 2000 ? a : `’${String(a).slice(2)}`}
          </span>
        ))}
      </div>
    </div>
  );
}
