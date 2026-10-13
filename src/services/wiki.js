// Biografías, reseñas e imágenes en vivo desde Wikipedia.
// 1) Resumen en inglés (trae la imagen: foto del artista o tapa del disco).
// 2) Busca el artículo equivalente en español y trae su resumen; si no existe, queda el inglés.
// Las respuestas se guardan en sessionStorage para no repetir pedidos en la misma visita.

const CACHE = 'wiki:v1:';

function leerCache(clave) {
  try {
    const v = sessionStorage.getItem(CACHE + clave);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
function guardarCache(clave, valor) {
  try {
    sessionStorage.setItem(CACHE + clave, JSON.stringify(valor));
  } catch {
    // sin cache: no pasa nada
  }
}

async function resumen(idioma, titulo) {
  const res = await fetch(
    `https://${idioma}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titulo)}`,
  );
  if (!res.ok) throw new Error(`Wikipedia ${idioma} respondió ${res.status}`);
  return res.json();
}

async function tituloEnEspanol(tituloEn) {
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&lllang=es&format=json&origin=*&titles=' +
    encodeURIComponent(tituloEn);
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const pagina = Object.values(json.query?.pages ?? {})[0];
  return pagina?.langlinks?.[0]?.['*'] ?? null;
}

const pedidos = new Map();

// Devuelve { imagen, texto, idioma, url } para un título de Wikipedia en inglés.
export function datosWiki(tituloEn) {
  const enCache = leerCache(tituloEn);
  if (enCache) return Promise.resolve(enCache);
  if (pedidos.has(tituloEn)) return pedidos.get(tituloEn);

  const pedido = (async () => {
    const en = await resumen('en', tituloEn);
    let texto = en.extract;
    let idioma = 'en';
    let url = en.content_urls?.desktop?.page;
    try {
      const tituloEs = await tituloEnEspanol(tituloEn);
      if (tituloEs) {
        const es = await resumen('es', tituloEs);
        if (es.extract) {
          texto = es.extract;
          idioma = 'es';
          url = es.content_urls?.desktop?.page ?? url;
        }
      }
    } catch {
      // si falla el español, queda el inglés
    }
    const datos = {
      imagen: en.thumbnail?.source ?? null,
      imagenGrande: en.originalimage?.source ?? en.thumbnail?.source ?? null,
      texto,
      idioma,
      url,
    };
    guardarCache(tituloEn, datos);
    return datos;
  })();

  pedidos.set(tituloEn, pedido);
  pedido.catch(() => pedidos.delete(tituloEn));
  return pedido;
}
