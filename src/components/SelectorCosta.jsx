import { COSTAS } from '../data/constantes';

// Selector "de qué parte son": todas las costas o una sola.
export default function SelectorCosta({ valor, onCambiar, conteo, total }) {
  const opciones = [{ id: '', nombre: 'Todas' }, ...COSTAS];
  return (
    <aside className="selector-costa" aria-label="Filtrar por costa">
      <p className="selector-titulo">¿De qué parte son?</p>
      <ul>
        {opciones.map((o) => {
          const activo = valor === o.id;
          return (
            <li key={o.id || 'todas'}>
              <button
                type="button"
                className={activo ? 'activo' : ''}
                aria-pressed={activo}
                onClick={() => onCambiar(o.id)}
              >
                {o.id && <span className={`muestra costa-${o.id}`} />}
                {o.nombre}
                <span className="chip-num">{o.id ? (conteo[o.id] ?? 0) : total}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
