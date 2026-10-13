import { useMemo, useState } from 'react';
import BuscarDiscos from '../components/BuscarDiscos';
import ImagenWiki from '../components/ImagenWiki';
import { Migas } from '../components/Nav';
import { Dato } from '../components/Recuadros';
import SelectorCosta from '../components/SelectorCosta';
import { ALBUMES, autorDe } from '../data/archivo';
import { nombreCosta } from '../data/constantes';
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

export default function Albumes() {
  const [costa, setCosta] = useState('');
  const visibles = useMemo(() => ALBUMES.filter((d) => !costa || d.costa === costa), [costa]);
  const conteo = useMemo(() => {
    const c = {};
    ALBUMES.forEach((d) => (c[d.costa] = (c[d.costa] ?? 0) + 1));
    return c;
  }, []);

  return (
    <div className="pagina">
      <Migas pasos={[{ nombre: 'Inicio', href: link() }, { nombre: 'Álbumes' }]} />
      <header className="encabezado-seccion">
        <h1 className="titulo-seccion">Álbumes</h1>
        <p>Los discos que definieron el sonido, ordenados por año: de Criminal Minded (1987) a good kid, m.A.A.d city (2012).</p>
      </header>
      <BuscarDiscos />
      <h2 className="subtitulo-lista">Los clásicos del archivo</h2>
      <div className="con-selector">
        <div className="lista-fichas">
          {visibles.map((d) => (
            <FichaAlbum key={d.id} d={d} />
          ))}
        </div>
        <SelectorCosta valor={costa} onCambiar={setCosta} conteo={conteo} total={ALBUMES.length} />
      </div>
    </div>
  );
}
