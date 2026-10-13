import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AlbumForm from './components/AlbumForm';
import AlbumList from './components/AlbumList';
import Aviso from './components/Aviso';
import CajonVacio from './components/CajonVacio';
import Filtros from './components/Filtros';
import LineaDeTiempo from './components/LineaDeTiempo';
import { CATALOGO } from './data/catalogo';
import { normalizar } from './data/constantes';
import { firebaseConfigurado } from './firebase';
import {
  actualizarAlbum,
  agregarAlbum,
  cargarCatalogo,
  eliminarAlbum,
  escucharAlbums,
  iniciarSesion,
} from './services/albums';

const SIN_FILTROS = { texto: '', costa: '', estado: '', anio: null };

export default function App() {
  const [uid, setUid] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [filtros, setFiltros] = useState(SIN_FILTROS);
  const [formAbierto, setFormAbierto] = useState(false);
  const formRef = useRef(null);

  // 1) Inicia sesión anónima. 2) Escucha los discos del usuario en tiempo real.
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
            setErrorCarga('No se pudieron cargar los discos. Revisá la conexión y recargá la página.');
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

  function abrirForm() {
    setFormAbierto(true);
    setTimeout(() => formRef.current?.querySelector('input')?.focus(), 0);
  }

  const visibles = useMemo(() => {
    const q = filtros.texto.trim().toLowerCase();
    return albums.filter(
      (a) =>
        (!filtros.costa || a.coast === filtros.costa) &&
        (!filtros.estado || a.status === filtros.estado) &&
        (!filtros.anio || a.year === filtros.anio) &&
        (!q ||
          a.title.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q) ||
          a.tracks.some((t) => t.title.toLowerCase().includes(q))),
    );
  }, [albums, filtros]);

  const conteoCostas = useMemo(() => {
    const c = {};
    albums.forEach((a) => (c[a.coast] = (c[a.coast] ?? 0) + 1));
    return c;
  }, [albums]);

  const escuchados = albums.filter((a) => a.status === 'escuchado').length;
  const vacio = !cargando && !errorCarga && albums.length === 0;

  return (
    <div className="pagina">
      <header className="cabecera">
        <div className="marca">
          <h1>Crate</h1>
          <p>Tu cajón de rap gangster de Estados Unidos, 1980–2016.</p>
        </div>
        {albums.length > 0 && (
          <p className="contador">
            <strong>{albums.length}</strong> {albums.length === 1 ? 'disco' : 'discos'}
            <br />
            <strong>{escuchados}</strong> {escuchados === 1 ? 'escuchado' : 'escuchados'}
          </p>
        )}
      </header>

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
          <span className="leyenda-ayuda">Tocá un año para filtrarlo.</span>
        </p>
      </section>

      <main className="contenido">
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
                onCargarCatalogo={() =>
                  ejecutar(
                    () => cargarCatalogo(uid, CATALOGO),
                    `${CATALOGO.length} discos cargados.`,
                    'No se pudo cargar el catálogo. Probá de nuevo.',
                  )
                }
              />
            )}

            {!vacio && (
              <div className="barra">
                <Filtros filtros={filtros} onCambiar={setFiltros} conteoCostas={conteoCostas} />
                {!formAbierto && (
                  <button type="button" className="btn btn-primario" onClick={abrirForm}>
                    Agregar disco
                  </button>
                )}
              </div>
            )}

            {formAbierto && (
              <section className="panel-form" aria-labelledby="titulo-agregar" ref={formRef}>
                <h2 id="titulo-agregar">Agregar disco</h2>
                <AlbumForm
                  deshabilitado={!uid}
                  onCancelar={() => setFormAbierto(false)}
                  onGuardar={(datos) =>
                    ejecutar(
                      () => agregarAlbum(uid, { ...datos, status: 'pendiente', rating: 0, tracks: [] }),
                      `“${datos.title}” agregado.`,
                      'No se pudo agregar el disco. Probá de nuevo.',
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
                onLimpiarFiltros={() => setFiltros(SIN_FILTROS)}
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
                    `“${album.title}” eliminado.`,
                    'No se pudo eliminar el disco.',
                  )
                }
              />
            )}
          </>
        )}
      </main>

      <footer className="pie">
        <p>Tus discos se guardan en Firebase y solo los ves vos, en este navegador.</p>
      </footer>

      <Aviso aviso={aviso} onCerrar={cerrarAviso} />
    </div>
  );
}
