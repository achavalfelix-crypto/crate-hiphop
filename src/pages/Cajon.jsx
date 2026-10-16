import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AgregarRapido from '../components/AgregarRapido';
import AlbumForm from '../components/AlbumForm';
import AlbumList from '../components/AlbumList';
import Aviso from '../components/Aviso';
import BotonImportar from '../components/BotonImportar';
import CajonVacio from '../components/CajonVacio';
import Filtros from '../components/Filtros';
import TabsCajon from '../components/playlists/TabsCajon';
import LineaDeTiempo from '../components/LineaDeTiempo';
import { CATALOGO } from '../data/catalogo';
import { normalizar } from '../data/constantes';
import { prepararImportacion } from '../data/importar';
import useVideosFaltantes from '../hooks/useVideosFaltantes';
import useYouTube from '../hooks/useYouTube';
import { firebaseConfigurado } from '../firebase';
import {
  actualizarAlbum,
  agregarAlbum,
  cargarCatalogo,
  eliminarAlbum,
  escucharAlbums,
  iniciarSesion,
} from '../services/albums';

const SIN_FILTROS = { texto: '', tipo: '', costa: '', estado: '', anio: null };

export default function Cajon() {
  const [uid, setUid] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [filtros, setFiltros] = useState(SIN_FILTROS);
  const [formAbierto, setFormAbierto] = useState(false);
  const formRef = useRef(null);

  // 1) Inicia sesión anónima. 2) Escucha los discos y canciones del usuario en tiempo real.
  useEffect(() => {
    let cortar = () => {};
    iniciarSesion()
      .then((id) => {
        setUid(id);
        cortar = escucharAlbums(
          id,
          (datos) => {
            setAlbums(datos.map(normalizar));
            setCargando(false);
          },
          () => {
            setErrorCarga('No se pudo cargar tu cajón. Revisá la conexión y recargá la página.');
            setCargando(false);
          },
        );
      })
      .catch((err) => {
        console.error(err);
        setErrorCarga(
          firebaseConfigurado
            ? 'No se pudo conectar con Firebase. Revisá que la autenticación anónima esté habilitada.'
            : 'Falta configurar Firebase: completá las variables VITE_FIREBASE_* (.env en local, Environment Variables en Vercel).',
        );
        setCargando(false);
      });
    return () => cortar();
  }, []);

  // Ejecuta una operación de Firestore y muestra el resultado. Devuelve true si salió bien.
  async function ejecutar(operacion, exito, error) {
    try {
      await operacion();
      setAviso({ tipo: 'ok', texto: exito });
      return true;
    } catch (err) {
      console.error(err);
      setAviso({ tipo: 'error', texto: error });
      return false;
    }
  }

  const cerrarAviso = useCallback(() => setAviso(null), []);

  // IMPORTAR: lee un archivo JSON, descarta repetidos e inválidos y guarda el resto.
  async function importar(archivo) {
    let resultado;
    try {
      resultado = await prepararImportacion(archivo, albums);
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
      return;
    }
    const { nuevas, repetidas, invalidas } = resultado;
    const extra = [repetidas && `${repetidas} ya estaban`, invalidas && `${invalidas} con datos inválidos`]
      .filter(Boolean)
      .join(', ');
    if (nuevas.length === 0) {
      setAviso({ tipo: 'error', texto: `No hay nada nuevo para importar${extra ? ` (${extra})` : ''}.` });
      return;
    }
    await ejecutar(
      () => cargarCatalogo(uid, nuevas),
      `${nuevas.length} importados${extra ? `; ${extra}` : ''}.`,
      'No se pudo importar el archivo. Probá de nuevo.',
    );
  }

  function abrirForm() {
    setFormAbierto(true);
    setTimeout(() => formRef.current?.querySelector('input')?.focus(), 0);
  }

  const visibles = useMemo(() => {
    const q = filtros.texto.trim().toLowerCase();
    return albums.filter(
      (a) =>
        (!filtros.tipo || a.type === filtros.tipo) &&
        (!filtros.costa || a.coast === filtros.costa) &&
        (!filtros.estado || a.status === filtros.estado) &&
        (!filtros.anio || a.year === filtros.anio) &&
        (!filtros.favoritas || a.favorita || a.tracks.some((t) => t.fav)) &&
        (!q ||
          a.title.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q) ||
          a.album.toLowerCase().includes(q) ||
          a.tracks.some((t) => t.title.toLowerCase().includes(q))),
    );
  }, [albums, filtros]);

  const conteoCostas = useMemo(() => {
    const c = {};
    albums.forEach((a) => (c[a.coast] = (c[a.coast] ?? 0) + 1));
    return c;
  }, [albums]);

  const conteoTipos = useMemo(() => {
    const c = {};
    albums.forEach((a) => (c[a.type] = (c[a.type] ?? 0) + 1));
    return c;
  }, [albums]);

  const discos = conteoTipos.album ?? 0;
  const canciones = conteoTipos.cancion ?? 0;
  const escuchados = albums.filter((a) => a.status === 'escuchado').length;

  // Videos de YouTube de las canciones sueltas y de las canciones de cada disco.
  const videoIds = useMemo(
    () => albums.flatMap((a) => [a.videoId, ...a.tracks.map((t) => t.videoId)]).filter(Boolean),
    [albums],
  );
  const youtube = useYouTube(videoIds);
  const cuotaYouTube = useVideosFaltantes(uid, albums);
  const vacio = !cargando && !errorCarga && albums.length === 0;

  return (
    <div className="pagina pagina-cajon">
      <header className="cabecera">
        <div className="marca">
          <h1 className="titulo-seccion">Mi cajón</h1>
          <p>Tus discos y canciones de la era dorada: lo que escuchaste, lo que te falta y lo que más te gustó.</p>
        </div>
        {albums.length > 0 && (
          <ul className="stats-cajon" aria-label="Resumen del cajón">
            <li><strong>{discos}</strong> {discos === 1 ? 'disco' : 'discos'}</li>
            <li><strong>{canciones}</strong> {canciones === 1 ? 'canción' : 'canciones'}</li>
            <li><strong>{escuchados}</strong> {escuchados === 1 ? 'escuchado' : 'escuchados'}</li>
          </ul>
        )}
      </header>

      <TabsCajon activa="coleccion" />
      {cuotaYouTube === 'sin-cuota' && (
        <p className="nota-fuente">
          Por hoy se terminaron las búsquedas gratis de YouTube: las reproducciones de lo que agregues aparecen mañana.
        </p>
      )}

      <section className="seccion-linea" aria-label="Línea de tiempo por año">
        <LineaDeTiempo
          albums={albums}
          anioActivo={filtros.anio}
          onElegirAnio={(anio) => setFiltros({ ...filtros, anio })}
        />
        <p className="leyenda-estado">
          <span className="bloque-muestra estado-escuchado" /> Escuchado
          <span className="bloque-muestra estado-escuchando" /> Escuchando
          <span className="bloque-muestra estado-pendiente" /> Por escuchar
          <span className="leyenda-ayuda">Cada barrita es un disco o canción, del color de su costa. Tocá un año para filtrarlo.</span>
        </p>
      </section>

      <div className="contenido">
        {cargando ? (
          <p className="cargando" role="status">
            Abriendo tu cajón…
          </p>
        ) : errorCarga ? (
          <p className="error-carga" role="alert">
            {errorCarga}
          </p>
        ) : (
          <>
            {vacio && !formAbierto && (
              <CajonVacio
                cantidad={CATALOGO.length}
                onAgregarAMano={abrirForm}
                onImportar={importar}
                onCargarCatalogo={() =>
                  ejecutar(
                    () => cargarCatalogo(uid, CATALOGO),
                    `${CATALOGO.length} discos cargados.`,
                    'No se pudo cargar el catálogo. Probá de nuevo.',
                  )
                }
              />
            )}

            {uid && (
              <AgregarRapido
                onAMano={abrirForm}
                extra={<BotonImportar onArchivo={importar} className="btn-texto" />}
                yaEsta={(item, tipo) =>
                  albums.some(
                    (a) =>
                      a.spotifyId === item.id ||
                      (a.type === tipo && a.title.toLowerCase() === item.nombre.toLowerCase() && a.artist.toLowerCase() === item.artista.toLowerCase()),
                  )
                }
                onAgregar={(datos) =>
                  ejecutar(
                    () => agregarAlbum(uid, { ...datos, status: 'pendiente', rating: 0 }),
                    `“${datos.title}” ${datos.type === 'cancion' ? 'agregada' : 'agregado'} a tu cajón.`,
                    'No se pudo agregar. Probá de nuevo.',
                  )
                }
              />
            )}

            {!vacio && (
              <div className="barra">
                <Filtros
                  filtros={filtros}
                  onCambiar={setFiltros}
                  conteoCostas={conteoCostas}
                  conteoTipos={conteoTipos}
                />
              </div>
            )}

            {formAbierto && (
              <section className="panel-form" aria-labelledby="titulo-agregar" ref={formRef}>
                <h2 id="titulo-agregar">Agregar al cajón</h2>
                <AlbumForm
                  deshabilitado={!uid}
                  onCancelar={() => setFormAbierto(false)}
                  onGuardar={(datos) =>
                    ejecutar(
                      () => agregarAlbum(uid, { ...datos, status: 'pendiente', rating: 0, tracks: [] }),
                      `“${datos.title}” ${datos.type === 'cancion' ? 'agregada' : 'agregado'}.`,
                      'No se pudo agregar. Probá de nuevo.',
                    )
                  }
                />
              </section>
            )}

            {filtros.anio && (
              <p className="filtro-anio">
                Mostrando {filtros.anio}.{' '}
                <button type="button" className="btn-texto" onClick={() => setFiltros({ ...filtros, anio: null })}>
                  Ver todos los años
                </button>
              </p>
            )}

            {!vacio && (
              <AlbumList
                albums={visibles}
                yt={youtube.datos}
                onLimpiarFiltros={() => setFiltros(SIN_FILTROS)}
                onTapa={(album, tapa) => actualizarAlbum(uid, album, { tapa: tapa.slice(0, 300) }).catch(() => {})}
                onActualizar={(album, cambios) =>
                  ejecutar(
                    () => actualizarAlbum(uid, album, cambios),
                    'Cambios guardados.',
                    'No se pudieron guardar los cambios.',
                  )
                }
                onEliminar={(album) =>
                  ejecutar(
                    () => eliminarAlbum(uid, album.id),
                    `“${album.title}” ${album.type === 'cancion' ? 'eliminada' : 'eliminado'}.`,
                    'No se pudo eliminar.',
                  )
                }
              />
            )}
          </>
        )}
      </div>

      <footer className="pie">
        <p>Tus discos y canciones se guardan en Firebase y solo los ves vos, en este navegador.</p>
        {youtube.actualizado && (
          <p>
            Duración y reproducciones de YouTube, actualizadas a las{' '}
            {youtube.actualizado.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
            {' '}(se actualizan cada minuto).
          </p>
        )}
      </footer>

      <Aviso aviso={aviso} onCerrar={cerrarAviso} />
    </div>
  );
}
