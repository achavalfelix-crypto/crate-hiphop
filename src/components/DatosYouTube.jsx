import { formatoDuracion, formatoVistas } from '../services/youtube';

// Duración + reproducciones en vivo de un video (se escucha con el botón ▶ de la página).
export default function DatosYouTube({ videoId, datos, compacto = false }) {
  if (!videoId) return null;
  const d = datos[videoId];
  return (
    <span className={`yt ${compacto ? 'yt-compacto' : ''}`}>
      {d && (
        <>
          <span className="yt-duracion">{formatoDuracion(d.duracion)}</span>
          <span className="yt-vistas" title="Reproducciones en YouTube, se actualizan cada minuto">
            <span className="yt-punto" aria-hidden="true" />
            {formatoVistas(d.vistas)}
            {!compacto && ' reproducciones'}
          </span>
        </>
      )}
    </span>
  );
}
