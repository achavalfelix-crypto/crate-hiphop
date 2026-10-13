import { COSTAS, ESTADOS } from '../data/constantes';

// Buscador + costas (que también funcionan como leyenda de colores) + estado.
export default function Filtros({ filtros, onCambiar, conteoCostas }) {
  const set = (campo, valor) => onCambiar({ ...filtros, [campo]: valor });

  return (
    <div className="filtros">
      <input
        type="search"
        className="buscador"
        aria-label="Buscar por disco, artista o canción"
        placeholder="Buscar disco, artista o canción"
        value={filtros.texto}
        onChange={(e) => set('texto', e.target.value)}
      />

      <div className="chips" role="group" aria-label="Filtrar por costa">
        {COSTAS.map((c) => {
          const activo = filtros.costa === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`chip ${activo ? 'activo' : ''}`}
              aria-pressed={activo}
              onClick={() => set('costa', activo ? '' : c.id)}
            >
              <span className={`muestra costa-${c.id}`} />
              {c.nombre}
              <span className="chip-num">{conteoCostas[c.id] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div className="segmentado" role="group" aria-label="Filtrar por estado">
        <button type="button" aria-pressed={!filtros.estado} onClick={() => set('estado', '')}>
          Todos
        </button>
        {ESTADOS.map((e) => (
          <button
            key={e.id}
            type="button"
            aria-pressed={filtros.estado === e.id}
            onClick={() => set('estado', e.id)}
          >
            {e.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
