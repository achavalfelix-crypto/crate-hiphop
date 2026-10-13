import useSpotify from '../hooks/useSpotify';
import { reproducir, useReproductor } from '../services/reproductor';
import { artistaSpotify } from '../services/spotify';

// Botón que pone en el reproductor de la página los temas más escuchados del artista.
export default function ArtistaSpotify({ nombre }) {
  const { estado, datos } = useSpotify(() => artistaSpotify(nombre), nombre);
  const pista = useReproductor();
  if (estado === 'cargando') return <p className="cargando">Buscando en Spotify…</p>;
  if (estado !== 'listo') return <p className="aviso-linea">No encontramos a {nombre} en Spotify.</p>;
  const suena = pista?.id === datos.id;
  return (
    <p>
      <button
        type="button"
        className="btn btn-primario"
        onClick={() => reproducir({ fuente: 'spotify', tipo: 'artist', id: datos.id, titulo: datos.nombre, artista: datos.nombre })}
      >
        {suena ? '▶ Sonando sus temas' : `▶ Escuchar los temas más conocidos de ${datos.nombre}`}
      </button>
    </p>
  );
}
