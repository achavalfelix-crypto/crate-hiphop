import { useCallback, useEffect, useMemo, useState } from 'react';
import AlbumForm from './components/AlbumForm';
import AlbumList from './components/AlbumList';
import Aviso from './components/Aviso';
import Filtros from './components/Filtros';
import { normalizar } from './data/constantes';
import {
  actualizarAlbum,
  agregarAlbum,
  eliminarAlbum,
  escucharAlbums,
  iniciarSesion,
} from './services/albums';

export default function App() {
  const [uid, setUid] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [filtros, setFiltros] = useState({ costa: '', estado: '' });

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
      .catch(() => {
        setErrorCarga('No se pudo conectar con Firebase. Revisá la configuración del proyecto.');
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

  const visibles = useMemo(
    () =>
      albums.filter(
        (a) =>
          (!filtros.costa || a.coast === filtros.costa) &&
          (!filtros.estado || a.status === filtros.estado),
      ),
    [albums, filtros],
  );

  return (
    <main className="app">
      <header>
        <h1>Crate</h1>
        <p>Rap gangster de Estados Unidos, 1980–2016</p>
      </header>

      <section aria-labelledby="titulo-agregar">
        <h2 id="titulo-agregar">Agregar disco</h2>
        <AlbumForm
          deshabilitado={!uid}
          onGuardar={(datos) =>
            ejecutar(
              () => agregarAlbum(uid, { ...datos, status: 'pendiente', rating: 0, tracks: [] }),
              `“${datos.title}” agregado.`,
              'No se pudo agregar el disco. Probá de nuevo.',
            )
          }
        />
      </section>

      <section aria-labelledby="titulo-discos">
        <h2 id="titulo-discos">Tus discos</h2>
        <Filtros filtros={filtros} onCambiar={setFiltros} />
        {cargando ? (
          <p className="cargando">Cargando discos…</p>
        ) : errorCarga ? (
          <p className="error">{errorCarga}</p>
        ) : (
          <AlbumList
            albums={visibles}
            hayFiltros={Boolean(filtros.costa || filtros.estado)}
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
      </section>

      <Aviso aviso={aviso} onCerrar={cerrarAviso} />
    </main>
  );
}
