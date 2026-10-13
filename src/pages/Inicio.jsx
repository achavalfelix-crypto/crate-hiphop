import ImagenWiki from '../components/ImagenWiki';
import { NOMBRE } from '../components/Nav';
import { ALBUMES, albumPorId } from '../data/archivo';
import { link } from '../hooks/useRuta';

// Capítulos del recorrido. Cada dato está verificado en src/data/archivo.js.
const CAPITULOS = [
  {
    anios: '1987–1989',
    titulo: 'La calle toma el micrófono',
    texto:
      'En el Bronx, Boogie Down Productions pone armas en la tapa de un disco por primera vez. En Compton, N.W.A convierte su barrio en el primer álbum de gangsta rap en llegar a disco de platino. El rap deja de pedir permiso.',
    discos: ['criminal-minded', 'straight-outta-compton'],
  },
  {
    anios: '1992–1993',
    titulo: 'El oeste encuentra su sonido',
    texto:
      'Dr. Dre baja el tempo, sube los graves y crea el G-funk. Un año después, Snoop Dogg vende 806.858 copias en su primera semana: nunca un debutante había vendido tanto.',
    discos: ['the-chronic', 'doggystyle'],
  },
  {
    anios: '1993–1994',
    titulo: 'Nueva York contesta',
    texto:
      'Wu-Tang Clan, Nas y The Notorious B.I.G. devuelven el centro a la costa este con tres discos que hoy guarda la Biblioteca del Congreso de Estados Unidos.',
    discos: ['enter-the-wu-tang', 'illmatic', 'ready-to-die'],
  },
  {
    anios: '1996–1997',
    titulo: 'La rivalidad y la pérdida',
    texto:
      'En seis meses, el género pierde a sus dos voces más grandes. All Eyez on Me llega a disco de diamante; Life After Death sale dieciséis días después del asesinato de Biggie.',
    discos: ['all-eyez-on-me', 'life-after-death'],
  },
  {
    anios: '2003–2012',
    titulo: 'El legado',
    texto:
      'Lo que empezó en la calle llegó a lo más alto: 50 Cent tuvo el álbum más vendido de 2003 en Estados Unidos y Kendrick Lamar, nacido en Compton, terminó ganando un Premio Pulitzer.',
    discos: ['get-rich-or-die-tryin', 'good-kid-maad-city'],
  },
];

function Tapa({ id }) {
  const d = albumPorId(id);
  return (
    <a className="capitulo-tapa" href={link('albumes', d.id)}>
      <ImagenWiki wiki={d.wiki} alt={`Tapa de ${d.titulo}`} respaldo={{ title: d.titulo, coast: d.costa, year: d.anio }} />
      <span>
        {d.titulo} <small>{d.anio}</small>
      </span>
    </a>
  );
}

export default function Inicio() {
  return (
    <>
      <section className="portada-hero" aria-label={NOMBRE}>
        <div className="collage" aria-hidden="true">
          {ALBUMES.map((d) => (
            <ImagenWiki key={d.id} wiki={d.wiki} alt="" respaldo={{ title: d.titulo, coast: d.costa, year: d.anio }} />
          ))}
        </div>
        <div className="hero-texto">
          <h1 className="hero-titulo">{NOMBRE}</h1>
          <p>Treinta años de rap que salió de la calle y cambió la música. Todo en un solo lugar.</p>
        </div>
      </section>

      <div className="pagina">
        <section className="proposito" aria-labelledby="t-proposito">
          <h2 id="t-proposito" className="titulo-seccion">
            Escuchás estos discos. Ahora conocé su historia.
          </h2>
          <div className="proposito-texto">
            <p>
              {NOMBRE} es un archivo del rap que nació en las calles de Estados Unidos entre 1980 y 2016. Está hecho para
              quienes escucharon a Dr. Dre, a Nas o a 2Pac, les gustó y se quedaron con ganas de saber más: quiénes eran, de dónde
              salieron, qué ganaron y por qué esos discos todavía suenan.
            </p>
            <p>
              Acá recorrés a los artistas y los álbumes que definieron la época, leés su historia con fuentes reales y
              armás tu propio cajón con lo que escuchaste y lo que te falta.
            </p>
          </div>
          <ul className="puertas">
            <li>
              <a href={link('artistas')}>
                <strong>Artistas</strong>
                <span>Su vida, sus premios y lo que dijeron.</span>
              </a>
            </li>
            <li>
              <a href={link('albumes')}>
                <strong>Álbumes</strong>
                <span>Los discos que definieron cada costa.</span>
              </a>
            </li>
            <li>
              <a href={link('cajon')}>
                <strong>Mi cajón</strong>
                <span>Lo que escuchaste, lo que te falta y tus favoritos.</span>
              </a>
            </li>
          </ul>
        </section>

        <section className="recorrido" aria-labelledby="t-recorrido">
          <h2 id="t-recorrido" className="titulo-seccion">
            Por qué la era dorada
          </h2>
          {CAPITULOS.map((c, i) => (
            <article key={c.titulo} className={`capitulo ${i % 2 ? 'capitulo-inverso' : ''}`}>
              <div className="capitulo-texto">
                <p className="capitulo-anios">{c.anios}</p>
                <h3>{c.titulo}</h3>
                <p>{c.texto}</p>
              </div>
              <div className="capitulo-tapas">
                {c.discos.map((id) => (
                  <Tapa key={id} id={id} />
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="cierre">
          <h2 className="titulo-seccion">Tu turno.</h2>
          <p>Empezá por un artista, un disco o armando tu cajón.</p>
          <div className="cierre-acciones">
            <a className="btn btn-primario" href={link('artistas')}>
              Explorar artistas
            </a>
            <a className="btn" href={link('historia')}>
              Ver la historia completa
            </a>
            <a className="btn" href={link('cajon')}>
              Armar mi cajón
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
