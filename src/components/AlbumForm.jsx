import { useState } from 'react';

export default function AlbumForm({ onAgregar, deshabilitado }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  async function enviar(e) {
    e.preventDefault();
    const anio = Number(year);
    if (!title.trim() || !artist.trim()) return setError('Completá título y artista.');
    if (!Number.isInteger(anio) || anio < 1980 || anio > 2016)
      return setError('El año tiene que estar entre 1980 y 2016.');
    setError('');
    await onAgregar({ title: title.trim(), artist: artist.trim(), year: anio, escuchado: false });
    setTitle('');
    setArtist('');
    setYear('');
  }

  return (
    <form onSubmit={enviar} className="form">
      <input placeholder="Título del disco" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Artista" value={artist} onChange={(e) => setArtist(e.target.value)} />
      <input placeholder="Año" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
      <button disabled={deshabilitado}>Agregar disco</button>
      {error && <p className="mensaje error">{error}</p>}
    </form>
  );
}
