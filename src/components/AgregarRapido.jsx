import { useEffect, useState } from 'react';
import { artistaPorNombre } from '../data/archivo';
import { COSTAS } from '../data/constantes';
import { buscarCancionesSpotify, buscarDiscosSpotify, discoSpotify } from '../services/spotify';

// Agregar al cajón sin escribir: buscás, tocás y listo.
// Título, artista, año y canciones vienen de Spotify. La costa sale del archivo si el artista está;
// si no, se pregunta con un toque (no la inventamos).
export default function AgregarRapido({ onAgregar, onAMano, yaEsta, extra }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState({ estado: 'inicio', discos: [], canciones: [] });
  const [eligiendo, setEligiendo] = useState(null); // { item, tipo } esperando la costa
  const [guardando, setGuardando] = useState('');

  // Busca mientras escribís (espera 400 ms a que termines).
  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) return;
    let vivo = true;
    const id = setTimeout(async () => {
      setRes((r) => ({ ...r, estado: 'buscando' }));
      try {
        const [discos, canciones] = await Promise.all([
          buscarDiscosSpotify(t).catch(() => []),
          buscarCancionesSpotify(t).catch(() => []),
        ]);
        if (vivo) setRes({ estado: 'listo', discos: (discos ?? []).slice(0, 8), canciones: (canciones ?? []).slice(0, 8) });
      } catch {
        if (vivo) setRes({ estado: 'error', discos: [], canciones: [] });
      }
    }, 400);
    return () => {
      vivo = false;
      clearTimeout(id);
    };
  }, [q]);

  async function guardar(item, tipo, costa) {
    setEligiendo(null);
    setGuardando(item.id);
    try {
      if (tipo === 'album') {
        const d = await discoSpotify(item.id);
        await onAgregar({
          type: 'album', album: '', videoId: '', spotifyId: d.id, favorita: false,
          title: d.nombre.slice(0, 120), artist: d.artistas.map((a) => a.nombre).join(', ').slice(0, 80),
          year: d.anio || 1980, coast: costa,
          tracks: d.canciones.slice(0, 60).map((c) => ({ id: crypto.randomUUID(), title: c.nombre.slice(0, 120), fav: false, spotifyId: c.id })),
        });
      } else {
        await onAgregar({
          type: 'cancion', album: item.disco.slice(0, 120), videoId: '', spotifyId: item.id, favorita: false,
          title: item.nombre.slice(0, 120), artist: item.artista.slice(0, 80), year: item.anio || 1980, coast: costa, tracks: [],
        });
      }
    } finally {
      setGuardando('');
    }
  }

  function elegir(item, tipo) {
    const principal = tipo === 'album' ? item.artista.split(',')[0] : item.artistaPrincipal;
    const conocido = artistaPorNombre(principal);
    if (conocido) guardar(item, tipo, conocido.costa);
    else setEligiendo({ item, tipo, artista: principal });
  }

  const Fila = ({ item, tipo }) => {
    const esta = yaEsta(item, tipo);
    return (
      <li>
        {item.tapa ? <img src={item.tapa} alt="" loading="lazy" /> : <span className="ar-sin-tapa" />}
        <span className="ar-datos">
          <strong>{item.nombre}</strong>
          <small>
            {item.artista}
            {tipo === 'cancion' && item.disco ? ` · ${item.disco}` : ''}
            {item.anio ? ` · ${item.anio}` : ''}
          </small>
        </span>
        {esta ? (
          <span className="ar-ya">En tu cajón</span>
        ) : (
          <button
            type="button"
            className="btn-play btn-play-chico"
            disabled={guardando === item.id}
            onClick={() => elegir(item, tipo)}
            aria-label={`Agregar ${item.nombre} al cajón`}
          >
            {guardando === item.id ? '…' : '+'}
          </button>
        )}
      </li>
    );
  };

  return (
    <section className="agregar-rapido" aria-labelledby="t-agregar-rapido">
      <h2 id="t-agregar-rapido">Sumá a tu cajón</h2>
      <input
        type="search"
        className="buscador"
        aria-label="Buscar disco o canción en Spotify"
        placeholder="Buscá un disco o una canción (ej. Illmatic, Gin and Juice)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {eligiendo && (
        <div className="ar-costa" role="dialog" aria-label="Elegir costa">
          <p>
            <strong>{eligiendo.artista}</strong> no está en el archivo. ¿De qué parte es?
          </p>
          <div className="ar-costa-botones">
            {COSTAS.map((c) => (
              <button key={c.id} type="button" className="chip" onClick={() => guardar(eligiendo.item, eligiendo.tipo, c.id)}>
                <span className={`muestra costa-${c.id}`} /> {c.nombre}
              </button>
            ))}
            <button type="button" className="btn-texto" onClick={() => setEligiendo(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {q.trim().length >= 2 && res.estado === 'buscando' && <p className="cargando">Buscando en Spotify…</p>}
      {res.estado === 'error' && <p className="vacio-chico">No pudimos conectar con Spotify. Probá de nuevo.</p>}
      {q.trim().length >= 2 && res.estado === 'listo' && (
        <div className="ar-resultados">
          <div>
            <h3>Discos</h3>
            {res.discos.length ? <ul>{res.discos.map((d) => <Fila key={d.id} item={d} tipo="album" />)}</ul> : <p className="vacio-chico">Sin discos.</p>}
          </div>
          <div>
            <h3>Canciones</h3>
            {res.canciones.length ? <ul>{res.canciones.map((c) => <Fila key={c.id} item={c} tipo="cancion" />)}</ul> : <p className="vacio-chico">Sin canciones.</p>}
          </div>
        </div>
      )}
      <p className="ar-pie">
        ¿No está en Spotify?{' '}
        <button type="button" className="btn-texto" onClick={onAMano}>
          Agregalo a mano
        </button>
        {extra && <> · {extra}</>}
      </p>
    </section>
  );
}
