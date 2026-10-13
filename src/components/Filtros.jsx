import { COSTAS, ESTADOS } from '../data/constantes';

export default function Filtros({ filtros, onCambiar }) {
  const set = (campo) => (e) => onCambiar({ ...filtros, [campo]: e.target.value });

  return (
    <div className="filtros">
      <label>
        Costa
        <select value={filtros.costa} onChange={set('costa')}>
          <option value="">Todas</option>
          {COSTAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
      <label>
        Estado
        <select value={filtros.estado} onChange={set('estado')}>
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
