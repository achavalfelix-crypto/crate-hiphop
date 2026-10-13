import { useMemo, useState } from 'react';
import { Migas } from '../components/Nav';
import DiscosDeLaLista from '../components/playlists/DiscosDeLaLista';
import ListaCanciones from '../components/playlists/ListaCanciones';
import TabsCajon from '../components/playlists/TabsCajon';
import { mezclar, separar } from '../data/sugerencias';
import useCajon from '../hooks/useCajon';
import useCancionesCajon from '../hooks/useCancionesCajon';
import { link } from '../hooks/useRuta';
import { actualizarPlaylist, crearPlaylist, eliminarPlaylist, MAX_CANCIONES } from '../services/playlists';
import { reproducirCola } from '../services/reproductor';

// Buscador para sumar canciones del cajón a la playlist.
function AgregarCanciones({ disponibles, onAgregar, lleno }) {
  const [q, setQ] = useState('');
  const t = q.trim().toLowerCase();
  const resultados = (t
    ? disponibles.filter((c) => `${c.titulo} ${c.artista} ${c.disco}`.toLowerCase().includes(t))
    : disponibles
  ).slice(0, 12);

  return (
    <section className="agregar-canciones" aria-labelledby="t-agregar">
      <h2 id="t-agregar">Agregar canciones de tu cajón</h2>
      <input
        type="search"
        className="buscador"
        placeholder="Buscar canción, artista o disco"
        aria-label="Buscar canción para agregar"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {lleno ? (
        <p className="vacio-chico">La playlist llegó al máximo de {MAX_CANCIONES} canciones.</p>
      ) : resultados.length === 0 ? (
        <p className="vacio-chico">{disponibles.length ? 'No hay coincidencias.' : 'Ya están todas las canciones de tu cajón.'}</p>
      ) : (
        <ul className="resultados-agregar">
          {resultados.map((c) => (
            <li key={c.clave}>
              <span>
                <strong>{c.titulo}</strong> <small>{c.artista}{c.disco ? ` · ${c.disco}` : ''}</small>
              </span>
              <button type="button" className="btn-play btn-play-chico" onClick={() => onAgregar(c)} aria-label={`Agregar ${c.titulo}`}>
                +
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Playlist({ id }) {
  const { uid, albums, playlists, cargando } = useCajon();
  const { canciones: pool } = useCancionesCajon(albums);
  const [aviso, setAviso] = useState('');
  const [combinarCon, setCombinarCon] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const p = playlists.find((x) => x.id === id);

  const disponibles = useMemo(() => {
    const ya = new Set((p?.canciones ?? []).map((c) => c.clave));
    return pool.filter((c) => !ya.has(c.clave));
  }, [pool, p]);

  if (cargando) return <div className="pagina"><p className="cargando" role="status">Abriendo la playlist…</p></div>;
  if (!p) {
    return (
      <div className="pagina">
        <p className="vacio">No encontramos esa playlist. <a href={link('cajon', 'playlists')}>Ver tus playlists</a></p>
      </div>
    );
  }

  async function guardar(cambios, mensaje = '') {
    setAviso('');
    try {
      await actualizarPlaylist(uid, p.id, cambios);
      if (mensaje) setAviso(mensaje);
    } catch {
      setAviso('No se pudo guardar el cambio. Probá de nuevo.');
    }
  }

  const lista = p.canciones;
  const mover = (i, d) => {
    const n = [...lista];
    [n[i], n[i + d]] = [n[i + d], n[i]];
    guardar({ canciones: n });
  };
  const quitar = (i) => guardar({ canciones: lista.filter((_, k) => k !== i) });

  async function combinar() {
    const otra = playlists.find((x) => x.id === combinarCon);
    if (!otra) return;
    const antes = lista.length;
    await guardar({ canciones: [...lista, ...otra.canciones] });
    setAviso(`Sumamos los temas de "${otra.nombre}" (las repetidas no se duplican).`);
    setCombinarCon('');
    if (antes + otra.canciones.length > MAX_CANCIONES) setAviso(`Se sumaron hasta llegar al máximo de ${MAX_CANCIONES}.`);
  }

  async function separarPor(criterio) {
    const grupos = separar(lista, criterio);
    if (grupos.length < 2) {
      setAviso(criterio === 'costa' ? 'Todos los temas son de la misma costa.' : 'Todos los temas son de la misma década.');
      return;
    }
    try {
      for (const g of grupos) await crearPlaylist(uid, { nombre: `${p.nombre} · ${g.nombre}`.slice(0, 60), canciones: g.canciones });
      setAviso(`Listo: ${grupos.length} playlists nuevas en "Tus playlists". Esta queda igual.`);
    } catch {
      setAviso('No se pudieron crear las playlists. Probá de nuevo.');
    }
  }

  async function borrar() {
    try {
      await eliminarPlaylist(uid, p.id);
      window.location.hash = link('cajon', 'playlists');
    } catch {
      setAviso('No se pudo eliminar. Probá de nuevo.');
    }
  }

  const otras = playlists.filter((x) => x.id !== p.id && x.canciones.length);
  const minutos = lista.length ? `${lista.length} ${lista.length === 1 ? 'canción' : 'canciones'}` : 'Vacía';

  return (
    <div className="pagina">
      <Migas
        pasos={[
          { nombre: 'Inicio', href: link() },
          { nombre: 'Mi cajón', href: link('cajon') },
          { nombre: 'Playlists', href: link('cajon', 'playlists') },
          { nombre: p.nombre },
        ]}
      />
      <TabsCajon activa="playlists" />

      <header className="playlist-cabeza">
        <input
          key={p.nombre}
          className="playlist-nombre"
          aria-label="Nombre de la playlist"
          defaultValue={p.nombre}
          maxLength={60}
          onBlur={(e) => e.target.value.trim() && e.target.value !== p.nombre && guardar({ nombre: e.target.value })}
        />
        <textarea
          key={p.descripcion}
          className="playlist-descripcion"
          aria-label="Descripción de la playlist"
          placeholder="Contá de qué va esta playlist (opcional)"
          defaultValue={p.descripcion}
          maxLength={200}
          rows={2}
          onBlur={(e) => e.target.value !== p.descripcion && guardar({ descripcion: e.target.value })}
        />
        <p className="nota-fuente">{minutos}</p>
        <div className="playlist-acciones">
          <button type="button" className="btn btn-primario" disabled={!lista.length} onClick={() => reproducirCola(p.nombre, lista)}>
            ▶ Escuchar
          </button>
          <button type="button" className="btn" disabled={lista.length < 2} onClick={() => reproducirCola(p.nombre, mezclar(lista, Date.now() % 9973))}>
            Escuchar mezclada
          </button>
        </div>
      </header>

      {aviso && <p className="aviso-linea" role="status">{aviso}</p>}

      <div className="playlist-cuerpo">
        <div>
          {lista.length ? (
            <ListaCanciones nombre={p.nombre} canciones={lista} onMover={mover} onQuitar={quitar} />
          ) : (
            <p className="vacio-chico">Todavía no tiene canciones. Sumalas desde el buscador.</p>
          )}
          <DiscosDeLaLista canciones={lista} />
        </div>

        <aside className="playlist-herramientas">
          <AgregarCanciones
            disponibles={disponibles}
            lleno={lista.length >= MAX_CANCIONES}
            onAgregar={(c) => guardar({ canciones: [...lista, c] })}
          />

          <section aria-labelledby="t-combinar">
            <h2 id="t-combinar">Combinar</h2>
            {otras.length ? (
              <div className="fila-herramienta">
                <select aria-label="Playlist para sumar" value={combinarCon} onChange={(e) => setCombinarCon(e.target.value)}>
                  <option value="">Elegí otra playlist…</option>
                  {otras.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nombre} ({x.canciones.length})
                    </option>
                  ))}
                </select>
                <button type="button" className="btn" disabled={!combinarCon} onClick={combinar}>
                  Sumar acá
                </button>
              </div>
            ) : (
              <p className="vacio-chico">Cuando tengas otra playlist, la vas a poder sumar a esta.</p>
            )}
          </section>

          <section aria-labelledby="t-separar">
            <h2 id="t-separar">Separar</h2>
            <p className="nota-fuente">Crea playlists nuevas a partir de esta; la original no se toca.</p>
            <div className="fila-herramienta">
              <button type="button" className="btn" disabled={lista.length < 2} onClick={() => separarPor('costa')}>
                Por costa
              </button>
              <button type="button" className="btn" disabled={lista.length < 2} onClick={() => separarPor('decada')}>
                Por década
              </button>
            </div>
          </section>

          <section aria-labelledby="t-borrar">
            <h2 id="t-borrar">Eliminar</h2>
            {confirmando ? (
              <p className="confirmar">
                ¿Eliminar "{p.nombre}"?{' '}
                <button type="button" className="btn-texto peligro" onClick={borrar}>Sí, eliminar</button>{' '}
                <button type="button" className="btn-texto" onClick={() => setConfirmando(false)}>No</button>
              </p>
            ) : (
              <button type="button" className="btn-texto peligro" onClick={() => setConfirmando(true)}>
                Eliminar esta playlist
              </button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
