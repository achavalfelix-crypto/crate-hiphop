// Portada generada con tipografía: color de la costa + inicial en letra gótica.
// Las canciones usan una portada redonda, como un simple de vinilo.
// No usamos las tapas reales para no reproducir arte con derechos de autor.
export default function Portada({ album, chica = false }) {
  const palabras = album.title.replace(/^(the|a)\s+/i, '').trim();
  const inicial = palabras.charAt(0).toUpperCase() || '?';

  return (
    <div className={`portada costa-${album.coast} tipo-${album.type} ${chica ? 'portada-chica' : ''}`} aria-hidden="true">
      <span className="portada-inicial">{inicial}</span>
      <span className="portada-anio">{album.year}</span>
    </div>
  );
}
