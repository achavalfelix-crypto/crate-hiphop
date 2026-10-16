// Discografías guardadas en la propia página (public/datos/, las genera scripts/discografias.mjs).
// Se leen una sola vez por visita. Si no están o les falta algo, se usa Spotify en vivo.
const cargados = {};

function cargar(nombre) {
  cargados[nombre] ??= fetch(`/datos/${nombre}.json`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  return cargados[nombre];
}

// "Illmatic (XX Edition) - Remastered" → "illmatic"
export const normal = (t) =>
  (t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s*[([].*?[)\]]/g, '')
    .replace(/\s+-\s+.*$/, '')
    .replace(/[^a-z0-9]/g, '');

export const listasLocales = () => cargar('discografias');
const discosLocales = () => cargar('discos');

// Todas las discografías, solo si están completas (todos los artistas con discos).
export async function todasLocales() {
  const l = await listasLocales();
  if (!l?.artistas?.length || l.artistas.some((a) => !a.discos?.length)) return null;
  return { artistas: l.artistas.map((a) => ({ id: a.id, discos: a.discos })), incompleto: false, generado: l.generado };
}

const artistaLocal = async (nombre) => {
  const l = await listasLocales();
  const n = normal(nombre);
  return l?.artistas?.find((a) => normal(a.nombre) === n && a.discos?.length) ?? null;
};

export async function discografiaLocal(nombre) {
  const a = await artistaLocal(nombre);
  return a ? { artista: a.spotify ?? { id: '', nombre: a.nombre, url: '' }, discos: a.discos } : null;
}

export async function artistaLocalSpotify(nombre) {
  const a = await artistaLocal(nombre);
  return a?.spotify?.id ? a.spotify : null;
}

export async function discoLocal(id) {
  return (await discosLocales())?.discos?.[id] ?? null;
}

// Un disco por título y artista (mismo criterio que el servidor: título que empieza igual
// y algún artista que coincide; primero el título exacto, después el año pedido, después el más viejo).
export async function albumLocal(titulo, artista, anio) {
  const d = await discosLocales();
  if (!d?.discos) return null;
  const t = normal(titulo);
  const a = normal(artista);
  if (!t || !a) return null;
  const candidatos = Object.values(d.discos).filter(
    (x) => normal(x.nombre).startsWith(t) && x.artistas?.some((y) => normal(y.nombre) === a || normal(y.nombre).includes(a)),
  );
  if (!candidatos.length) return null;
  const puntaje = (x) => (normal(x.nombre) === t ? 0 : 10) + (anio && String(x.fecha ?? '').startsWith(String(anio)) ? 0 : 5);
  candidatos.sort((x, y) => puntaje(x) - puntaje(y) || String(x.fecha ?? '').localeCompare(String(y.fecha ?? '')));
  return candidatos[0];
}
