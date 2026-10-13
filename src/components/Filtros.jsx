import { COSTAS, ESTADOS, TIPOS } from '../data/constantes';

// Buscador + tipo + costas (que también funcionan como leyenda de colores) + estado.
export default function Filtros({ filtros, onCambiar, conteoCostas, conteoTipos }) {
  const set = (campo, valor) => onCambiar({ ...filtros, [campo]: valor });

  return (
    <div className="filtros">
      <input
        type="search"
        className="buscador"
        aria-label="Buscar por disco, canción o artista"
        placeholder="Buscar disco, canción o artista"
        value={filtros.texto}
        onChange={(e) => set('texto', e.target.value)}
      />

      <div className="segmentado" role="group" aria-label="Filtrar por tipo">
        <button type="button" aria-pressed={!filtros.tipo} onClick={() => set('tipo', '')}>
          Todo
        </button>
        {TIPOS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={filtros.tipo === t.id}
            onClick={() => set('tipo', t.id)}
          >
            {t.plural} <span className="chip-num">{conteoTipos[t.id] ?? 0}</span>
          </button>
        ))}
      </div>

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

      <button
        type="button"
        className={`chip chip-fav ${filtros.favoritas ? 'activo' : ''}`}
        aria-pressed={Boolean(filtros.favoritas)}
        onClick={() => set('favoritas', !filtros.favoritas)}
      >
        ♥ Favoritas
      </button>

      <select
        className="filtro-estado"
        aria-label="Filtrar por estado"
        value={filtros.estado}
        onChange={(e) => set('estado', e.target.value)}
      >
        <option value="">Todos los estados</option>
        {ESTADOS.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
