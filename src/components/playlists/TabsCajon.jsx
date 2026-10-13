import { link } from '../../hooks/useRuta';

// Pestañas de Mi cajón: la colección y las playlists. La activa queda en dorado.
export default function TabsCajon({ activa }) {
  return (
    <nav className="tabs-cajon" aria-label="Mi cajón">
      <a href={link('cajon')} aria-current={activa === 'coleccion' ? 'page' : undefined}>
        Colección
      </a>
      <a href={link('cajon', 'playlists')} aria-current={activa === 'playlists' ? 'page' : undefined}>
        Playlists
      </a>
    </nav>
  );
}
