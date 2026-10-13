// Playlists de cada visitante en Firestore:
//   users/{uid}/playlists/{playlistId} = { nombre, descripcion, canciones: [...], createdAt, updatedAt }
// Cada canción: { clave, titulo, artista, disco, anio, costa, spotifyId, videoId }
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
import { db } from '../firebase';

export const MAX_CANCIONES = 100;

const ref = (uid) => collection(db, 'users', uid, 'playlists');

// Deja solo los campos que se guardan y saca repetidas (misma canción del mismo artista).
export function limpiarCanciones(lista) {
  const vistas = new Set();
  const salida = [];
  for (const c of lista) {
    const clave = c.clave ?? claveCancion(c);
    if (vistas.has(clave)) continue;
    vistas.add(clave);
    salida.push({
      clave,
      titulo: String(c.titulo ?? '').slice(0, 120),
      artista: String(c.artista ?? '').slice(0, 80),
      disco: String(c.disco ?? '').slice(0, 120),
      anio: Number(c.anio) || 0,
      costa: c.costa ?? '',
      spotifyId: c.spotifyId ?? '',
      videoId: c.videoId ?? '',
    });
    if (salida.length >= MAX_CANCIONES) break;
  }
  return salida;
}

export const claveCancion = (c) =>
  `${c.titulo}|${c.artista}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9|]/g, '');

export function escucharPlaylists(uid, onDatos, onError) {
  return onSnapshot(
    query(ref(uid), orderBy('createdAt', 'desc')),
    (snap) => onDatos(snap.docs.map((d) => ({ id: d.id, descripcion: '', canciones: [], ...d.data() }))),
    onError,
  );
}

export async function crearPlaylist(uid, { nombre, descripcion = '', canciones = [] }) {
  const r = await addDoc(ref(uid), {
    nombre: nombre.trim().slice(0, 60) || 'Mi playlist',
    descripcion: descripcion.slice(0, 200),
    canciones: limpiarCanciones(canciones),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return r.id;
}

export function actualizarPlaylist(uid, id, cambios) {
  const datos = { ...cambios, updatedAt: serverTimestamp() };
  if (datos.canciones) datos.canciones = limpiarCanciones(datos.canciones);
  if (datos.nombre !== undefined) datos.nombre = datos.nombre.trim().slice(0, 60) || 'Mi playlist';
  if (datos.descripcion !== undefined) datos.descripcion = datos.descripcion.slice(0, 200);
  return updateDoc(doc(db, 'users', uid, 'playlists', id), datos);
}

export function eliminarPlaylist(uid, id) {
  return deleteDoc(doc(db, 'users', uid, 'playlists', id));
}
