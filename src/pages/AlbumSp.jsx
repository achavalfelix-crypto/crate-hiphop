import AgregarDisco from '../components/AgregarDisco';
import { ListaDisco } from '../components/DiscoSpotify';
import { Migas } from '../components/Nav';
import { albumPorTitulo, artistaPorNombre } from '../data/archivo';
import { nombreCosta } from '../data/constantes';
import useSpotify from '../hooks/useSpotify';
import { link } from '../hooks/useRuta';
import { useReproductor } from '../services/reproductor';
import { discoSpotify } from '../services/spotify';

// Ficha de cualquier disco de Spotify (los que no tienen ficha verificada en el archivo).
export default function AlbumSp({ id }) {
  const { estado, datos } = useSpotify(() => discoSpotify(id), id);
  const pista = useReproductor();

  if (estado === 'cargando') return <div className="pagina"><p className="cargando" role="status">Trayendo el disco de Spotify…</p></div>;
  if (estado !== 'listo') {
    return (
      <div className="pagina">
        <p className="vacio">No pudimos traer este disco. <a href={link('albumes')}>Ver los álbumes</a></p>
      </div>
    );
  }

  const autor = datos.artistas.map((a) => a.nombre).join(', ');
  const delArchivo = artistaPorNombre(datos.artistas[0]?.nombre);
  const costa = delArchivo?.costa ?? 'east';
  const fichaArchivo = albumPorTitulo(datos.nombre);
  const girando = (pista?.fuente === 'spotify' || pista?.fuente === 'app') && (pista.id === datos.id || datos.canciones.some((c) => c.id === pista.id));
  const disco = { id: datos.id, titulo: datos.nombre, anio: datos.anio, costa };
  const total = datos.canciones.reduce((s, c) => s + c.duracion, 0);

  return (
    <div className="pagina">
      <Migas pasos={[{ nombre: 'Inicio', href: link() }, { nombre: 'Álbumes', href: link('albumes') }, { nombre: datos.nombre }]} />
      <article className={`detalle costa-${costa}`}>
        <div className="detalle-imagen">
          <div className="funda">
            <span className={`vinilo ${girando ? 'girando' : ''}`} aria-hidden="true" />
            <div className="tapa">
              {datos.tapa ? (
                <img className="imagen-wiki" src={datos.tapa} alt={`Tapa de ${datos.nombre}`} />
              ) : (
                <div className="imagen-wiki imagen-respaldo" />
              )}
            </div>
            <p className="funda-ayuda">{girando ? 'Sonando…' : 'Dale play y el disco gira.'}</p>
          </div>
        </div>
        <div className="detalle-cuerpo">
          <h1 className="titulo-seccion">{datos.nombre}</h1>
          <dl className="datos-tecnicos">
            <div>
              <dt>Artista</dt>
              <dd>{delArchivo ? <a href={link('artistas', delArchivo.id)}>{autor}</a> : autor}</dd>
            </div>
            <div><dt>Salió</dt><dd>{datos.fecha || datos.anio}</dd></div>
            {delArchivo && (
              <div><dt>Costa</dt><dd><span className={`muestra costa-${costa}`} /> {nombreCosta(costa)}</dd></div>
            )}
            <div><dt>Duración</dt><dd>{datos.canciones.length} temas · {Math.round(total / 60)} min</dd></div>
          </dl>
          {fichaArchivo && (
            <p className="aviso-linea">
              Este disco tiene ficha completa en el archivo. <a href={link('albumes', fichaArchivo.id)}>Ver la ficha</a>
            </p>
          )}
          <div className="acciones-detalle">
            <AgregarDisco datos={datos} autor={autor} costa={costa} />
          </div>
          <section aria-labelledby="t-escuchar">
            <h2 id="t-escuchar">Escuchalo entero</h2>
            <ListaDisco datos={datos} disco={disco} autor={autor} />
          </section>
          <p className="nota-fuente">
            Datos y tapa de Spotify. Este disco no tiene ficha verificada en el archivo: solo mostramos lo que da Spotify.
          </p>
        </div>
      </article>
    </div>
  );
}
