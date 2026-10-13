import { link } from '../hooks/useRuta';

export const NOMBRE = 'The Golden Era Archives';

const SECCIONES = [
  { id: '', nombre: 'Inicio' },
  { id: 'artistas', nombre: 'Artistas' },
  { id: 'albumes', nombre: 'Álbumes' },
  { id: 'historia', nombre: 'Historia' },
  { id: 'cajon', nombre: 'Mi cajón' },
];

// Barra fija: la sección donde está la persona queda marcada en dorado.
export default function Nav({ seccion }) {
  return (
    <header className="nav">
      <div className="nav-interior">
        <a className="nav-logo" href={link()} aria-label={`${NOMBRE}, inicio`}>
          {NOMBRE}
        </a>
        <nav aria-label="Secciones">
          <ul className="nav-links">
            {SECCIONES.map((s) => {
              const activa = seccion === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={s.id ? link(s.id) : link()}
                    className={activa ? 'activa' : ''}
                    aria-current={activa ? 'page' : undefined}
                  >
                    {s.nombre}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

// Migas de pan: "Artistas › Nas", con el último paso marcado.
export function Migas({ pasos }) {
  return (
    <nav className="migas" aria-label="Estás en">
      {pasos.map((p, i) => {
        const ultimo = i === pasos.length - 1;
        return (
          <span key={p.nombre}>
            {ultimo ? (
              <span className="migas-actual" aria-current="page">
                {p.nombre}
              </span>
            ) : (
              <a href={p.href}>{p.nombre}</a>
            )}
            {!ultimo && <span className="migas-sep"> › </span>}
          </span>
        );
      })}
    </nav>
  );
}
