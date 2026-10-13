import { ERA_DESDE, ERA_HASTA, nombreEstado } from '../data/constantes';

// Cada disco o canción es una barrita apilada sobre su año, del color de su costa.
// Cuanto más llena, más escuchado (escuchado = llena, escuchando = media, por escuchar = tenue).
// Va de 1980 a 2016 y se estira si hay discos de antes o de después.
export default function LineaDeTiempo({ albums, anioActivo, onElegirAnio }) {
  const anios = albums.map((a) => a.year).filter(Boolean);
  const desde = Math.min(ERA_DESDE, ...anios);
  const hasta = Math.max(ERA_HASTA, ...anios);
  const ANIOS = Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);
  const porAnio = {};
  albums.forEach((a) => (porAnio[a.year] ??= []).push(a));
  const columnas = { gridTemplateColumns: `repeat(${ANIOS.length}, minmax(0, 1fr))` };
  const marcas = ANIOS.filter((a) => a === desde || a === hasta || (a % 5 === 0 && a - desde >= 3 && hasta - a >= 3));

  return (
    <div className="linea">
      <div className="linea-columnas" style={columnas}>
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
              aria-label={`${anio}: ${lista.length} ${lista.length === 1 ? 'entrada' : 'entradas'}`}
              title={lista.length ? `${anio}\n${lista.map((a) => `${a.title} (${nombreEstado(a.status)})`).join('\n')}` : `${anio}`}
              onClick={() => onElegirAnio(activo ? null : anio)}
            >
              {lista.map((a) => (
                <span key={a.id} className={`bloque costa-${a.coast} estado-${a.status} tipo-${a.type}`} />
              ))}
            </button>
          );
        })}
      </div>
      <div className="linea-eje" aria-hidden="true" style={columnas}>
        {marcas.map((a) => (
          <span key={a} style={{ gridColumn: a - desde + 1 }}>
            {a === desde || a === hasta || a === 2000 ? a : `’${String(a).slice(2)}`}
          </span>
        ))}
      </div>
    </div>
  );
}
