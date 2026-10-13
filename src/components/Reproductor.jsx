import { useEffect, useRef } from 'react';
import { anterior, cerrarReproductor, siguiente, useCola, useReproductor } from '../services/reproductor';

// Carga una sola vez la API del reproductor de Spotify (permite cambiar de tema y darle play con un toque).
let apiSpotify = null;
function cargarApiSpotify() {
  if (apiSpotify) return apiSpotify;
  apiSpotify = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);
    const s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    s.onerror = () => {
      apiSpotify = null;
      reject(new Error('No cargó el reproductor de Spotify'));
    };
    document.body.appendChild(s);
  });
  return apiSpotify;
}

function Spotify({ pista }) {
  const caja = useRef(null);
  const control = useRef(null);
  const terminado = useRef(false);
  const uri = `spotify:${pista.tipo}:${pista.id}`;

  useEffect(() => {
    let vivo = true;
    terminado.current = false;
    if (control.current) {
      control.current.loadUri(uri);
      control.current.play();
      return;
    }
    cargarApiSpotify()
      .then((api) => {
        if (!vivo || !caja.current) return;
        const lugar = document.createElement('div'); // Spotify reemplaza este div por su iframe
        caja.current.replaceChildren(lugar);
        api.createController(lugar, { uri, width: '100%', height: 80 }, (c) => {
          control.current = c;
          c.addListener('ready', () => c.play());
          // Cuando termina un tema de una playlist, pasa solo al siguiente.
          c.addListener('playback_update', (e) => {
            const { position, duration, isPaused } = e.data ?? {};
            if (!terminado.current && duration > 0 && position >= duration - 800 && !isPaused) {
              terminado.current = true;
              setTimeout(siguiente, 400);
            }
          });
        });
      })
      .catch(() => {
        // Plan B: el reproductor común de Spotify (hay que tocar play adentro).
        if (!vivo || !caja.current) return;
        caja.current.innerHTML = '';
        const f = document.createElement('iframe');
        f.src = `https://open.spotify.com/embed/${pista.tipo}/${pista.id}?utm_source=generator&theme=0`;
        f.height = '80';
        f.style.cssText = 'width:100%;border:0;border-radius:12px';
        f.allow = 'autoplay; clipboard-write; encrypted-media';
        f.title = `Spotify: ${pista.titulo}`;
        caja.current.appendChild(f);
      });
    return () => {
      vivo = false;
    };
  }, [uri]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => control.current?.destroy?.(), []);

  return <div ref={caja} className="reproductor-spotify" />;
}

function YouTube({ pista }) {
  return (
    <iframe
      key={pista.id}
      className="reproductor-youtube"
      title={`YouTube: ${pista.titulo}`}
      src={`https://www.youtube-nocookie.com/embed/${pista.id}?autoplay=1&playsinline=1&rel=0`}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}

// Barra fija abajo: lo que está sonando en cualquier parte de la página.
export default function Reproductor() {
  const pista = useReproductor();
  const cola = useCola();

  useEffect(() => {
    document.body.classList.toggle('con-reproductor', Boolean(pista));
  }, [pista]);

  if (!pista) return null;
  const esSpotify = pista.fuente === 'spotify';

  return (
    <section className={`reproductor fuente-${pista.fuente}`} aria-label="Reproductor">
      {cola && (
        <div className="reproductor-cola">
          <button type="button" onClick={anterior} disabled={cola.indice === 0} aria-label="Tema anterior">
            ⏮
          </button>
          <p>
            <strong>{cola.nombre}</strong> · {cola.indice + 1} de {cola.canciones.length}
          </p>
          <button
            type="button"
            onClick={siguiente}
            disabled={cola.indice >= cola.canciones.length - 1}
            aria-label="Tema siguiente"
          >
            ⏭
          </button>
        </div>
      )}
      <div className="reproductor-interior">
        <div className="reproductor-cuerpo">
          {pista.fuente === 'buscando' && (
            <p className="reproductor-aviso" role="status">
              Buscando “{pista.titulo}” en Spotify…
            </p>
          )}
          {pista.fuente === 'no-encontrada' && (
            <p className="reproductor-aviso" role="status">
              No encontramos “{pista.titulo}” de {pista.artista} en Spotify.
            </p>
          )}
          {pista.fuente === 'error' && (
            <p className="reproductor-aviso" role="alert">
              No pudimos conectar con Spotify. Probá de nuevo en un rato.
            </p>
          )}
          {esSpotify && <Spotify pista={pista} />}
          {pista.fuente === 'youtube' && <YouTube pista={pista} />}
        </div>
        <button type="button" className="reproductor-cerrar" onClick={cerrarReproductor} aria-label="Cerrar reproductor">
          ×
        </button>
      </div>
    </section>
  );
}
