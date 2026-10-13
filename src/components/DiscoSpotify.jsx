import { useState } from 'react';
import useSpotify from '../hooks/useSpotify';
import { link } from '../hooks/useRuta';
import { agregarAlbum, iniciarSesion } from '../services/albums';
import { reproducir, useReproductor } from '../services/reproductor';
import { albumSpotify, minutos } from '../services/spotify';
import { sumarAlCajonDeSpotify } from '../services/spotifyCuenta';

// Botón chico para guardar una canción en Mi cajón.
function GuardarCancion({ cancion, disco, autor }) {
  const [estado, setEstado] = useState('listo'); // listo | guardando | ok | error
  async function guardar() {
    setEstado('guardando');
    try {
      const uid = await iniciarSesion();
      await agregarAlbum(uid, {
        type: 'cancion', album: disco.titulo, videoId: '', spotifyId: cancion.id, favorita: false, title: cancion.nombre, artist: autor,
        year: disco.anio, coast: disco.costa, status: 'pendiente', rating: 0, tracks: [],
      });
      setEstado('ok');
      sumarAlCajonDeSpotify(cancion.id).catch(() => {}); // si tiene Spotify conectado, también va allá
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

// Lista completa de canciones de un disco, desde Spotify. Suena en el reproductor de la página.
export default function DiscoSpotify({ disco, autor }) {
  const clave = `${disco.titulo}|${autor}`;
  const { estado, datos } = useSpotify(() => albumSpotify(disco.titulo, autor, disco.anio), clave);
  const pista = useReproductor();

  if (estado === 'cargando') return <p className="cargando">Buscando el disco en Spotify…</p>;
  if (estado === 'vacio') return <p className="aviso-linea">Este disco no está en Spotify.</p>;
  if (estado === 'error') return <p className="aviso-linea">No pudimos conectar con Spotify ahora. Probá recargar la página.</p>;

  const total = datos.canciones.reduce((s, c) => s + c.duracion, 0);
  const variosDiscos = datos.canciones.some((c) => c.disco > 1);
  const sonandoId = pista?.fuente === 'spotify' ? pista.id : null;
  const discoEntero = sonandoId === datos.id;

  return (
    <div className="spotify">
      <div className="spotify-cabeza">
        <button
          type="button"
          className="btn btn-primario"
          onClick={() =>
            reproducir({ fuente: 'spotify', tipo: 'album', id: datos.id, titulo: disco.titulo, artista: autor, discoId: disco.id })
          }
        >
          {discoEntero ? '▶ Sonando el disco' : '▶ Escuchar el disco entero'}
        </button>
        <p className="nota-fuente">
          {datos.canciones.length} canciones · {Math.round(total / 60)} min ·{' '}
          <a href={datos.url} target="_blank" rel="noreferrer">
            Abrir en Spotify
          </a>
        </p>
      </div>
      <ol className="pistas">
        {datos.canciones.map((c) => {
          const suena = sonandoId === c.id;
          return (
            <li key={c.id} className={suena ? 'pista sonando' : 'pista'}>
              <button
                type="button"
                className="pista-play"
                onClick={() =>
                  reproducir({ fuente: 'spotify', tipo: 'track', id: c.id, titulo: c.nombre, artista: autor, discoId: disco.id })
                }
                aria-current={suena ? 'true' : undefined}
                aria-label={`Escuchar ${c.nombre}`}
              >
                <span className="pista-num">{suena ? '▶' : variosDiscos ? `${c.disco}.${c.numero}` : c.numero}</span>
                <span className="pista-nombre">
                  {c.nombre}
                  {c.explicita && <abbr className="pista-e" title="Letra explícita">E</abbr>}
                  {c.artistas.length > 1 && <small> con {c.artistas.slice(1).join(', ')}</small>}
                </span>
                <span className="pista-dur">{minutos(c.duracion)}</span>
              </button>
              <GuardarCancion cancion={c} disco={disco} autor={autor} />
            </li>
          );
        })}
      </ol>
      <p className="nota-fuente">
        Sin cuenta de Spotify se escuchan fragmentos de 30 segundos; con tu cuenta abierta en este navegador, los temas
        completos.
      </p>
    </div>
  );
}
