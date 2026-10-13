// Datos de YouTube: duración y reproducciones de cada video.
// Usa la YouTube Data API v3 con una clave de navegador (VITE_YOUTUBE_API_KEY),
// restringida en Google Cloud al dominio de la app y solo a esta API.
const KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
export const youtubeConfigurado = Boolean(KEY);

// Saca el ID de un link de YouTube o YouTube Music (o lo devuelve si ya es un ID).
export function idDeYouTube(texto) {
  const t = (texto ?? '').trim();
  if (/^[\w-]{11}$/.test(t)) return t;
  const m = t.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{11})/);
  return m ? m[1] : '';
}

// "PT3M52S" → 232 segundos
function segundos(iso) {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

// Pide los datos de varios videos (la API acepta hasta 50 IDs por llamada).
export async function pedirDatos(ids) {
  const resultado = {};
  for (let i = 0; i < ids.length; i += 50) {
    const lote = ids.slice(i, i + 50);
    const url =
      'https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics' +
      `&id=${lote.join(',')}&key=${KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube respondió ${res.status}`);
    const json = await res.json();
    for (const v of json.items ?? []) {
      resultado[v.id] = {
        duracion: segundos(v.contentDetails?.duration),
        vistas: Number(v.statistics?.viewCount ?? 0),
      };
    }
  }
  return resultado;
}

export const formatoDuracion = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${seg}` : `${m}:${seg}`;
};

const numero = new Intl.NumberFormat('es-AR');
export const formatoVistas = (n) => numero.format(n);

export const linkEscuchar = (id) => `https://music.youtube.com/watch?v=${id}`;
