import { useState } from 'react';
import { albumPorTitulo, autorDe } from '../data/archivo';
import { link } from '../hooks/useRuta';
import { buscarDiscosSpotify } from '../services/spotify';

// Buscador de cualquier disco en Spotify.
export default function BuscarDiscos() {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('inicio'); // inicio | buscando | listo | vacio | error
  const [discos, setDiscos] = useState([]);

  async function buscar(e) {
    e.preventDefault();
    const t = q.trim();
    if (t.length < 2) return;
    setEstado('buscando');
    try {
      const r = (await buscarDiscosSpotify(t)) ?? [];
      setDiscos(r);
      setEstado(r.length ? 'listo' : 'vacio');
    } catch {
      setEstado('error');
    }
  }

  return (
    <section className="buscar-discos" aria-labelledby="t-buscar-discos">
      <h2 id="t-buscar-discos">Buscá cualquier disco</h2>
      <p className="nota-fuente">Más allá de los clásicos del archivo: cualquier disco que esté en Spotify, con todas sus canciones.</p>
      <form className="nueva-playlist" onSubmit={buscar} role="search">
        <input
          type="search"
          aria-label="Buscar disco o artista en Spotify"
          placeholder="Disco o artista (ej. Mobb Deep, Aquemini)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn btn-primario" disabled={q.trim().length < 2 || estado === 'buscando'}>
          {estado === 'buscando' ? 'Buscando…' : 'Buscar'}
        </button>
      </form>
      {estado === 'vacio' && <p className="vacio-chico">No encontramos discos con esa búsqueda.</p>}
      {estado === 'error' && <p className="vacio-chico">No pudimos conectar con Spotify. Probá de nuevo.</p>}
      {estado === 'listo' && (
        <ul className="grilla-discos">
          {discos.map((x) => {
            const n = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
            const posible = albumPorTitulo(x.nombre);
            const arch = posible && n(x.artista).includes(n(autorDe(posible)).slice(0, 6)) ? posible : undefined;
            return (
              <li key={x.id}>
                <a href={arch ? link('albumes', arch.id) : link('albumes', 'sp', x.id)}>
                  {x.tapa ? <img className="imagen-wiki" src={x.tapa} alt="" loading="lazy" /> : <span className="imagen-wiki imagen-respaldo" />}
                  <span className="grilla-titulo">{arch ? '★ ' : ''}{x.nombre}</span>
                  <span className="grilla-anio">{x.artista}{x.anio ? ` · ${x.anio}` : ''}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
