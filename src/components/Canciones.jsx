import { useState } from 'react';

// Lista de canciones de un disco. Se guardan dentro del mismo documento, en el campo `tracks`.
export default function Canciones({ tracks, onCambiar }) {
  const [nueva, setNueva] = useState('');
  const [error, setError] = useState('');

  async function agregar(e) {
    e.preventDefault();
    const title = nueva.trim();
    if (!title) return setError('Escribí el nombre de la canción.');
    if (tracks.length >= 60) return setError('Máximo 60 canciones por disco.');
    setError('');
    const ok = await onCambiar([...tracks, { id: crypto.randomUUID(), title, fav: false }]);
    if (ok) setNueva('');
  }

  const alternarFav = (id) =>
    onCambiar(tracks.map((t) => (t.id === id ? { ...t, fav: !t.fav } : t)));
  const quitar = (id) => onCambiar(tracks.filter((t) => t.id !== id));

  return (
    <div className="canciones">
      {tracks.length === 0 ? (
        <p className="vacio-chico">Sin canciones cargadas.</p>
      ) : (
        <ol>
          {tracks.map((t) => (
            <li key={t.id} className={t.fav ? 'fav' : ''}>
              <div className="cancion-fila">
              <span className="cancion-titulo">{t.title}</span>
              <button
                type="button"
                className="btn-icono"
                aria-pressed={t.fav}
                aria-label={t.fav ? `Quitar ${t.title} de favoritas` : `Marcar ${t.title} como favorita`}
                onClick={() => alternarFav(t.id)}
              >
                {t.fav ? '♥' : '♡'}
              </button>
              <button
                type="button"
                className="btn-icono"
                aria-label={`Quitar ${t.title}`}
                onClick={() => quitar(t.id)}
              >
                ×
              </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <form onSubmit={agregar} className="form-cancion">
        <input
          aria-label="Nueva canción"
          placeholder="Agregar canción"
          value={nueva}
          maxLength={120}
          onChange={(e) => setNueva(e.target.value)}
        />
        <button className="btn">Agregar</button>
      </form>
      {error && <small className="error">{error}</small>}
    </div>
  );
}
