import { useEffect } from 'react';
import Nav, { NOMBRE } from './components/Nav';
import Instalar from './components/Instalar';
import Reproductor from './components/Reproductor';
import useRuta from './hooks/useRuta';
import Album from './pages/Album';
import Albumes from './pages/Albumes';
import Artista from './pages/Artista';
import Artistas from './pages/Artistas';
import Cajon from './pages/Cajon';
import Historia from './pages/Historia';
import Inicio from './pages/Inicio';
import Playlist from './pages/Playlist';
import Playlists from './pages/Playlists';

const TITULOS = { artistas: 'Artistas', albumes: 'Álbumes', historia: 'Historia', cajon: 'Mi cajón' };

export default function App() {
  const [seccion = '', id, sub] = useRuta();

  useEffect(() => {
    document.title = TITULOS[seccion] ? `${TITULOS[seccion]} · ${NOMBRE}` : NOMBRE;
  }, [seccion]);

  let pagina;
  if (seccion === 'artistas') pagina = id ? <Artista key={id} id={id} /> : <Artistas />;
  else if (seccion === 'albumes') pagina = id ? <Album key={id} id={id} /> : <Albumes />;
  else if (seccion === 'historia') pagina = <Historia />;
  else if (seccion === 'cajon' && id === 'playlists') pagina = sub ? <Playlist key={sub} id={sub} /> : <Playlists />;
  else if (seccion === 'cajon') pagina = <Cajon />;
  else pagina = <Inicio />;

  return (
    <>
      <a className="saltar" href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus(); }}>
        Saltar al contenido
      </a>
      <Nav seccion={TITULOS[seccion] ? seccion : ''} />
      <main id="contenido" tabIndex={-1}>
        {pagina}
      </main>
      <footer className="pie-global">
        <p>
          {NOMBRE} · Trabajo práctico de Desarrollo Frontend II (UADE). Textos e imágenes de artistas y discos: Wikipedia, con
          su fuente en cada ficha.
        </p>
        <Instalar />
      </footer>
      <Reproductor />
    </>
  );
}
