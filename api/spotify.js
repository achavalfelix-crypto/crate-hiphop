// Función de Vercel: busca discos y artistas en el catálogo de Spotify.
// Usa el flujo "client credentials": no hace falta que el visitante inicie sesión,
// así que la puede usar cualquiera. La clave secreta queda en el servidor
// (variables SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET, sin VITE_).
//
//   /api/spotify?tipo=album&titulo=Illmatic&artista=Nas
//   /api/spotify?tipo=artista&nombre=Nas
//   /api/spotify?tipo=disco&id=…           → un disco por ID
//   /api/spotify?tipo=discografia&nombre=Nas → todos los discos del artista
//   /api/spotify?tipo=buscar&q=…            → buscar cualquier disco
//   /api/spotify?tipo=config   → Client ID para conectar la cuenta (es público)
//   /api/spotify?tipo=cancion&titulo=N.Y. State of Mind&artista=Nas

let token = null; // { valor, vence }

async function pedirToken() {
  if (token && token.vence > Date.now() + 60_000) return token.valor;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secreto = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secreto) throw Object.assign(new Error('Spotify no está configurado'), { estado: 503 });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secreto}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw Object.assign(new Error(`Token de Spotify: ${res.status}`), { estado: 502 });
  const json = await res.json();
  token = { valor: json.access_token, vence: Date.now() + json.expires_in * 1000 };
  return token.valor;
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(ruta, intento = 0) {
  const res = await fetch('https://api.spotify.com/v1' + ruta, {
    headers: { Authorization: `Bearer ${await pedirToken()}` },
  });
  // Si Spotify pide esperar (muchos pedidos juntos), esperamos lo que dice y reintentamos hasta 2 veces.
  if (res.status === 429 && intento < 2) {
    const segundos = Math.min(Number(res.headers.get('retry-after')) || 1, 4);
    await esperar(segundos * 1000 + 200);
    return api(ruta, intento + 1);
  }
  if (res.status === 429) throw Object.assign(new Error('Spotify está saturado, probá en un rato'), { estado: 429 });
  if (!res.ok) throw Object.assign(new Error(`Spotify respondió ${res.status}`), { estado: 502 });
  return res.json();
}

// "Illmatic (XX Edition) - Remastered" → "illmatic"
const normal = (t) =>
  (t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s*[([].*?[)\]]/g, '')
    .replace(/\s+-\s+.*$/, '')
    .replace(/[^a-z0-9]/g, '');

export async function buscarAlbum(titulo, artista, anio) {
  const q = encodeURIComponent(`album:${titulo} artist:${artista}`);
  const r = await api(`/search?type=album&limit=10&q=${q}`);
  const t = normal(titulo);
  const a = normal(artista);
  const candidatos = (r.albums?.items ?? []).filter(
    (x) => x && normal(x.name).startsWith(t) && x.artists.some((y) => normal(y.name) === a || normal(y.name).includes(a)),
  );
  if (!candidatos.length) return null;
  // Primero el título exacto, después el año original, después el más viejo.
  const puntaje = (x) =>
    (normal(x.name) === t ? 0 : 10) + (anio && x.release_date?.startsWith(String(anio)) ? 0 : 5) + (x.album_type === 'album' ? 0 : 3);
  candidatos.sort((x, y) => puntaje(x) - puntaje(y) || (x.release_date ?? '').localeCompare(y.release_date ?? ''));
  return discoPorId(candidatos[0].id);
}

// Un disco por su ID de Spotify, con todas sus canciones.
export async function discoPorId(id) {
  const elegido = await api(`/albums/${encodeURIComponent(id)}`);
  return {
    id: elegido.id,
    nombre: elegido.name,
    fecha: elegido.release_date,
    anio: Number(String(elegido.release_date ?? '').slice(0, 4)) || 0,
    tapa: elegido.images?.[0]?.url ?? '',
    url: elegido.external_urls?.spotify ?? '',
    artistas: (elegido.artists ?? []).map((y) => ({ id: y.id, nombre: y.name })),
    canciones: (elegido.tracks?.items ?? []).map((c) => ({
      id: c.id,
      numero: c.track_number,
      disco: c.disc_number,
      nombre: c.name,
      duracion: Math.round(c.duration_ms / 1000),
      explicita: c.explicit,
      artistas: c.artists.map((y) => y.name),
    })),
  };
}

// Resumen de un disco para listas y grillas.
const resumen = (x) => ({
  id: x.id,
  nombre: x.name,
  anio: Number(String(x.release_date ?? '').slice(0, 4)) || 0,
  tapa: x.images?.[1]?.url ?? x.images?.[0]?.url ?? '',
  artista: x.artists?.map((y) => y.name).join(', ') ?? '',
  tipo: x.album_type,
});

// Todos los discos de un artista (sin repetir reediciones: queda la versión más vieja de cada título).
export async function discografia(nombre) {
  const art = await buscarArtista(nombre);
  if (!art) return null;
  const todos = [];
  for (let offset = 0; offset < 100; ) {
    let r;
    try {
      r = await api(`/artists/${art.id}/albums?include_groups=album&limit=50&offset=${offset}`);
    } catch {
      r = await api(`/artists/${art.id}/albums?include_groups=album&limit=10&offset=${offset}`);
    }
    const items = r.items ?? [];
    todos.push(...items);
    if (!r.next || !items.length) break;
    offset += items.length;
  }
  const porTitulo = new Map();
  for (const x of todos.map(resumen)) {
    const k = normal(x.nombre);
    const prev = porTitulo.get(k);
    if (!prev || (x.anio && x.anio < prev.anio)) porTitulo.set(k, x);
  }
  return { artista: art, discos: [...porTitulo.values()].sort((a, b) => a.anio - b.anio) };
}

