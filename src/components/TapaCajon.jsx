import { useEffect, useRef, useState } from 'react';
import { discoDelArchivo } from '../data/archivo';
import { albumSpotify, cancionSpotify, discoSpotify } from '../services/spotify';
import ImagenWiki from './ImagenWiki';
import Portada from './Portada';

// Pide la tapa a Spotify solo cuando la tarjeta aparece en pantalla.
function useTapaSpotify(album, visible) {
  const [tapa, setTapa] = useState('');
  useEffect(() => {
    if (!visible) return;
    let vivo = true;
    const pedido =
      album.type === 'album'
        ? album.spotifyId
          ? discoSpotify(album.spotifyId)
          : albumSpotify(album.title, album.artist, album.year)
        : cancionSpotify(album.title, album.artist);
    pedido.then((r) => vivo && r?.tapa && setTapa(r.tapa)).catch(() => {});
    return () => {
      vivo = false;
    };
  }, [visible, album.type, album.spotifyId, album.title, album.artist, album.year]);
  return tapa;
}

function useVisible() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window));
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setVisible(true), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);
  return [ref, visible];
}

// Tapa real de un disco o canción del cajón: la del archivo (Wikipedia) o la de Spotify.
// Mientras carga, o si no hay, queda la portada tipográfica.
export default function TapaCajon({ album, onTapa }) {
  const arch = discoDelArchivo(album);
  const [ref, visible] = useVisible();
  const buscada = useTapaSpotify(album, visible && !arch && !album.tapa);
  const tapa = album.tapa || buscada;
  // La primera vez que se consigue, se guarda en el disco: no hay que volver a pedírsela a Spotify.
  useEffect(() => {
    if (buscada && !album.tapa) onTapa?.(buscada);
  }, [buscada]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={ref} className={`tapa-cajon tipo-${album.type}`}>
      {arch ? (
        <ImagenWiki wiki={arch.wiki} alt="" respaldo={{ title: album.title, coast: album.coast, year: album.year, type: album.type }} />
      ) : tapa ? (
        <img className="imagen-wiki" src={tapa} alt="" loading="lazy" />
      ) : (
        <Portada album={album} />
      )}
    </div>
  );
}
