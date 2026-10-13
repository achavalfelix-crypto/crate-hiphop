import { useEffect, useState } from 'react';
import AlbumForm from './components/AlbumForm';
import AlbumList from './components/AlbumList';
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
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    let cortar = () => {};
    iniciarSesion()
      .then((id) => {
        setUid(id);
        cortar = escucharAlbums(
          id,
          (datos) => {
            setAlbums(datos);
            setCargando(false);
          },
          () => {
            setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los discos.' });
            setCargando(false);
          },
        );
      })
      .catch(() => {
        setMensaje({ tipo: 'error', texto: 'No se pudo conectar con Firebase.' });
        setCargando(false);
      });
    return () => cortar();
  }, []);

  async function ejecutar(promesa, exito, error) {
    try {
      await promesa;
      setMensaje({ tipo: 'ok', texto: exito });
    } catch {
      setMensaje({ tipo: 'error', texto: error });
    }
  }

  return (
    <main className="app">
      <h1>Crate</h1>
      <p>Rap gangster de Estados Unidos, 1980–2016</p>

      {mensaje && <p className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</p>}

      <AlbumForm
        deshabilitado={!uid}
        onAgregar={(datos) =>
          ejecutar(agregarAlbum(uid, datos), 'Disco agregado.', 'No se pudo agregar el disco.')
        }
      />

      {cargando ? (
        <p>Cargando discos…</p>
      ) : (
        <AlbumList
          albums={albums}
          onCambiarEstado={(a) =>
            ejecutar(
              actualizarAlbum(uid, a.id, { escuchado: !a.escuchado }),
              'Estado actualizado.',
              'No se pudo actualizar.',
            )
          }
          onEliminar={(a) =>
            ejecutar(eliminarAlbum(uid, a.id), 'Disco eliminado.', 'No se pudo eliminar.')
          }
        />
      )}
    </main>
  );
}
