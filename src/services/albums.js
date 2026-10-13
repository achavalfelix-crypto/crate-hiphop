// Todas las operaciones con la base de datos están en este archivo.
// Cada visitante entra con un usuario anónimo y sus discos se guardan en:
//   users/{uid}/albums/{albumId}
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// Inicia sesión anónima (si hace falta) y devuelve el uid del visitante.
export function iniciarSesion() {
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

// CONSULTAR: escucha la colección en tiempo real.
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
  });
}

// MODIFICAR
export function actualizarAlbum(uid, id, cambios) {
  return updateDoc(albumRef(uid, id), cambios);
}

// ELIMINAR
export function eliminarAlbum(uid, id) {
  return deleteDoc(albumRef(uid, id));
}
