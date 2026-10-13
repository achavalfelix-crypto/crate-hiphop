// La era del archivo (la línea de tiempo arranca y termina acá como mínimo)…
export const ERA_DESDE = 1980;
export const ERA_HASTA = 2016;
// El cajón acepta discos anteriores a 1980 (si los hay en la discografía), pero nada después de 2016.
export const ANIO_MIN = 1960;
export const ANIO_MAX = 2016;

export const COSTAS = [
  { id: 'west', nombre: 'West Coast' },
  { id: 'east', nombre: 'East Coast' },
  { id: 'south', nombre: 'Sur' },
  { id: 'midwest', nombre: 'Medio Oeste' },
];

export const ESTADOS = [
  { id: 'pendiente', nombre: 'Por escuchar' },
  { id: 'escuchando', nombre: 'Escuchando' },
  { id: 'escuchado', nombre: 'Escuchado' },
];

export const TIPOS = [
  { id: 'album', nombre: 'Disco', plural: 'Discos' },
  { id: 'cancion', nombre: 'Canción', plural: 'Canciones' },
];

export const nombreCosta = (id) => COSTAS.find((c) => c.id === id)?.nombre ?? '—';
export const nombreEstado = (id) => ESTADOS.find((e) => e.id === id)?.nombre ?? '—';

// Completa los campos que faltan (por ejemplo, discos guardados con versiones anteriores).
export function normalizar(a) {
  return {
    ...a,
    type: a.type ?? 'album',
    album: a.album ?? '',
    videoId: a.videoId ?? '',
    spotifyId: a.spotifyId ?? '',
    favorita: a.favorita ?? false,
    tapa: a.tapa ?? '',
    coast: a.coast ?? 'east',
    status: a.status ?? (a.escuchado ? 'escuchado' : 'pendiente'),
    rating: a.rating ?? 0,
    tracks: a.tracks ?? [],
  };
}
