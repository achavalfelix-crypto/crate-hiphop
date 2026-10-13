import { reproducirCancion, useReproductor } from '../services/reproductor';

// Botón ▶ que hace sonar una canción en el reproductor de la página.
// Si la canción no tenía ID de Spotify y lo encuentra, avisa con onEncontrada para guardarlo.
export default function BotonPlay({ titulo, artista, spotifyId, videoId, onEncontrada, chico = false }) {
  const pista = useReproductor();
  const suena =
    pista &&
    ((spotifyId && pista.id === spotifyId) ||
      (videoId && pista.id === videoId) ||
      (pista.titulo === titulo && pista.artista === artista));

  async function tocar() {
    const id = await reproducirCancion({ titulo, artista, spotifyId, videoId });
    if (id && !spotifyId && !videoId) onEncontrada?.(id);
  }

  return (
    <button
      type="button"
      className={`btn-play ${chico ? 'btn-play-chico' : ''} ${suena ? 'sonando' : ''}`}
      onClick={tocar}
      aria-label={`Escuchar ${titulo}`}
      title={`Escuchar ${titulo}`}
    >
      <span aria-hidden="true">{suena ? '♪' : '▶'}</span>
      {!chico && <span>{suena ? 'Sonando' : 'Escuchar'}</span>}
    </button>
  );
}
