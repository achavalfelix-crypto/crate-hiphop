export const ANIO_MIN = 1980;
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

export const nombreCosta = (id) => COSTAS.find((c) => c.id === id)?.nombre ?? '—';
export const nombreEstado = (id) => ESTADOS.find((e) => e.id === id)?.nombre ?? '—';

// Completa los campos que faltan (por ejemplo, discos guardados con la v1).
export function normalizar(a) {
  return {
    ...a,
    coast: a.coast ?? 'east',
    status: a.status ?? (a.escuchado ? 'escuchado' : 'pendiente'),
    rating: a.rating ?? 0,
    tracks: a.tracks ?? [],
  };
}
