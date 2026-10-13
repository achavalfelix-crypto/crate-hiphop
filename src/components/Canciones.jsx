import { useState } from 'react';
import { albumSpotify } from '../services/spotify';
import BotonPlay from './BotonPlay';
import DatosYouTube from './DatosYouTube';

const normal = (t) => (t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

// Lista de canciones de un disco. Se guardan dentro del mismo documento, en el campo `tracks`.
export default function Canciones({ tracks, onCambiar, artista, disco, anio, yt = {} }) {
  const [nueva, setNueva] = useState('');
  const [error, setError] = useState('');
  const [trayendo, setTrayendo] = useState(false);

  async function agregar(e) {
    e.preventDefault();
    const title = nueva.trim();
    if (!title) return setError('Escribí el nombre de la canción.');
    if (tracks.length >= 60) return setError('Máximo 60 canciones por disco.');
    setError('');
    const ok = await onCambiar([...tracks, { id: crypto.randomUUID(), title, fav: false }]);
    if (ok) setNueva('');
  }

  // Trae la lista completa desde Spotify y la suma a la que ya hay (sin repetir y sin perder favoritas).
  async function traerTodas() {
    setTrayendo(true);
    setError('');
    try {
      const sp = await albumSpotify(disco, artista, anio);
      if (!sp?.canciones?.length) {
        setError('No encontramos este disco en Spotify.');
        return;
      }
      const porNombre = new Map(tracks.map((t) => [normal(t.title), t]));
      const completa = sp.canciones.slice(0, 60).map((c) => {
        const ya = porNombre.get(normal(c.nombre));
        return ya ? { ...ya, spotifyId: ya.spotifyId || c.id } : { id: crypto.randomUUID(), title: c.nombre.slice(0, 120), fav: false, spotifyId: c.id };
      });
      // Las que había a mano y no están en Spotify quedan al final.
      const enSpotify = new Set(sp.canciones.map((c) => normal(c.nombre)));
      const extra = tracks.filter((t) => !enSpotify.has(normal(t.title)));
      await onCambiar([...completa, ...extra].slice(0, 60));
    } catch {
      setError('No pudimos conectar con Spotify. Probá de nuevo.');
    } finally {
      setTrayendo(false);
    }
  }

  const alternarFav = (id) => onCambiar(tracks.map((t) => (t.id === id ? { ...t, fav: !t.fav } : t)));
  const quitar = (id) => onCambiar(tracks.filter((t) => t.id !== id));
  // Guarda el ID de Spotify que encontró el reproductor, así la próxima vez suena directo.
  const guardarSpotify = (id, spotifyId) => onCambiar(tracks.map((t) => (t.id === id ? { ...t, spotifyId } : t)));

  return (
    <div className="canciones-disco">
      {tracks.length === 0 ? (
        <p className="vacio-chico">Sin canciones cargadas.</p>
      ) : (
        <ol className="cd-lista">
          {tracks.map((t, i) => (
            <li key={t.id} className={t.fav ? 'fav' : ''}>
              <span className="cd-num">{i + 1}</span>
              <BotonPlay
                chico
                titulo={t.title}
                artista={artista}
                spotifyId={t.spotifyId}
                videoId={t.videoId}
                onEncontrada={(sid) => guardarSpotify(t.id, sid)}
              />
              <span className="cd-titulo">{t.title}</span>
              <DatosYouTube videoId={t.videoId} datos={yt} compacto />
              <button
                type="button"
                className={`cd-icono ${t.fav ? 'activo' : ''}`}
                aria-pressed={t.fav}
                aria-label={t.fav ? `Quitar ${t.title} de favoritas` : `Marcar ${t.title} como favorita`}
                onClick={() => alternarFav(t.id)}
              >
                {t.fav ? '♥' : '♡'}
              </button>
              <button type="button" className="cd-icono" aria-label={`Quitar ${t.title}`} onClick={() => quitar(t.id)}>
                ×
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="cd-pie">
        <button type="button" className="btn-play" onClick={traerTodas} disabled={trayendo}>
          {trayendo ? 'Trayendo…' : '↓ Traer todas las canciones de Spotify'}
        </button>
        <form onSubmit={agregar} className="cd-agregar">
          <input
            aria-label="Nueva canción"
            placeholder="O escribí una a mano"
            value={nueva}
            maxLength={120}
            onChange={(e) => setNueva(e.target.value)}
          />
          <button className="btn">Sumar</button>
        </form>
      </div>
      {error && <small className="error">{error}</small>}
    </div>
  );
}
