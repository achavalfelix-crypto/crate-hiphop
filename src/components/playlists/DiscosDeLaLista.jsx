import { albumPorTitulo } from '../../data/archivo';
import { link } from '../../hooks/useRuta';
import { reproducir } from '../../services/reproductor';
import { albumSpotify } from '../../services/spotify';
import ImagenWiki from '../ImagenWiki';
import Portada from '../Portada';

// "Los discos de esta playlist": cada canción viene de un disco, y acá se invita a escucharlo entero.
export default function DiscosDeLaLista({ canciones }) {
  const discos = [];
  const vistos = new Set();
  for (const c of canciones) {
    if (!c.disco || vistos.has(c.disco)) continue;
    vistos.add(c.disco);
    discos.push({ titulo: c.disco, artista: c.artista, anio: c.anio, costa: c.costa, temas: canciones.filter((x) => x.disco === c.disco).length });
  }
  if (!discos.length) return null;

  async function escucharDisco(d) {
    const sp = await albumSpotify(d.titulo, d.artista, d.anio).catch(() => null);
    if (sp) reproducir({ fuente: 'spotify', tipo: 'album', id: sp.id, titulo: d.titulo, artista: d.artista });
  }

  return (
    <section className="discos-lista" aria-labelledby="t-discos-lista">
      <h2 id="t-discos-lista">Los discos detrás de esta playlist</h2>
      <p className="nota-fuente">Si un tema te gustó, el disco entero te está esperando.</p>
      <ul>
        {discos.map((d) => {
          const arch = albumPorTitulo(d.titulo);
          return (
            <li key={d.titulo}>
              {arch ? (
                <a href={link('albumes', arch.id)} className="dl-tapa">
                  <ImagenWiki wiki={arch.wiki} alt="" respaldo={{ title: d.titulo, coast: d.costa, year: d.anio }} />
                </a>
              ) : (
                <span className="dl-tapa">
                  <Portada album={{ title: d.titulo, coast: d.costa, year: d.anio, type: 'album' }} />
                </span>
              )}
              <strong>{d.titulo}</strong>
              <span>
                {d.artista} · {d.temas} {d.temas === 1 ? 'tema' : 'temas'} acá
              </span>
              <span className="dl-acciones">
                <button type="button" className="btn-play btn-play-chico" onClick={() => escucharDisco(d)} aria-label={`Escuchar el disco ${d.titulo} entero`}>
                  ▶
                </button>
                {arch && <a href={link('albumes', arch.id)}>Ver el disco</a>}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
