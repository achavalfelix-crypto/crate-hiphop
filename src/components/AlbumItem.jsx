import { useState } from 'react';
import { ESTADOS, nombreCosta } from '../data/constantes';
import AlbumForm from './AlbumForm';
import Canciones from './Canciones';
import Puntaje from './Puntaje';

export default function AlbumItem({ album, onActualizar, onEliminar }) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);

  const actualizar = (cambios) => onActualizar(album, cambios);
  const favoritas = album.tracks.filter((t) => t.fav).length;

  if (editando) {
    return (
      <li className="album editando">
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
    <li className={`album costa-${album.coast}`}>
      <div className="album-principal">
        <div className="album-datos">
          <h3>{album.title}</h3>
          <p>
            {album.artist} · {album.year} · {nombreCosta(album.coast)}
          </p>
        </div>
        <select
          aria-label={`Estado de ${album.title}`}
          value={album.status}
          onChange={(e) => actualizar({ status: e.target.value })}
        >
          {ESTADOS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
        <Puntaje valor={album.rating} onCambiar={(rating) => actualizar({ rating })} />
      </div>

      <div className="album-acciones">
        <button className="btn" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
          Canciones ({album.tracks.length}
          {favoritas ? `, ${favoritas} ♥` : ''})
        </button>
        <button className="btn" onClick={() => setEditando(true)}>
          Editar
        </button>
        <button className="btn btn-peligro" onClick={() => onEliminar(album)}>
          Eliminar
        </button>
      </div>

      {abierto && <Canciones tracks={album.tracks} onCambiar={(tracks) => actualizar({ tracks })} />}
    </li>
  );
}
