import { useMemo, useState } from 'react';
import BuscarDiscos from '../components/BuscarDiscos';
import ImagenWiki from '../components/ImagenWiki';
import { Migas } from '../components/Nav';
import { Dato } from '../components/Recuadros';
import SelectorCosta from '../components/SelectorCosta';
import { ALBUMES, ARTISTAS, albumPorTitulo, autorDe } from '../data/archivo';
import { nombreCosta } from '../data/constantes';
import useTodosLosDiscos from '../hooks/useTodosLosDiscos';
import useWiki from '../hooks/useWiki';
import { seguirMouse, transicion } from '../hooks/foco';
import { link } from '../hooks/useRuta';


function FichaAlbum({ d }) {
  const { estado, datos } = useWiki(d.wiki);
  return (
    <article className={`ficha costa-${d.costa}`} onPointerMove={seguirMouse}>
      <a className="ficha-imagen" href={link('albumes', d.id)} tabIndex={-1} aria-hidden="true" style={transicion('alb', d.id)}>
        <ImagenWiki wiki={d.wiki} alt="" respaldo={{ title: d.titulo, coast: d.costa, year: d.anio }} />
      </a>
      <div className="ficha-cuerpo">
        <h2>
          <a href={link('albumes', d.id)}>{d.titulo}</a>
        </h2>
        <p className="ficha-meta">
          <span className={`muestra costa-${d.costa}`} />
          <a href={link('artistas', d.artista)}>{autorDe(d)}</a> · {d.anio} · {nombreCosta(d.costa)}
        </p>
        <p className="ficha-texto">
          {estado === 'listo' ? datos.texto : estado === 'cargando' ? 'Cargando reseña…' : ''}
        </p>
        <a className="ficha-mas" href={link('albumes', d.id)}>
          Ver ficha completa
        </a>
      </div>
      <div className="ficha-pie">
        <Dato texto={d.dato} fuente={d.fuente} />
        {(d.sello || d.productores) && (
          <div className="recuadro recuadro-tecnico">
            <p className="recuadro-titulo">Ficha</p>
            {d.sello && <p>Sello: {d.sello}</p>}
            {d.productores && <p>Producción: {d.productores}</p>}
          </div>
        )}
      </div>
    </article>
  );
}

const POR_TANDA = 48;

// Todos los discos de los 26 artistas del archivo (de cualquier año), desde Spotify.
function TodosLosDiscos({ costa, todos }) {
  const { discos, cargando, listos, total, error } = todos;
  const [artista, setArtista] = useState('');
  const [texto, setTexto] = useState('');
  const [cuantos, setCuantos] = useState(POR_TANDA);
  const t = texto.trim().toLowerCase();
  const visibles = discos.filter(
    (d) =>
      (!costa || d.costa === costa) &&
      (!artista || d.artistaId === artista) &&
      (!t || d.nombre.toLowerCase().includes(t) || d.artistaNombre.toLowerCase().includes(t)),
  );

  if (error) return <p className="aviso-linea">No pudimos traer las discografías de Spotify. Probá recargar la página.</p>;

  return (
    <section className="todos-discos" aria-labelledby="t-todos">
      <h2 id="t-todos" className="subtitulo-lista">
        Todos los discos de los artistas <span className="chip-num">{discos.length}</span>
      </h2>
      <p className="nota-fuente">
        La discografía completa de los {total} artistas del archivo, de cualquier año, según Spotify. Los marcados con ★
        tienen ficha completa y verificada.
        {cargando && ` Cargando… (${listos} de ${total} artistas)`}
      </p>
      <div className="filtros-discos">
        <select aria-label="Filtrar por artista" value={artista} onChange={(e) => { setArtista(e.target.value); setCuantos(POR_TANDA); }}>
          <option value="">Todos los artistas</option>
          {[...ARTISTAS].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
        <input
          type="search"
          aria-label="Filtrar discos por nombre"
          placeholder="Filtrar por disco o artista"
          value={texto}
          onChange={(e) => { setTexto(e.target.value); setCuantos(POR_TANDA); }}
        />
      </div>
      {visibles.length === 0 && !cargando ? (
        <p className="vacio-chico">No hay discos con esos filtros.</p>
      ) : (
        <ul className="grilla-discos">
          {visibles.slice(0, cuantos).map((x) => {
            const arch = albumPorTitulo(x.nombre);
            const delArtista = arch && arch.artista === x.artistaId ? arch : undefined;
            return (
              <li key={x.id}>
                <a href={delArtista ? link('albumes', delArtista.id) : link('albumes', 'sp', x.id)}>
                  {x.tapa ? <img className="imagen-wiki" src={x.tapa} alt="" loading="lazy" /> : <span className="imagen-wiki imagen-respaldo" />}
                  <span className="grilla-titulo">{delArtista ? '★ ' : ''}{x.nombre}</span>
                  <span className="grilla-anio">
                    <span className={`muestra costa-${x.costa}`} /> {x.artistaNombre}{x.anio ? ` · ${x.anio}` : ''}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      {visibles.length > cuantos && (
        <p className="ver-mas">
          <button type="button" className="btn" onClick={() => setCuantos((n) => n + POR_TANDA)}>
            Ver más discos ({visibles.length - cuantos} más)
          </button>
        </p>
      )}
    </section>
  );
}

export default function Albumes() {
  const [costa, setCosta] = useState('');
  const todos = useTodosLosDiscos();
  const visibles = useMemo(() => ALBUMES.filter((d) => !costa || d.costa === costa), [costa]);
  // Cuenta discos por costa (los de Spotify si ya llegaron; si no, los del archivo).
  const fuente = todos.discos.length ? todos.discos : ALBUMES;
  const conteo = useMemo(() => {
    const c = {};
    fuente.forEach((d) => (c[d.costa] = (c[d.costa] ?? 0) + 1));
    return c;
  }, [fuente]);

  return (
    <div className="pagina">
      <Migas pasos={[{ nombre: 'Inicio', href: link() }, { nombre: 'Álbumes' }]} />
      <header className="encabezado-seccion">
        <h1 className="titulo-seccion">Álbumes</h1>
        <p>Todos los discos de los artistas del archivo, más un buscador para cualquier otro. Los clásicos tienen su ficha completa.</p>
      </header>
      <div className="con-selector">
        <div>
          <TodosLosDiscos costa={costa} todos={todos} />
          <BuscarDiscos />
          <h2 className="subtitulo-lista">Fichas completas del archivo</h2>
          <div className="lista-fichas">
            {visibles.map((d) => (
              <FichaAlbum key={d.id} d={d} />
            ))}
          </div>
        </div>
        <SelectorCosta valor={costa} onCambiar={setCosta} conteo={conteo} total={fuente.length} />
      </div>
    </div>
  );
}
