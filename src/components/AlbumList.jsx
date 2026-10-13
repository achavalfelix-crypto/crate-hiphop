import AlbumItem from './AlbumItem';

export default function AlbumList({ albums, onActualizar, onEliminar, onLimpiarFiltros, yt }) {
  if (albums.length === 0) {
    return (
      <div className="vacio">
        <p>Ningún disco coincide con la búsqueda.</p>
        <button type="button" className="btn" onClick={onLimpiarFiltros}>
          Ver todos los discos
        </button>
      </div>
    );
  }

  return (
    <ul className="lista">
      {albums.map((a) => (
        <AlbumItem key={a.id} album={a} yt={yt} onActualizar={onActualizar} onEliminar={onEliminar} />
      ))}
    </ul>
  );
}
