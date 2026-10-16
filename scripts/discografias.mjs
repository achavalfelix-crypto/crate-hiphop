// Intermediario de discografías: baja una sola vez de Spotify todo lo que muestra la página
// (discografía de cada artista + canciones de cada disco) y lo guarda en public/datos/.
// Así la página lee esos archivos y no depende de que Spotify responda en el momento.
//
//   node scripts/discografias.mjs            → completa lo que falta (retoma si se cortó)
//   node scripts/discografias.mjs --forzar   → vuelve a bajar todo
//
// Por defecto le pide los datos a la página publicada (/api/spotify), así no hacen falta claves.
// Para usar otra dirección: ORIGEN=http://localhost:5173 node scripts/discografias.mjs

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { ALBUMES, ARTISTAS, autorDe } from '../src/data/archivo.js';

const ORIGEN = (process.env.ORIGEN || 'https://the-golden-era-archives.vercel.app').replace(/\/$/, '');
const CARPETA = new URL('../public/datos/', import.meta.url);
const FORZAR = process.argv.includes('--forzar');
const PAUSA = Number(process.env.PAUSA ?? 350); // ms entre pedidos, para no saturar a Spotify

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function pedir(params, intento = 1) {
  const url = `${ORIGEN}/api/spotify?${new URLSearchParams(params)}`;
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    if (intento >= 5) throw e;
    await esperar(5000 * intento);
    return pedir(params, intento + 1);
  }
  if (res.status === 404) return null;
  if (res.ok) return res.json();
  // 429 (Spotify pidió esperar) o error del servidor: esperamos cada vez más y reintentamos.
  if ((res.status === 429 || res.status >= 500) && intento < 6) {
    const segundos = 20 * intento;
    console.log(`   Spotify pidió esperar (${res.status}). Reintento en ${segundos} s…`);
    await esperar(segundos * 1000);
    return pedir(params, intento + 1);
  }
  throw new Error(`${res.status} en ${url}`);
}

async function leer(nombre, vacio) {
  if (FORZAR) return vacio;
  try {
    return JSON.parse(await readFile(new URL(nombre, CARPETA), 'utf8'));
  } catch {
    return vacio;
  }
}

async function guardar(nombre, datos) {
  await mkdir(CARPETA, { recursive: true });
  await writeFile(new URL(nombre, CARPETA), JSON.stringify(datos));
}

const hoy = new Date().toISOString().slice(0, 10);
const listas = await leer('discografias.json', { artistas: [] });
const discos = await leer('discos.json', { discos: {}, archivo: {} });
discos.archivo ??= {};
const yaTiene = new Map(listas.artistas.map((a) => [a.id, a]));
let fallas = 0;

// 1) La discografía de cada artista del archivo.
console.log(`Discografías (${ARTISTAS.length} artistas) desde ${ORIGEN}`);
for (const a of ARTISTAS) {
  if (yaTiene.get(a.id)?.discos?.length) continue;
  try {
    const r = await pedir({ tipo: 'discografia', nombre: a.nombre });
    yaTiene.set(a.id, { id: a.id, nombre: a.nombre, spotify: r?.artista ?? null, discos: r?.discos ?? [] });
    console.log(`  ✓ ${a.nombre}: ${r?.discos?.length ?? 0} discos`);
  } catch (e) {
    fallas++;
    console.log(`  ✗ ${a.nombre}: ${e.message}`);
  }
  await guardar('discografias.json', {
    generado: hoy,
    fuente: 'Spotify',
    hasta: 2016,
    artistas: ARTISTAS.map((x) => yaTiene.get(x.id)).filter(Boolean),
  });
  await esperar(PAUSA);
}

// 2) Las canciones de cada disco.
const ids = [...new Set([...yaTiene.values()].flatMap((a) => a.discos.map((d) => d.id)))];
const faltan = ids.filter((id) => !discos.discos[id]);
console.log(`Canciones de ${faltan.length} discos (de ${ids.length})`);
let n = 0;
for (const id of faltan) {
  try {
    const d = await pedir({ tipo: 'disco', id });
    if (d) discos.discos[id] = d;
  } catch (e) {
    fallas++;
    console.log(`  ✗ disco ${id}: ${e.message}`);
  }
  if (++n % 10 === 0 || n === faltan.length) {
    console.log(`  ${n}/${faltan.length}`);
    await guardar('discos.json', { ...discos, generado: hoy });
  }
  await esperar(PAUSA);
}

// 3) Los discos con ficha en el archivo (algunos no aparecen en la discografía del artista,
//    por ejemplo los de grupos o colaboraciones). Se guarda qué disco de Spotify es cada uno.
console.log(`Discos del archivo (${ALBUMES.length})`);
for (const d of ALBUMES) {
  if (discos.archivo[d.id] && discos.discos[discos.archivo[d.id]]) continue;
  try {
    const r = await pedir({ tipo: 'album', titulo: d.titulo, artista: autorDe(d), anio: String(d.anio) });
    if (r) {
      discos.discos[r.id] = r;
      discos.archivo[d.id] = r.id;
    } else {
      console.log(`  · ${d.titulo}: no está en Spotify`);
    }
  } catch (e) {
    fallas++;
    console.log(`  ✗ ${d.titulo}: ${e.message}`);
  }
  await esperar(PAUSA);
}
await guardar('discos.json', { ...discos, generado: hoy });

const total = [...yaTiene.values()].reduce((s, a) => s + a.discos.length, 0);
console.log(`\nListo: ${yaTiene.size}/${ARTISTAS.length} artistas, ${total} discos, ${Object.keys(discos.discos).length} con canciones.`);
if (fallas) {
  console.log(`Hubo ${fallas} errores. Volvé a correr el script: retoma desde donde quedó.`);
  process.exitCode = 1;
}
