// La luz de la ficha sigue al mouse: guarda la posición en --mx / --my.
export function seguirMouse(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

// Nombre para la transición animada entre la lista y la ficha (misma imagen en las dos páginas).
export const transicion = (tipo, id) => ({ viewTransitionName: `${tipo}-${id.replace(/[^a-z0-9-]/gi, '')}` });
