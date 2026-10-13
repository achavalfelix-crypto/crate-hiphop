import { useMemo, useState } from 'react';
import ConexionSpotify from '../components/ConexionSpotify';
import { Migas } from '../components/Nav';
import ListaCanciones from '../components/playlists/ListaCanciones';
import TabsCajon from '../components/playlists/TabsCajon';
import { sugerencias } from '../data/sugerencias';
import useCajon from '../hooks/useCajon';
import useCancionesCajon from '../hooks/useCancionesCajon';
import { link } from '../hooks/useRuta';
import { crearPlaylist } from '../services/playlists';
import { reproducirCola } from '../services/reproductor';

function Sugerencia({ s, onGuardar, onMezclar, guardando }) {
  return (
    <article className="sugerencia">
      <header>
        <h3>{s.nombre}</h3>
        <p>{s.descripcion}</p>
        <p className="nota-fuente">{s.canciones.length} canciones</p>
      </header>
      <ListaCanciones nombre={s.nombre} canciones={s.canciones} limite={4} />
      <div className="sugerencia-acciones">
        <button type="button" className="btn-play" onClick={() => reproducirCola(s.nombre, s.canciones)}>
          <span aria-hidden="true">▶</span> <span>Escuchar</span>
        </button>
        <button type="button" className="btn" onClick={() => onGuardar(s)} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar como playlist'}
        </button>
        {s.id === 'un-tema' && (
          <button type="button" className="btn-texto" onClick={onMezclar}>
            Otra mezcla
          </button>
        )}
      </div>
    </article>
  );
}

export default function Playlists() {
  const { uid, albums, playlists, cargando, error } = useCajon();
  const { canciones, completando } = useCancionesCajon(albums);
  const [semilla, setSemilla] = useState(1);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState('');
  const [aviso, setAviso] = useState('');
  const sugeridas = useMemo(() => sugerencias(canciones, semilla), [canciones, semilla]);

  async function crear(datos, clave) {
    setGuardando(clave);
    setAviso('');
    try {
      const id = await crearPlaylist(uid, datos);
      window.location.hash = link('cajon', 'playlists', id);
    } catch {
      setAviso('No se pudo guardar la playlist. Probá de nuevo.');
    } finally {
      setGuardando('');
    }
  }

  return (
    <div className="pagina">
      <Migas pasos={[{ nombre: 'Inicio', href: link() }, { nombre: 'Mi cajón', href: link('cajon') }, { nombre: 'Playlists' }]} />
      <header className="encabezado-seccion">
        <h1 className="titulo-seccion">Playlists</h1>
        <p>Armá tus playlists con lo que tenés en el cajón, o arrancá con las que te proponemos. Cada tema te lleva a su disco.</p>
      </header>
      <TabsCajon activa="playlists" />
      <ConexionSpotify />

      {aviso && <p className="error" role="alert">{aviso}</p>}
      {cargando ? (
        <p className="cargando" role="status">Abriendo tus playlists…</p>
      ) : error ? (
        <p className="error-carga" role="alert">{error}</p>
      ) : (
        <>
          <section className="bloque-playlists" aria-labelledby="t-tuyas">
            <h2 id="t-tuyas">Tus playlists</h2>
            <form
              className="nueva-playlist"
              onSubmit={(e) => {
                e.preventDefault();
                if (nombre.trim()) crear({ nombre }, 'nueva');
              }}
            >
              <input
                aria-label="Nombre de la nueva playlist"
                placeholder="Nombre de una playlist nueva"
                value={nombre}
                maxLength={60}
                onChange={(e) => setNombre(e.target.value)}
              />
              <button className="btn btn-primario" disabled={!nombre.trim() || guardando === 'nueva'}>
                {guardando === 'nueva' ? 'Creando…' : 'Crear'}
              </button>
            </form>
            {playlists.length === 0 ? (
              <p className="vacio-chico">Todavía no armaste ninguna. Creá una arriba o guardá una de las sugeridas.</p>
            ) : (
              <ul className="mis-playlists">
                {playlists.map((p) => {
                  const costas = [...new Set(p.canciones.map((c) => c.costa))].filter(Boolean);
                  return (
                    <li key={p.id}>
                      <a href={link('cajon', 'playlists', p.id)}>
                        <strong>{p.nombre}</strong>
                        <span>
                          {costas.map((c) => (
                            <span key={c} className={`muestra costa-${c}`} />
                          ))}{' '}
                          {p.canciones.length} {p.canciones.length === 1 ? 'canción' : 'canciones'}
                        </span>
                      </a>
                      {p.canciones.length > 0 && (
                        <button
                          type="button"
                          className="btn-play btn-play-chico"
                          onClick={() => reproducirCola(p.nombre, p.canciones)}
                          aria-label={`Escuchar ${p.nombre}`}
                        >
                          ▶
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="bloque-playlists" aria-labelledby="t-sugeridas">
            <h2 id="t-sugeridas">Sugeridas para vos</h2>
            {completando && <p className="cargando">Trayendo las canciones de tus discos desde Spotify…</p>}
            {sugeridas.length === 0 ? (
              <p className="vacio-chico">
                Para recibir sugerencias, sumá discos o canciones a tu cajón. Probá con{' '}
                <a href={link('cajon')}>los 23 clásicos</a> o agregá discos desde <a href={link('albumes')}>Álbumes</a>.
              </p>
            ) : (
              <div className="grilla-sugerencias">
                {sugeridas.map((s) => (
                  <Sugerencia
                    key={s.id}
                    s={s}
                    guardando={guardando === s.id}
                    onGuardar={(x) => crear({ nombre: x.nombre, descripcion: x.descripcion, canciones: x.canciones }, x.id)}
                    onMezclar={() => setSemilla((n) => n + 1)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
