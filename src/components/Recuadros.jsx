// Recuadros del pie de cada ficha: el dato destacado y la cita (si hay una verificada).

export function Dato({ texto, fuente }) {
  return (
    <div className="recuadro recuadro-dato">
      <p className="recuadro-titulo">Dato</p>
      <p>{texto}</p>
      {fuente && (
        <a className="recuadro-fuente" href={fuente} target="_blank" rel="noreferrer">
          Fuente
        </a>
      )}
    </div>
  );
}

export function Cita({ cita }) {
  if (!cita) return null;
  return (
    <figure className="recuadro recuadro-cita">
      <blockquote lang="en">“{cita.original}”</blockquote>
      <p className="cita-es">{cita.es}</p>
      <figcaption>
        {cita.contexto}.{' '}
        <a href={cita.fuente} target="_blank" rel="noreferrer">
          Fuente
        </a>
      </figcaption>
    </figure>
  );
}
