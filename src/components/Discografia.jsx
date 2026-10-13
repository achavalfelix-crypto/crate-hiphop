import { albumPorTitulo } from '../data/archivo';
import useSpotify from '../hooks/useSpotify';
import { link } from '../hooks/useRuta';
import { discografiaSpotify } from '../services/spotify';

// Todos los discos de un artista según Spotify. Los que están en el archivo llevan a su ficha completa.
export default function Discografia({ nombre }) {
  const { estado, datos } = useSpotify(() => discografiaSpotify(nombre), nombre);
  if (estado === 'cargando') return <p className="cargando">Trayendo la discografía de Spotify…</p>;
  if (estado !== 'listo' || !datos.discos.length) return null;
  return (
    <section className="relacionados" aria-labelledby="t-discografia">
      <h2 id="t-discografia">Discografía completa</h2>
      <p className="nota-fuente">{datos.discos.length} discos en Spotify. Los marcados con ★ tienen ficha completa en el archivo.</p>
      <ul className="grilla-discos">
        {datos.discos.map((x) => {
          const arch = albumPorTitulo(x.nombre);
          return (
            <li key={x.id}>
              <a href={arch ? link('albumes', arch.id) : link('albumes', 'sp', x.id)}>
                {x.tapa ? <img className="imagen-wiki" src={x.tapa} alt="" loading="lazy" /> : <span className="imagen-wiki imagen-respaldo" />}
                <span className="grilla-titulo">{arch ? '★ ' : ''}{x.nombre}</span>
                <span className="grilla-anio">{x.anio || ''}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
