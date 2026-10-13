import ImagenWiki from '../components/ImagenWiki';
import { Migas } from '../components/Nav';
import { HISTORIA, albumPorId, artistaPorId } from '../data/archivo';
import { link } from '../hooks/useRuta';

export default function Historia() {
  return (
    <div className="pagina">
      <Migas pasos={[{ nombre: 'Inicio', href: link() }, { nombre: 'Historia' }]} />
      <header className="encabezado-seccion">
        <h1 className="titulo-seccion">Historia</h1>
        <p>Treinta años en trece momentos: cómo el rap que salió de la calle llegó a ganar un Pulitzer.</p>
      </header>
      <ol className="historia">
        {HISTORIA.map((h) => {
          const disco = h.album && albumPorId(h.album);
          const artista = h.artista && artistaPorId(h.artista);
          const destino = disco ? link('albumes', disco.id) : link('artistas', artista.id);
          const wiki = disco ? disco.wiki : artista.wiki;
          return (
            <li key={h.anio + h.titulo} className="hito">
              <span className="hito-anio">{h.anio}</span>
              <div className="hito-cuerpo">
                <h2>{h.titulo}</h2>
                <p>{h.texto}</p>
                <p className="hito-links">
                  <a href={destino}>{disco ? `Ver ${disco.titulo}` : `Ver ${artista.nombre}`}</a>
                  {' · '}
                  <a href={h.fuente} target="_blank" rel="noreferrer">
                    Fuente
                  </a>
                </p>
              </div>
              <a className="hito-imagen" href={destino} tabIndex={-1} aria-hidden="true">
                <ImagenWiki
                  wiki={wiki}
                  alt=""
                  respaldo={{ title: disco ? disco.titulo : artista.nombre, coast: (disco ?? artista).costa, year: h.anio }}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
