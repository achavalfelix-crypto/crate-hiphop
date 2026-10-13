import { useMemo, useState } from 'react';
import ImagenWiki from '../components/ImagenWiki';
import { Migas } from '../components/Nav';
import { Cita, Dato } from '../components/Recuadros';
import SelectorCosta from '../components/SelectorCosta';
import { ARTISTAS } from '../data/archivo';
import { nombreCosta } from '../data/constantes';
import useWiki from '../hooks/useWiki';
import { link } from '../hooks/useRuta';

function FichaArtista({ a }) {
  const { estado, datos } = useWiki(a.wiki);
  return (
    <article className="ficha">
      <a className="ficha-imagen" href={link('artistas', a.id)} tabIndex={-1} aria-hidden="true">
        <ImagenWiki wiki={a.wiki} alt="" respaldo={{ title: a.nombre, coast: a.costa, year: '' }} />
      </a>
      <div className="ficha-cuerpo">
        <h2>
          <a href={link('artistas', a.id)}>{a.nombre}</a>
        </h2>
        <p className="ficha-meta">
          <span className={`muestra costa-${a.costa}`} />
          {nombreCosta(a.costa)} · {a.nacimiento}
        </p>
        <p className="ficha-texto">
          {estado === 'listo' ? datos.texto : estado === 'cargando' ? 'Cargando biografía…' : a.dato}
        </p>
        <a className="ficha-mas" href={link('artistas', a.id)}>
          Ver ficha completa
        </a>
      </div>
      <div className="ficha-pie">
        <Dato texto={a.dato} fuente={a.fuente} />
        <Cita cita={a.cita} />
      </div>
    </article>
  );
}

export default function Artistas() {
  const [costa, setCosta] = useState('');
  const visibles = useMemo(() => ARTISTAS.filter((a) => !costa || a.costa === costa), [costa]);
  const conteo = useMemo(() => {
    const c = {};
    ARTISTAS.forEach((a) => (c[a.costa] = (c[a.costa] ?? 0) + 1));
    return c;
  }, []);

  return (
    <div className="pagina">
      <Migas pasos={[{ nombre: 'Inicio', href: link() }, { nombre: 'Artistas' }]} />
      <header className="encabezado-seccion">
        <h1 className="titulo-seccion">Artistas</h1>
        <p>Quiénes son, de dónde vienen y qué lograron los nombres que hicieron la era dorada.</p>
      </header>
      <div className="con-selector">
        <div className="lista-fichas">
          {visibles.map((a) => (
            <FichaArtista key={a.id} a={a} />
          ))}
        </div>
        <SelectorCosta valor={costa} onCambiar={setCosta} conteo={conteo} total={ARTISTAS.length} />
      </div>
    </div>
  );
}
