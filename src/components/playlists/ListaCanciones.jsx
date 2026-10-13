import { albumPorTitulo } from '../../data/archivo';
import { link } from '../../hooks/useRuta';
import { reproducirCola, useCola, useReproductor } from '../../services/reproductor';

// Lista de canciones de una playlist. Tocar una la hace sonar y sigue con las demás.
// Cada canción lleva a su disco: así la playlist "vende" el álbum.
// Si se pasan onMover / onQuitar, aparecen los controles para ordenar y quitar.
export default function ListaCanciones({ nombre, canciones, onMover, onQuitar, limite }) {
  const pista = useReproductor();
  const cola = useCola();
  const visibles = limite ? canciones.slice(0, limite) : canciones;
  const enEsta = cola?.nombre === nombre;

  return (
    <ol className="lista-canciones">
      {visibles.map((c, i) => {
        const suena = enEsta && cola.indice === i && pista;
        const delArchivo = albumPorTitulo(c.disco);
        return (
          <li key={c.clave} className={suena ? 'sonando' : ''}>
            <button
              type="button"
              className="lc-play"
              onClick={() => reproducirCola(nombre, canciones, i)}
              aria-label={`Escuchar ${c.titulo}`}
            >
              <span aria-hidden="true">{suena ? '♪' : i + 1}</span>
            </button>
            <div className="lc-datos">
              <span className="lc-titulo">{c.titulo}</span>
              <span className="lc-meta">
                <span className={`muestra costa-${c.costa}`} /> {c.artista}
                {c.disco && (
                  <>
                    {' · '}
                    {delArchivo ? (
                      <a href={link('albumes', delArchivo.id)}>{c.disco}</a>
                    ) : (
                      <em>{c.disco}</em>
                    )}
                  </>
                )}
                {c.anio ? ` · ${c.anio}` : ''}
              </span>
            </div>
            {onMover && (
              <span className="lc-controles">
                <button type="button" onClick={() => onMover(i, -1)} disabled={i === 0} aria-label={`Subir ${c.titulo}`}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMover(i, 1)}
                  disabled={i === canciones.length - 1}
                  aria-label={`Bajar ${c.titulo}`}
                >
                  ↓
                </button>
                <button type="button" onClick={() => onQuitar(i)} aria-label={`Quitar ${c.titulo}`}>
                  ×
                </button>
              </span>
            )}
          </li>
        );
      })}
      {limite && canciones.length > limite && <li className="lc-mas">y {canciones.length - limite} más…</li>}
    </ol>
  );
}
