import { useState } from 'react';
import DiscoSpotify from '../components/DiscoSpotify';
import ImagenWiki from '../components/ImagenWiki';
import { Migas } from '../components/Nav';
import { Dato } from '../components/Recuadros';
import { ALBUMES, albumPorId, autorDe } from '../data/archivo';
import { nombreCosta } from '../data/constantes';
import useWiki from '../hooks/useWiki';
import { transicion } from '../hooks/foco';
import { link } from '../hooks/useRuta';
import { agregarAlbum, iniciarSesion } from '../services/albums';
import { useReproductor } from '../services/reproductor';
import { albumSpotify } from '../services/spotify';

// Botón que guarda el disco en "Mi cajón" (Firestore).
function AgregarAlCajon({ d }) {
  const [estado, setEstado] = useState('listo'); // listo | guardando | ok | error
  async function agregar() {
    setEstado('guardando');
    try {
      const uid = await iniciarSesion();
      // Si Spotify tiene el disco, se guarda con todas sus canciones (listas para escuchar desde el cajón).
      const sp = await albumSpotify(d.titulo, autorDe(d), d.anio).catch(() => null);
      const tracks = (sp?.canciones ?? []).slice(0, 60).map((c) => ({
        id: crypto.randomUUID(), title: c.nombre, fav: false, spotifyId: c.id,
      }));
      await agregarAlbum(uid, {
        type: 'album', album: '', videoId: '', spotifyId: sp?.id ?? '', favorita: false, title: d.titulo,
        artist: autorDe(d), year: d.anio, coast: d.costa, status: 'pendiente', rating: 0, tracks,
      });
      setEstado('ok');
    } catch {
      setEstado('error');
    }
  }
  if (estado === 'ok') {
    return (
      <p className="aviso-linea" role="status">
        Agregado a tu cajón. <a href={link('cajon')}>Ir a Mi cajón</a>
      </p>
    );
  }
  return (
    <>
      <button type="button" className="btn btn-primario" onClick={agregar} disabled={estado === 'guardando'}>
        {estado === 'guardando' ? 'Agregando…' : 'Agregar a mi cajón'}
      </button>
      {estado === 'error' && <p className="error" role="alert">No se pudo agregar. Probá de nuevo.</p>}
    </>
  );
}

export default function Album({ id }) {
  const d = albumPorId(id);
  const { estado, datos } = useWiki(d?.wiki);
  const pista = useReproductor();
  const girando = (pista?.fuente === 'spotify' || pista?.fuente === 'app') && pista.discoId === d?.id;

  if (!d) {
    return (
      <div className="pagina">
        <p className="vacio">No encontramos ese disco. <a href={link('albumes')}>Ver todos los álbumes</a></p>
      </div>
    );
  }
  const mas = ALBUMES.filter((x) => x.artista === d.artista && x.id !== d.id);

  return (
    <div className="pagina">
      <Migas pasos={[{ nombre: 'Inicio', href: link() }, { nombre: 'Álbumes', href: link('albumes') }, { nombre: d.titulo }]} />
      <article className={`detalle costa-${d.costa}`}>
        <div className="detalle-imagen">
          <div className="funda">
            <span className={`vinilo ${girando ? 'girando' : ''}`} aria-hidden="true" />
            <div className="tapa" style={transicion('alb', d.id)}>
              <ImagenWiki wiki={d.wiki} alt={`Tapa de ${d.titulo}`} grande respaldo={{ title: d.titulo, coast: d.costa, year: d.anio }} />
            </div>
            <p className="funda-ayuda">{girando ? 'Sonando…' : 'Dale play y el disco gira.'}</p>
          </div>
        </div>
        <div className="detalle-cuerpo">
          <h1 className="titulo-seccion">{d.titulo}</h1>
          <dl className="datos-tecnicos">
            <div><dt>Artista</dt><dd><a href={link('artistas', d.artista)}>{autorDe(d)}</a></dd></div>
            <div><dt>Salió</dt><dd>{d.fecha ?? d.anio}</dd></div>
            <div><dt>Costa</dt><dd><span className={`muestra costa-${d.costa}`} /> {nombreCosta(d.costa)}</dd></div>
            {d.sello && <div><dt>Sello</dt><dd>{d.sello}</dd></div>}
            {d.productores && <div><dt>Producción</dt><dd>{d.productores}</dd></div>}
          </dl>

          <div className="acciones-detalle">
            <AgregarAlCajon d={d} />
          </div>

          <section aria-labelledby="t-escuchar">
            <h2 id="t-escuchar">Escuchalo entero</h2>
            <DiscoSpotify disco={d} autor={autorDe(d)} />
          </section>

          <section aria-labelledby="t-resena">
            <h2 id="t-resena">Sobre el disco</h2>
            {estado === 'cargando' && <p className="cargando">Cargando reseña…</p>}
            {estado === 'error' && <p>No pudimos traer la reseña ahora. Probá recargar la página.</p>}
            {estado === 'listo' && (
              <>
                <p className="bio">{datos.texto}</p>
                <p className="nota-fuente">
                  Texto de{' '}
                  <a href={datos.url} target="_blank" rel="noreferrer">
                    Wikipedia{datos.idioma === 'en' ? ' (en inglés)' : ''}
                  </a>
                  , licencia CC BY-SA. Tapa: Wikipedia.
                </p>
              </>
            )}
          </section>

          <div className="ficha-pie">
            <Dato texto={d.dato} fuente={d.fuente} />
          </div>
        </div>
      </article>

      {mas.length > 0 && (
        <section className="relacionados" aria-labelledby="t-mas">
          <h2 id="t-mas">Más de {autorDe(mas[0])}</h2>
          <ul className="grilla-discos">
            {mas.map((x) => (
              <li key={x.id}>
                <a href={link('albumes', x.id)}>
                  <ImagenWiki wiki={x.wiki} alt="" respaldo={{ title: x.titulo, coast: x.costa, year: x.anio }} />
                  <span className="grilla-titulo">{x.titulo}</span>
                  <span className="grilla-anio">{x.anio}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
