// Datos de Spotify a través de nuestra función /api/spotify (la clave nunca llega al navegador).
// Guarda las respuestas en sessionStorage para no repetir pedidos en la misma visita.
const PREFIJO = 'spotify:v1:';
const enCurso = new Map();

async function pedir(params) {
  const clave = PREFIJO + new URLSearchParams(params).toString();
  try {
    const guardado = sessionStorage.getItem(clave);
    if (guardado) return JSON.parse(guardado);
  } catch {
    /* sin sessionStorage: seguimos sin caché */
  }
  if (enCurso.has(clave)) return enCurso.get(clave);
  const promesa = (async () => {
    const res = await fetch('/api/spotify?' + new URLSearchParams(params));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Error ${res.status}`);
    const datos = await res.json();
    try {
      sessionStorage.setItem(clave, JSON.stringify(datos));
    } catch {
      /* lleno o bloqueado */
    }
    return datos;
  })().finally(() => enCurso.delete(clave));
  enCurso.set(clave, promesa);
  return promesa;
}

export const albumSpotify = (titulo, artista, anio) =>
  pedir({ tipo: 'album', titulo, artista, ...(anio ? { anio: String(anio) } : {}) });

export const artistaSpotify = (nombre) => pedir({ tipo: 'artista', nombre });

// 232 → "3:52"
export const minutos = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
