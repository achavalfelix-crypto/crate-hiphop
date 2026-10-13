import useSpotify from '../hooks/useSpotify';
import { artistaSpotify } from '../services/spotify';

// Reproductor de Spotify con las canciones más escuchadas del artista.
export default function ArtistaSpotify({ nombre }) {
  const { estado, datos } = useSpotify(() => artistaSpotify(nombre), nombre);
  if (estado === 'cargando') return <p className="cargando">Buscando en Spotify…</p>;
  if (estado !== 'listo') return null;
  return (
    <iframe
      className="spotify-reproductor"
      title={`Reproductor de Spotify: ${datos.nombre}`}
      src={`https://open.spotify.com/embed/artist/${datos.id}?utm_source=generator&theme=0`}
      height={352}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    />
  );
}
