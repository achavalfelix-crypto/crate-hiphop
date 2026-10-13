import useWiki from '../hooks/useWiki';
import Portada from './Portada';

// Imagen de Wikipedia (foto del artista o tapa del disco).
// Mientras carga, o si no hay imagen, muestra la portada tipográfica de la app.
export default function ImagenWiki({ wiki, alt, respaldo, grande = false, className = '' }) {
  const { estado, datos } = useWiki(wiki);
  const src = grande ? datos?.imagenGrande : datos?.imagen;

  if (estado === 'listo' && src) {
    return <img className={`imagen-wiki ${className}`} src={src} alt={alt} loading="lazy" />;
  }
  return (
    <div className={`imagen-wiki imagen-respaldo ${estado === 'cargando' ? 'cargando' : ''} ${className}`}>
      <Portada album={respaldo} />
    </div>
  );
}
