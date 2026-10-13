import ArtistaSpotify from '../components/ArtistaSpotify';
import Discografia from '../components/Discografia';
import ImagenWiki from '../components/ImagenWiki';
import { Migas } from '../components/Nav';
import { Cita, Dato } from '../components/Recuadros';
import { albumesDe, artistaPorId } from '../data/archivo';
import { nombreCosta } from '../data/constantes';
import useWiki from '../hooks/useWiki';
import { transicion } from '../hooks/foco';
import { link } from '../hooks/useRuta';

export default function Artista({ id }) {
  const a = artistaPorId(id);
  const { estado, datos } = useWiki(a?.wiki);

  if (!a) {
    return (
      <div className="pagina">
        <p className="vacio">No encontramos ese artista. <a href={link('artistas')}>Ver todos los artistas</a></p>
      </div>
    );
  }
  const discos = albumesDe(a.id);

  return (
    <div className="pagina">
      <Migas pasos={[{ nombre: 'Inicio', href: link() }, { nombre: 'Artistas', href: link('artistas') }, { nombre: a.nombre }]} />
      <article className={`detalle costa-${a.costa}`}>
        <div className="detalle-imagen" style={transicion('art', a.id)}>
          <ImagenWiki wiki={a.wiki} alt={`Foto de ${a.nombre}`} grande respaldo={{ title: a.nombre, coast: a.costa, year: '' }} />
        </div>
        <div className="detalle-cuerpo">
          <h1 className="titulo-seccion">{a.nombre}</h1>
          <dl className="datos-tecnicos">
            <div><dt>Costa</dt><dd><span className={`muestra costa-${a.costa}`} /> {nombreCosta(a.costa)}</dd></div>
            <div><dt>{a.grupo ? 'Origen' : 'Nacimiento'}</dt><dd>{a.nacimiento}</dd></div>
            {a.muerte && <div><dt>Murió</dt><dd>{a.muerte}</dd></div>}
            {a.integrantes && <div><dt>Integrantes</dt><dd>{a.integrantes}</dd></div>}
          </dl>

          <section aria-labelledby="t-vida">
            <h2 id="t-vida">Su historia</h2>
            {estado === 'cargando' && <p className="cargando">Cargando biografía…</p>}
            {estado === 'error' && <p>No pudimos traer la biografía ahora. Probá recargar la página.</p>}
            {estado === 'listo' && (
              <>
                <p className="bio">{datos.texto}</p>
                <p className="nota-fuente">
                  Texto de{' '}
                  <a href={datos.url} target="_blank" rel="noreferrer">
                    Wikipedia{datos.idioma === 'en' ? ' (en inglés)' : ''}
                  </a>
                  , licencia CC BY-SA.
                </p>
              </>
            )}
          </section>

          {a.logros.length > 0 && (
            <section aria-labelledby="t-logros">
              <h2 id="t-logros">Premios y logros</h2>
              <ul className="logros">
                {a.logros.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="ficha-pie">
            <Dato texto={a.dato} fuente={a.fuente} />
            <Cita cita={a.cita} />
          </div>

          <section aria-labelledby="t-escuchar">
            <h2 id="t-escuchar">Escuchalo</h2>
            <ArtistaSpotify nombre={a.nombre} />
          </section>
        </div>
      </article>

      {discos.length > 0 && (
        <section className="relacionados" aria-labelledby="t-discos">
          <h2 id="t-discos">Sus discos en el archivo</h2>
          <ul className="grilla-discos">
            {discos.map((d) => (
              <li key={d.id}>
                <a href={link('albumes', d.id)}>
                  <ImagenWiki wiki={d.wiki} alt="" respaldo={{ title: d.titulo, coast: d.costa, year: d.anio }} />
                  <span className="grilla-titulo">{d.titulo}</span>
                  <span className="grilla-anio">{d.anio}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Discografia nombre={a.nombre} />
    </div>
  );
}
