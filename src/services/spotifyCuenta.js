// "Conectar Spotify": la cuenta de Spotify del visitante, para guardarle playlists.
// Usa el flujo oficial para páginas web (Authorization Code + PKCE): no hay secreto en el navegador.
// En modo desarrollador de Spotify solo funciona para hasta 5 cuentas anotadas en el panel.
import { useSyncExternalStore } from 'react';
import { cancionSpotify } from './spotify';

// Playlists + manejar la app de Spotify como control remoto (para escuchar completo y con la pantalla apagada).
const ALCANCE = 'playlist-modify-private playlist-modify-public user-modify-playback-state user-read-playback-state';
const CLAVE = 'spotify-cuenta:v1';
const CLAVE_CAJON = 'spotify-cuenta:playlist-cajon';
const API = 'https://api.spotify.com/v1';

// ── Estado (sesión guardada en este navegador) ──
let cuenta = leer();
const oyentes = new Set();
function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? null;
  } catch {
    return null;
  }
}
function guardar(c) {
  cuenta = c;
  try {
    if (c) localStorage.setItem(CLAVE, JSON.stringify(c));
    else localStorage.removeItem(CLAVE);
  } catch {
    /* sin localStorage: la sesión dura lo que dure la pestaña */
  }
  oyentes.forEach((f) => f());
}
export function useCuentaSpotify() {
  return useSyncExternalStore(
    (f) => (oyentes.add(f), () => oyentes.delete(f)),
    () => cuenta,
  );
}

// La URL a la que Spotify vuelve: la raíz del sitio (el hash no puede ir en la redirect URI).
const volverA = () => `${window.location.origin}/`;

let clientIdCache = null;
async function clientId() {
  if (clientIdCache) return clientIdCache;
  const r = await fetch('/api/spotify?tipo=config');
  if (!r.ok) throw new Error('Spotify no está configurado en el servidor.');
  clientIdCache = (await r.json()).clientId;
  return clientIdCache;
}

const base64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// 1) Manda a la persona a Spotify para que acepte.
export async function conectarSpotify() {
  const id = await clientId();
  const verificador = base64url(crypto.getRandomValues(new Uint8Array(48)));
  const desafio = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verificador)));
  const estado = base64url(crypto.getRandomValues(new Uint8Array(12)));
  sessionStorage.setItem('spotify-pkce', JSON.stringify({ verificador, estado, hash: window.location.hash }));
  const q = new URLSearchParams({
    client_id: id,
    response_type: 'code',
    redirect_uri: volverA(),
    code_challenge_method: 'S256',
    code_challenge: desafio,
    state: estado,
    scope: ALCANCE,
  });
  window.location.assign(`https://accounts.spotify.com/authorize?${q}`);
}

async function pedirToken(cuerpo) {
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: await clientId(), ...cuerpo }),
  });
  if (!r.ok) throw new Error('Spotify no aceptó la conexión.');
  const j = await r.json();
  return { acceso: j.access_token, renovar: j.refresh_token, vence: Date.now() + j.expires_in * 1000, ...(j.scope ? { alcance: j.scope } : {}) };
}

// 2) Al volver de Spotify (la URL trae ?code=…): cambia el código por el permiso y limpia la URL.
// Devuelve un mensaje de error si algo falló, o '' si salió bien / no había nada que hacer.
export async function completarConexion() {
  const q = new URLSearchParams(window.location.search);
  if (!q.has('code') && !q.has('error')) return '';
  let guardado = {};
  try {
    guardado = JSON.parse(sessionStorage.getItem('spotify-pkce')) ?? {};
  } catch {
    /* nada guardado */
  }
  sessionStorage.removeItem('spotify-pkce');
  window.history.replaceState(null, '', `/${guardado.hash || '#/cajon/playlists'}`);
  window.dispatchEvent(new HashChangeEvent('hashchange')); // que la página muestre la sección donde estaba
  if (q.has('error')) return 'Cancelaste la conexión con Spotify.';
  if (q.get('state') !== guardado.estado) return 'La conexión con Spotify no se pudo verificar. Probá de nuevo.';
  try {
    const t = await pedirToken({
      grant_type: 'authorization_code',
      code: q.get('code'),
      redirect_uri: volverA(),
      code_verifier: guardado.verificador,
    });
    guardar(t);
    const yo = await api('/me');
    guardar({ ...cuenta, nombre: yo.display_name || yo.id });
    return '';
  } catch (e) {
    guardar(null);
    return e.message;
  }
}

export function desconectarSpotify() {
  guardar(null);
  try {
    localStorage.removeItem(CLAVE_CAJON);
  } catch {
    /* nada */
  }
}

async function permiso() {
  if (!cuenta) throw new Error('Conectá tu Spotify primero.');
  if (cuenta.vence > Date.now() + 60_000) return cuenta.acceso;
  const t = await pedirToken({ grant_type: 'refresh_token', refresh_token: cuenta.renovar });
  guardar({ ...cuenta, ...t, renovar: t.renovar ?? cuenta.renovar });
  return cuenta.acceso;
}

