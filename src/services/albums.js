// Todas las operaciones con la base de datos están en este archivo.
// Cada visitante entra con un usuario anónimo y sus discos se guardan en:
//   users/{uid}/albums/{albumId}
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// Inicia sesión anónima (si hace falta) y devuelve el uid del visitante.
export function iniciarSesion() {
  if (!auth) return Promise.reject(new Error('Faltan las variables VITE_FIREBASE_*'));
  return new Promise((resolve, reject) => {
    const cortar = onAuthStateChanged(
      auth,
      async (user) => {
        cortar();
        try {
          if (user) return resolve(user.uid);
          const cred = await signInAnonymously(auth);
          resolve(cred.user.uid);
        } catch (err) {
          reject(err);
        }
      },
      reject,
    );
  });
}

const albumsRef = (uid) => collection(db, 'users', uid, 'albums');
const albumRef = (uid, id) => doc(db, 'users', uid, 'albums', id);

// CONSULTAR: escucha la colección en tiempo real, ordenada por año.
export function escucharAlbums(uid, onDatos, onError) {
  const q = query(albumsRef(uid), orderBy('year', 'asc'));
  return onSnapshot(
    q,
    (snap) => onDatos(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  );
}

// AGREGAR
export function agregarAlbum(uid, datos) {
  return addDoc(albumsRef(uid), {
    ...datos,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// MODIFICAR: recibe la entrada completa (disco o canción) y los cambios.
// Se reescriben todos los campos para que lo guardado con versiones anteriores quede con el formato nuevo.
export function actualizarAlbum(uid, album, cambios) {
  const { type, album: deAlbum, title, artist, year, coast, status, rating, tracks } = album;
  return updateDoc(albumRef(uid, album.id), {
    type,
    album: deAlbum,
    title,
    artist,
    year,
    coast,
    status,
    rating,
    tracks,
    ...cambios,
    escuchado: deleteField(), // campo viejo de la v1
    updatedAt: serverTimestamp(),
  });
}

// AGREGAR VARIOS: carga el catálogo inicial en una sola operación (todo o nada).
export function cargarCatalogo(uid, lista) {
  const lote = writeBatch(db);
  lista.forEach((datos) => {
    lote.set(doc(albumsRef(uid)), {
      ...datos,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  return lote.commit();
}

// ELIMINAR
export function eliminarAlbum(uid, id) {
  return deleteDoc(albumRef(uid, id));
}
