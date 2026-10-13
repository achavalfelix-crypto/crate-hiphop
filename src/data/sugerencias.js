// Playlists sugeridas a partir de las canciones del cajón.
// Cada sugerencia: { id, nombre, descripcion, canciones }
import { COSTAS } from './constantes';

const DECADAS = [
  { id: '80', nombre: 'Los 80', desde: 1980, hasta: 1989 },
  { id: '90', nombre: 'Los 90', desde: 1990, hasta: 1999 },
  { id: '00', nombre: 'Los 2000', desde: 2000, hasta: 2009 },
  { id: '10', nombre: 'Los 2010', desde: 2010, hasta: 2016 },
];

// Hasta `n` canciones por disco, para que ningún disco se coma la playlist.
function porDisco(lista, n) {
  const cuenta = {};
  return lista.filter((c) => {
    const k = c.disco || c.titulo;
    cuenta[k] = (cuenta[k] ?? 0) + 1;
    return cuenta[k] <= n;
  });
}

// Mezcla estable según una semilla (la misma semilla da la misma mezcla).
export function mezclar(lista, semilla = 1) {
  let s = semilla;
  const azar = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function sugerencias(canciones, semilla = 1) {
  const out = [];
  const agregar = (s, minimo = 3) => s.canciones.length >= minimo && out.push(s);

  agregar({
    id: 'favoritas',
    nombre: 'Tus favoritas',
    descripcion: 'Lo que marcaste con ♥ o le pusiste 4 o 5 estrellas.',
    canciones: canciones.filter((c) => c.fav || c.puntaje >= 4),
  }, 1);

  agregar({
    id: 'un-tema',
    nombre: 'Un tema de cada disco',
    descripcion: 'Una canción por disco, mezclada: la mejor forma de descubrir qué disco escuchar entero.',
    canciones: mezclar(porDisco(mezclar(canciones, semilla), 1), semilla + 7),
  });

  for (const c of COSTAS) {
    agregar({
      id: `costa-${c.id}`,
      nombre: `${c.nombre}: lo esencial`,
      descripcion: `Hasta dos temas por disco de la ${c.nombre}, ordenados por año.`,
      canciones: porDisco(
        canciones.filter((x) => x.costa === c.id).sort((a, b) => a.anio - b.anio),
        2,
      ),
    });
  }

  for (const d of DECADAS) {
    agregar({
      id: `decada-${d.id}`,
      nombre: d.nombre,
      descripcion: `Del ${d.desde} al ${d.hasta}, en orden.`,
      canciones: porDisco(
        canciones.filter((x) => x.anio >= d.desde && x.anio <= d.hasta).sort((a, b) => a.anio - b.anio),
        2,
      ),
    });
  }

  agregar({
    id: 'pendientes',
    nombre: 'Lo que te falta escuchar',
    descripcion: 'Temas de los discos que tenés marcados "por escuchar".',
    canciones: porDisco(canciones.filter((c) => c.estado === 'pendiente'), 3),
  });

  return out.map((s) => ({ ...s, canciones: s.canciones.slice(0, 40) }));
}

// Separa una playlist en varias: por costa o por década.
export function separar(canciones, criterio) {
  const grupos = criterio === 'costa' ? COSTAS.map((c) => ({ id: c.id, nombre: c.nombre, ok: (x) => x.costa === c.id }))
    : DECADAS.map((d) => ({ id: d.id, nombre: d.nombre, ok: (x) => x.anio >= d.desde && x.anio <= d.hasta }));
  return grupos
    .map((g) => ({ nombre: g.nombre, canciones: canciones.filter(g.ok) }))
    .filter((g) => g.canciones.length > 0);
}
