import { useState } from 'react';
import { ESTADOS, nombreCosta } from '../data/constantes';
import { link } from '../hooks/useRuta';
import { reproducir } from '../services/reproductor';
import { formatoDuracion } from '../services/youtube';
import AlbumForm from './AlbumForm';
import BotonPlay from './BotonPlay';
import Canciones from './Canciones';
import DatosYouTube from './DatosYouTube';
import Portada from './Portada';
import Puntaje from './Puntaje';
import { discoDelArchivo } from '../data/archivo';
import TapaCajon from './TapaCajon';

// Una tarjeta del cajón: un disco (con sus canciones) o una canción suelta.
export default function AlbumItem({ album, onActualizar, onEliminar, yt = {} }) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const esCancion = album.type === 'cancion';
  const actualizar = (cambios) => onActualizar(album, cambios);
  const favoritas = album.tracks.filter((t) => t.fav).length;
  const totalDisco = album.tracks.reduce((s, t) => s + (yt[t.videoId]?.duracion ?? 0), 0);
  // Si es uno de los discos del archivo, se muestra un poco de su historia (dato verificado).
  const arch = discoDelArchivo(album);

  if (editando) {
    return (
      <li className="album album-tarjeta editando">
        <Portada album={album} />
        <AlbumForm
          inicial={album}
          onGuardar={async (datos) => {
            const ok = await actualizar(datos);
            if (ok) setEditando(false);
            return ok;
          }}
          onCancelar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    <li className={`album album-tarjeta costa-${album.coast} estado-${album.status} tipo-${album.type}`}>
      <TapaCajon album={album} />

      <div className="at-cuerpo">
        <div className="at-cabeza">
          <div>
            <h3>{album.title}</h3>
            <p className="album-artista">{album.artist}</p>
            <p className="album-meta">
              <span className={`muestra costa-${album.coast}`} />
              {esCancion ? 'Canción' : 'Disco'} · {nombreCosta(album.coast)} · {album.year}
              {esCancion && album.album && (
                <>
                  {' · '}del disco <em>{album.album}</em>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            className={`btn-corazon ${album.favorita ? 'activo' : ''}`}
            aria-pressed={album.favorita}
            aria-label={album.favorita ? `Quitar ${album.title} de favoritas` : `Marcar ${album.title} como favorita`}
            onClick={() => actualizar({ favorita: !album.favorita })}
          >
            {album.favorita ? '♥' : '♡'}
          </button>
        </div>

        {arch && (
          <p className="at-historia">
            <span className="at-historia-etiqueta">La historia</span> {arch.dato}{' '}
            <a href={link('albumes', arch.id)}>Ver la ficha</a>
          </p>
        )}

        <div className="at-controles">
          {esCancion ? (
            <BotonPlay
              titulo={album.title}
              artista={album.artist}
              spotifyId={album.spotifyId}
              videoId={album.videoId}
              onEncontrada={(spotifyId) => actualizar({ spotifyId })}
            />
          ) : album.spotifyId ? (
            <button
              type="button"
              className="btn-play"
              onClick={() =>
                reproducir({ fuente: 'spotify', tipo: 'album', id: album.spotifyId, titulo: album.title, artista: album.artist, discoId: arch?.id })
              }
            >
              <span aria-hidden="true">▶</span> <span>Escuchar</span>
            </button>
          ) : null}
          <label className="at-estado">
            <span className="sr-only">Estado de {album.title}</span>
            <select value={album.status} onChange={(e) => actualizar({ status: e.target.value })}>
              {ESTADOS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </label>
          <Puntaje valor={album.rating} onCambiar={(rating) => actualizar({ rating })} />
        </div>

        {esCancion && album.videoId && <DatosYouTube videoId={album.videoId} datos={yt} />}
        {!esCancion && totalDisco > 0 && (
          <p className="yt">
            <span className="yt-duracion">{formatoDuracion(totalDisco)}</span>
            <span className="yt-nota">en {album.tracks.filter((t) => yt[t.videoId]).length} canciones</span>
          </p>
        )}

        <div className="album-acciones">
          {!esCancion && (
            <button type="button" className="btn-texto" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
              {abierto ? 'Ocultar canciones' : `Canciones (${album.tracks.length}${favoritas ? `, ${favoritas} ♥` : ''})`}
            </button>
          )}
          <button type="button" className="btn-texto" onClick={() => setEditando(true)}>
            Editar
          </button>
          {confirmando ? (
            <span className="confirmar" role="group" aria-label="Confirmar eliminación">
              {esCancion ? '¿Eliminar esta canción?' : '¿Eliminar este disco?'}
              <button type="button" className="btn-texto peligro" onClick={() => onEliminar(album)}>
                Sí, eliminar
              </button>
              <button type="button" className="btn-texto" onClick={() => setConfirmando(false)}>
                No
              </button>
            </span>
          ) : (
            <button type="button" className="btn-texto peligro" onClick={() => setConfirmando(true)}>
              Eliminar
            </button>
          )}
        </div>

        {abierto && !esCancion && (
          <Canciones tracks={album.tracks} artista={album.artist} yt={yt} onCambiar={(tracks) => actualizar({ tracks })} />
        )}
      </div>
    </li>
  );
}