// Buscar cualquier disco (dos páginas de 10, el máximo que deja Spotify en modo desarrollador).
export async function buscarDiscos(q) {
  const enc = encodeURIComponent(q);
  const [a, b] = await Promise.all([
    api(`/search?type=album&limit=10&offset=0&q=${enc}`),
    api(`/search?type=album&limit=10&offset=10&q=${enc}`).catch(() => ({})),
  ]);
  const items = [...(a.albums?.items ?? []), ...(b.albums?.items ?? [])].filter(Boolean).map(resumen);
  const vistos = new Set();
  return items.filter((x) => (vistos.has(x.id) ? false : vistos.add(x.id)));
}

export async function buscarCancion(titulo, artista) {
  const q = encodeURIComponent(`track:${titulo} artist:${artista}`);
  const r = await api(`/search?type=track&limit=10&q=${q}`);
  const t = normal(titulo);
  const a = normal(artista);
  const items = (r.tracks?.items ?? []).filter(Boolean);
  const coincide = (x) => x.artists.some((y) => normal(y.name) === a || normal(y.name).includes(a) || a.includes(normal(y.name)));
  // Primero título exacto del artista, después título parecido, después lo primero que haya.
  const x =
    items.find((y) => normal(y.name) === t && coincide(y)) ??
    items.find((y) => normal(y.name).startsWith(t) && coincide(y)) ??
    items.find(coincide);
  if (!x) return null;
  return {
    id: x.id,
    nombre: x.name,
    artistas: x.artists.map((y) => y.name),
    disco: x.album?.name ?? '',
    tapa: x.album?.images?.[1]?.url ?? x.album?.images?.[0]?.url ?? '',
    duracion: Math.round(x.duration_ms / 1000),
  };
}

// Buscar canciones sueltas (para agregarlas al cajón sin escribir nada).
export async function buscarCanciones(q) {
  const enc = encodeURIComponent(q);
  const [a, b] = await Promise.all([
    api(`/search?type=track&limit=10&offset=0&q=${enc}`),
    api(`/search?type=track&limit=10&offset=10&q=${enc}`).catch(() => ({})),
  ]);
  const vistos = new Set();
  return [...(a.tracks?.items ?? []), ...(b.tracks?.items ?? [])]
    .filter(Boolean)
    .filter((x) => (vistos.has(x.id) ? false : vistos.add(x.id)))
    .map((x) => ({
      id: x.id,
      nombre: x.name,
      artista: x.artists.map((y) => y.name).join(', '),
      artistaPrincipal: x.artists[0]?.name ?? '',
      disco: x.album?.name ?? '',
      discoId: x.album?.id ?? '',
      anio: Number(String(x.album?.release_date ?? '').slice(0, 4)) || 0,
      tapa: x.album?.images?.[2]?.url ?? x.album?.images?.[1]?.url ?? x.album?.images?.[0]?.url ?? '',
      duracion: Math.round(x.duration_ms / 1000),
    }));
}

export async function buscarArtista(nombre) {
  const r = await api(`/search?type=artist&limit=5&q=${encodeURIComponent(nombre)}`);
  const n = normal(nombre);
  const x = (r.artists?.items ?? []).find((y) => normal(y.name) === n) ?? r.artists?.items?.[0];
  if (!x) return null;
  return { id: x.id, nombre: x.name, url: x.external_urls?.spotify ?? '' };
}

export default async function handler(req, res) {
  const { tipo, titulo, artista, anio, nombre } = req.query ?? {};
  // El Client ID es público (no es secreto): el navegador lo usa para "Conectar Spotify".
  if (tipo === 'config') {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    if (!clientId) return res.status(503).json({ error: 'Spotify no está configurado' });
    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    return res.status(200).json({ clientId });
  }
  try {
    let datos = null;
    if (tipo === 'album' && titulo && artista) datos = await buscarAlbum(String(titulo), String(artista), anio);
    else if (tipo === 'artista' && nombre) datos = await buscarArtista(String(nombre));
    else if (tipo === 'cancion' && titulo && artista) datos = await buscarCancion(String(titulo), String(artista));
    else if (tipo === 'disco' && req.query.id) datos = await discoPorId(String(req.query.id));
    else if (tipo === 'discografia' && nombre) datos = await discografia(String(nombre));
    else if (tipo === 'buscarcanciones' && req.query.q && String(req.query.q).trim().length >= 2) datos = await buscarCanciones(String(req.query.q).slice(0, 80));
    else if (tipo === 'buscar' && req.query.q && String(req.query.q).trim().length >= 2) datos = await buscarDiscos(String(req.query.q).slice(0, 80));
    else return res.status(400).json({ error: 'Faltan parámetros' });
    if (!datos) return res.status(404).json({ error: 'No está en Spotify' });
    // Vercel guarda la respuesta un día: menos llamadas a Spotify y respuestas más rápidas.
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(datos);
  } catch (e) {
    return res.status(e.estado ?? 500).json({ error: e.message });
  }
}
