import { useState } from 'react';
import { conectarSpotify, desconectarSpotify, useCuentaSpotify } from '../services/spotifyCuenta';

// Caja para conectar (o desconectar) la cuenta de Spotify del visitante.
export default function ConexionSpotify() {
  const cuenta = useCuentaSpotify();
  const [error, setError] = useState('');

  if (cuenta) {
    return (
      <div className="conexion-spotify conectada">
        <span className="cs-punto" aria-hidden="true" />
        <p>
          Spotify conectado{cuenta.nombre ? ` como ${cuenta.nombre}` : ''}. Tus playlists se pueden guardar allá y lo que
          guardes con <strong>+</strong> va a "Mi cajón" en tu Spotify.
        </p>
        <button type="button" className="btn-texto" onClick={desconectarSpotify}>
          Desconectar
        </button>
      </div>
    );
  }
  return (
    <div className="conexion-spotify">
      <p>
        <strong>Conectá tu Spotify</strong> para guardar estas playlists en tu cuenta. Por ahora es una demo: solo funciona con
        las cuentas habilitadas (hasta 5).
      </p>
      <button
        type="button"
        className="btn btn-spotify"
        onClick={() => conectarSpotify().catch((e) => setError(e.message))}
      >
        Conectar Spotify
      </button>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
