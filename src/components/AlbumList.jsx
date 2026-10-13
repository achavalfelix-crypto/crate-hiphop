import AlbumItem from './AlbumItem';

export default function AlbumList({ albums, hayFiltros, onActualizar, onEliminar }) {
  if (albums.length === 0) {
    return (
      <p className="vacio">
        {hayFiltros
          ? 'Ningún disco coincide con los filtros.'
          : 'Todavía no agregaste discos. Cargá el primero con el formulario.'}
      </p>
    );
  }

  return (
    <ul className="lista">
      {albums.map((a) => (
        <AlbumItem key={a.id} album={a} onActualizar={onActualizar} onEliminar={onEliminar} />
      ))}
    </ul>
  );
}
