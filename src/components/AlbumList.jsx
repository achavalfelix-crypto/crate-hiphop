export default function AlbumList({ albums, onCambiarEstado, onEliminar }) {
  if (albums.length === 0) return <p>Todavía no agregaste discos.</p>;

  return (
    <ul className="lista">
      {albums.map((a) => (
        <li key={a.id}>
          <label>
            <input type="checkbox" checked={a.escuchado} onChange={() => onCambiarEstado(a)} />
            <strong>{a.title}</strong> — {a.artist} ({a.year})
          </label>
          <button onClick={() => onEliminar(a)}>Eliminar</button>
        </li>
      ))}
    </ul>
  );
}