async function api(ruta, { method = 'GET', body } = {}) {
  const r = await fetch(API + ruta, {
    method,
    headers: { Authorization: `Bearer ${await permiso()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 403) {
    const cuerpo = await r.json().catch(() => ({}));
    if (/PREMIUM/i.test(cuerpo?.error?.reason ?? '')) {
      throw new Error('Para mandar la música a tu app, Spotify pide una cuenta Premium. Podés abrir el tema en la app con "Abrir en Spotify".');
    }
    throw new Error(
      'Tu cuenta de Spotify no está habilitada en esta demo. Mientras la app esté en modo desarrollador, solo funciona para las cuentas que el dueño anotó (máximo 5).',
    );
  }
  if (r.status === 401) {
    guardar(null);
    throw new Error('Se venció la conexión con Spotify. Conectate de nuevo.');
  }
  if (r.status === 429) throw new Error('Spotify está saturado. Probá en un rato.');
  if (!r.ok) throw new Error(`Spotify respondió ${r.status}.`);
  return r.status === 204 ? null : r.json().catch(() => null);
}

// Consigue el ID de Spotify de cada canción (las que no lo tienen se buscan por título y artista).
async function uris(canciones) {
  const salida = [];
  for (const c of canciones) {
    let id = c.spotifyId;
    if (!id) id = (await cancionSpotify(c.titulo, c.artista).catch(() => null))?.id;
    if (id) salida.push(`spotify:track:${id}`);
  }
  return salida;
}

// 3) Guarda (o actualiza) una playlist en el Spotify de la persona. Devuelve { id, url, faltaron }.
export async function guardarEnSpotify({ nombre, descripcion, canciones, spotifyPlaylistId }) {
  const lista = await uris(canciones);
  let id = spotifyPlaylistId;
  if (id) {
    // Reemplaza el contenido (si la borraron en Spotify, se crea de nuevo).
    try {
      await api(`/playlists/${id}/items`, { method: 'PUT', body: { uris: lista.slice(0, 100) } });
      await api(`/playlists/${id}`, { method: 'PUT', body: { name: nombre, description: descripcion || '' } });
    } catch (e) {
      if (/403|habilitada|venció/.test(e.message)) throw e;
      id = '';
    }
  }
  if (!id) {
    const p = await api('/me/playlists', {
      method: 'POST',
      body: { name: nombre, description: `${descripcion ? descripcion + ' · ' : ''}Armada en The Golden Era Archives`, public: false },
    });
    id = p.id;
    if (lista.length) await api(`/playlists/${id}/items`, { method: 'POST', body: { uris: lista.slice(0, 100) } });
  }
  return { id, url: `https://open.spotify.com/playlist/${id}`, faltaron: canciones.length - lista.length };
}

// 4) Al guardar una canción con el + estando conectado: la suma a la playlist "Mi cajón" de su Spotify.
export async function sumarAlCajonDeSpotify(spotifyId) {
  if (!cuenta || !spotifyId) return;
  let id = null;
  try {
    id = localStorage.getItem(CLAVE_CAJON);
  } catch {
    /* nada */
  }
  const sumar = (pid) => api(`/playlists/${pid}/items`, { method: 'POST', body: { uris: [`spotify:track:${spotifyId}`] } });
  try {
    if (id) return await sumar(id);
  } catch {
    id = null; // la borraron: se crea de nuevo
  }
  const p = await api('/me/playlists', {
    method: 'POST',
    body: { name: 'Mi cajón · The Golden Era Archives', description: 'Lo que fui guardando en The Golden Era Archives', public: false },
  });
  try {
    localStorage.setItem(CLAVE_CAJON, p.id);
  } catch {
    /* nada */
  }
  await sumar(p.id);
}

// ── Control remoto: que suene en la app de Spotify del celu o la compu ──
// Requiere Premium (regla de Spotify). La app sigue sonando con la pantalla apagada.
export const puedeControlar = (c = cuenta) => Boolean(c?.alcance?.includes('user-modify-playback-state'));

const CLAVE_MODO = 'spotify-cuenta:modo-app';
let modoApp = (() => {
  try {
    return localStorage.getItem(CLAVE_MODO) === '1';
  } catch {
    return false;
  }
})();
export function setModoApp(v) {
  modoApp = v;
  try {
    localStorage.setItem(CLAVE_MODO, v ? '1' : '0');
  } catch {
    /* nada */
  }
  oyentes.forEach((f) => f());
}
export const enModoApp = () => modoApp && puedeControlar();
export function useModoApp() {
  return useSyncExternalStore(
    (f) => (oyentes.add(f), () => oyentes.delete(f)),
    () => modoApp && puedeControlar(),
  );
}

export class SinDispositivo extends Error {}

// Manda a sonar: { uris: [...], offset } para temas sueltos o una cola, o { contexto } para disco/artista/playlist.
export async function sonarEnApp({ uris, contexto, offset = 0 }) {
  const cuerpo = contexto ? { context_uri: contexto } : { uris: uris.slice(0, 100), offset: { position: Math.min(offset, 99) } };
  try {
    await api('/me/player/play', { method: 'PUT', body: cuerpo });
  } catch (e) {
    if (!/404/.test(e.message)) throw e;
    // No hay ningún Spotify activo: si hay uno abierto en algún dispositivo, lo usamos.
    const { devices = [] } = (await api('/me/player/devices')) ?? {};
    const d = devices.find((x) => x.type === 'Smartphone') ?? devices[0];
    if (!d) throw new SinDispositivo('Abrí la app de Spotify en tu celu y volvé a tocar ▶.');
    await api(`/me/player/play?device_id=${d.id}`, { method: 'PUT', body: cuerpo });
  }
}

export const controlApp = {
  siguiente: () => api('/me/player/next', { method: 'POST' }),
  anterior: () => api('/me/player/previous', { method: 'POST' }),
  pausa: () => api('/me/player/pause', { method: 'PUT' }),
  seguir: () => api('/me/player/play', { method: 'PUT' }),
};

// Link que abre el tema, disco o playlist directo en la app de Spotify (sirve para cualquiera).
export const linkApp = (tipo, id) => `https://open.spotify.com/${tipo}/${id}`;
