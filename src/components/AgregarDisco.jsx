import { useState } from 'react';
import { link } from '../hooks/useRuta';
import { agregarAlbum, iniciarSesion } from '../services/albums';

// "Agregar a mi cajón" para un disco que viene de Spotify (con todas sus canciones).
export default function AgregarDisco({ datos, autor, costa }) {
  const [estado, setEstado] = useState('listo');
  const anio = Math.min(2016, Math.max(1980, datos.anio || 1980));

  async function agregar() {
    setEstado('guardando');
    try {
      const uid = await iniciarSesion();
      await agregarAlbum(uid, {
        type: 'album', album: '', videoId: '', spotifyId: datos.id, favorita: false,
        title: datos.nombre.slice(0, 120), artist: autor.slice(0, 80), year: anio, coast: costa,
        status: 'pendiente', rating: 0,
        tracks: datos.canciones.slice(0, 60).map((c) => ({ id: crypto.randomUUID(), title: c.nombre.slice(0, 120), fav: false, spotifyId: c.id })),
      });
      setEstado('ok');
    } catch {
      setEstado('error');
    }
  }
  if (estado === 'ok') {
    return (
      <p className="aviso-linea" role="status">
        Agregado a tu cajón. <a href={link('cajon')}>Ir a Mi cajón</a>
      </p>
    );
  }
  return (
    <>
      <button type="button" className="btn btn-primario" onClick={agregar} disabled={estado === 'guardando'}>
        {estado === 'guardando' ? 'Agregando…' : 'Agregar a mi cajón'}
      </button>
      {estado === 'error' && <p className="error" role="alert">No se pudo agregar. Probá de nuevo.</p>}
    </>
  );
}
