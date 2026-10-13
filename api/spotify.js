// Función de Vercel: busca discos y artistas en el catálogo de Spotify.
// Usa el flujo "client credentials": no hace falta que el visitante inicie sesión,
// así que la puede usar cualquiera. La clave secreta queda en el servidor
// (variables SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET, sin VITE_).
//
//   /api/spotify?tipo=album&titulo=Illmatic&artista=Nas
//   /api/spotify?tipo=artista&nombre=Nas
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

async function api(ruta) {
  const res = await fetch('https://api.spotify.com/v1' + ruta, {
    headers: { Authorization: `Bearer ${await pedirToken()}` },
  });
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
  const elegido = await api(`/albums/${candidatos[0].id}`);
  return {
    id: elegido.id,
    nombre: elegido.name,
    fecha: elegido.release_date,
    tapa: elegido.images?.[0]?.url ?? '',
    url: elegido.external_urls?.spotify ?? '',
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
    duracion: Math.round(x.duration_ms / 1000),
  };
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
  try {
    let datos = null;
    if (tipo === 'album' && titulo && artista) datos = await buscarAlbum(String(titulo), String(artista), anio);
    else if (tipo === 'artista' && nombre) datos = await buscarArtista(String(nombre));
    else if (tipo === 'cancion' && titulo && artista) datos = await buscarCancion(String(titulo), String(artista));
    else return res.status(400).json({ error: 'Faltan parámetros' });
    if (!datos) return res.status(404).json({ error: 'No está en Spotify' });
    // Vercel guarda la respuesta un día: menos llamadas a Spotify y respuestas más rápidas.
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(datos);
  } catch (e) {
    return res.status(e.estado ?? 500).json({ error: e.message });
  }
}
