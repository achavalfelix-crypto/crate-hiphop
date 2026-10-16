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

// Busca el video de una canción ("artista - título") y devuelve su ID, o '' si no hay.
// Cuesta 100 unidades de la cuota diaria (10.000 gratis): se usa una vez por canción y el ID queda guardado.
export async function buscarVideo(titulo, artista) {
  const q = encodeURIComponent(`${artista} ${titulo}`);
  const url =
    'https://www.googleapis.com/youtube/v3/search?part=id&type=video&videoCategoryId=10&maxResults=1' +
    `&q=${q}&key=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw Object.assign(new Error(`YouTube respondió ${res.status}`), { estado: res.status });
  const json = await res.json();
  return json.items?.[0]?.id?.videoId ?? '';
}

// Un disco entero con UNA búsqueda: busca la lista del álbum (las que arma YouTube Music para cada disco)
// y devuelve { [título normalizado]: videoId } con las canciones que coinciden.
// Cuesta ~101 unidades en vez de 100 por canción.
const normalTema = (t) =>
  (t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*[([].*?[)\]]/g, '')
    .replace(/\s+-\s+.*$/, '')
    .replace(/[^a-z0-9]/g, '');
export { normalTema };

export async function buscarVideosDelDisco(disco, artista, temas) {
  const q = encodeURIComponent(`${artista} ${disco} album`);
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&type=playlist&maxResults=3&q=${q}&key=${KEY}`,
  );
  if (!res.ok) throw Object.assign(new Error(`YouTube respondió ${res.status}`), { estado: res.status });
  const listas = ((await res.json()).items ?? []).map((x) => x.id?.playlistId).filter(Boolean);
  const buscados = temas.map(normalTema).filter((t) => t.length >= 2);
  let mejor = {};
  for (const id of listas) {
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${id}&key=${KEY}`,
    );
    if (!r.ok) continue;
    const encontrados = {};
    for (const it of (await r.json()).items ?? []) {
      const vid = it.snippet?.resourceId?.videoId;
      const t = normalTema(it.snippet?.title);
      if (!vid || !t) continue;
      const tema = buscados.find((b) => b === t) ?? buscados.find((b) => b.length >= 4 && (t.includes(b) || b.includes(t)));
      if (tema && !encontrados[tema]) encontrados[tema] = vid;
    }
    if (Object.keys(encontrados).length > Object.keys(mejor).length) mejor = encontrados;
    // Si la lista tiene al menos la mitad del disco, es esa.
    if (Object.keys(mejor).length >= Math.ceil(buscados.length / 2)) break;
  }
  return mejor;
}
