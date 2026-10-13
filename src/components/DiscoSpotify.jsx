import { useState } from 'react';
import useSpotify from '../hooks/useSpotify';
import { link } from '../hooks/useRuta';
import { agregarAlbum, iniciarSesion } from '../services/albums';
import { albumSpotify, minutos } from '../services/spotify';

// Botón chico para guardar una canción en Mi cajón.
function GuardarCancion({ cancion, disco, autor }) {
  const [estado, setEstado] = useState('listo'); // listo | guardando | ok | error
  async function guardar() {
    setEstado('guardando');
    try {
      const uid = await iniciarSesion();
      await agregarAlbum(uid, {
        type: 'cancion', album: disco.titulo, videoId: '', title: cancion.nombre, artist: autor,
        year: disco.anio, coast: disco.costa, status: 'pendiente', rating: 0, tracks: [],
      });
      setEstado('ok');
    } catch {
      setEstado('error');
    }
  }
  if (estado === 'ok') return <a className="pista-ok" href={link('cajon')}>En tu cajón</a>;
  return (
    <button
      type="button"
      className="pista-guardar"
      onClick={guardar}
      disabled={estado === 'guardando'}
      aria-label={`Guardar ${cancion.nombre} en Mi cajón`}
      title={estado === 'error' ? 'No se pudo guardar, probá de nuevo' : 'Guardar en Mi cajón'}
    >
      {estado === 'guardando' ? '…' : estado === 'error' ? '!' : '+'}
    </button>
  );
}

// Reproductor y lista completa de canciones de un disco, desde Spotify.
export default function DiscoSpotify({ disco, autor }) {
  const clave = `${disco.titulo}|${autor}`;
  const { estado, datos } = useSpotify(() => albumSpotify(disco.titulo, autor, disco.anio), clave);
  const [sonando, setSonando] = useState(null); // id de canción elegida, o null = disco entero

  if (estado === 'cargando') return <p className="cargando">Buscando el disco en Spotify…</p>;
  if (estado === 'vacio') return <p className="aviso-linea">Este disco no está en Spotify.</p>;
  if (estado === 'error') return <p className="aviso-linea">No pudimos conectar con Spotify ahora. Probá recargar la página.</p>;

  const total = datos.canciones.reduce((s, c) => s + c.duracion, 0);
  const variosDiscos = datos.canciones.some((c) => c.disco > 1);
  const src = sonando
    ? `https://open.spotify.com/embed/track/${sonando}?utm_source=generator&theme=0`
    : `https://open.spotify.com/embed/album/${datos.id}?utm_source=generator&theme=0`;

  return (
    <div className="spotify">
      <iframe
        key={src}
        className="spotify-reproductor"
        title={`Reproductor de Spotify: ${datos.nombre}`}
        src={src}
        height={sonando ? 152 : 352}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
      <p className="nota-fuente">
        {datos.canciones.length} canciones · {Math.round(total / 60)} min. Sin cuenta de Spotify se escuchan fragmentos; con
        tu cuenta abierta en este navegador, los temas completos.{' '}
        <a href={datos.url} target="_blank" rel="noreferrer">
          Abrir en Spotify
        </a>
      </p>
      <ol className="pistas">
        {datos.canciones.map((c) => (
          <li key={c.id} className={sonando === c.id ? 'pista sonando' : 'pista'}>
            <button
              type="button"
              className="pista-play"
              onClick={() => setSonando(sonando === c.id ? null : c.id)}
              aria-pressed={sonando === c.id}
              aria-label={sonando === c.id ? `Volver al disco entero` : `Escuchar ${c.nombre}`}
            >
              <span className="pista-num">{sonando === c.id ? '▶' : variosDiscos ? `${c.disco}.${c.numero}` : c.numero}</span>
              <span className="pista-nombre">
                {c.nombre}
                {c.explicita && <abbr className="pista-e" title="Letra explícita">E</abbr>}
                {c.artistas.length > 1 && <small> con {c.artistas.slice(1).join(', ')}</small>}
              </span>
              <span className="pista-dur">{minutos(c.duracion)}</span>
            </button>
            <GuardarCancion cancion={c} disco={disco} autor={autor} />
          </li>
        ))}
      </ol>
    </div>
  );
}
