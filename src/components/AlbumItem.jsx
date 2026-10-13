import { useState } from 'react';
import { ESTADOS, nombreCosta } from '../data/constantes';
import AlbumForm from './AlbumForm';
import Canciones from './Canciones';
import Portada from './Portada';
import Puntaje from './Puntaje';

// Una fila de la lista: puede ser un disco (con sus canciones) o una canción suelta.
export default function AlbumItem({ album, onActualizar, onEliminar }) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const esCancion = album.type === 'cancion';
  const actualizar = (cambios) => onActualizar(album, cambios);
  const favoritas = album.tracks.filter((t) => t.fav).length;

  if (editando) {
    return (
      <li className="album editando">
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
    <li className={`album estado-${album.status} tipo-${album.type}`}>
      <Portada album={album} />

      <div className="album-cuerpo">
        <div className="album-datos">
          <h3>{album.title}</h3>
          <p className="album-artista">{album.artist}</p>
          <p className="album-meta">
            <span className={`muestra costa-${album.coast}`} />
            {esCancion ? 'Canción' : 'Disco'}, {nombreCosta(album.coast)}, {album.year}
          </p>
          {esCancion && album.album && (
            <p className="album-de">
              Del disco <em>{album.album}</em>
            </p>
          )}
        </div>

        <div className="album-controles">
          <div className="segmentado segmentado-chico" role="group" aria-label={`Estado de ${album.title}`}>
            {ESTADOS.map((e) => (
              <button
                key={e.id}
                type="button"
                aria-pressed={album.status === e.id}
                onClick={() => album.status !== e.id && actualizar({ status: e.id })}
              >
                {e.nombre}
              </button>
            ))}
          </div>
          <Puntaje valor={album.rating} onCambiar={(rating) => actualizar({ rating })} />
        </div>

        <div className="album-acciones">
          {!esCancion && (
            <button
              type="button"
              className="btn-texto"
              aria-expanded={abierto}
              onClick={() => setAbierto(!abierto)}
            >
              {abierto ? 'Ocultar canciones' : 'Canciones'} ({album.tracks.length}
              {favoritas ? `, ${favoritas} ♥` : ''})
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
          <Canciones tracks={album.tracks} onCambiar={(tracks) => actualizar({ tracks })} />
        )}
      </div>
    </li>
  );
}
