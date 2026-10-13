import { useState } from 'react';
import { ANIO_MAX, ANIO_MIN, COSTAS } from '../data/constantes';

const VACIO = { title: '', artist: '', year: '', coast: 'west' };

// Sirve para agregar un disco nuevo o editar uno existente (si recibe `inicial`).
export default function AlbumForm({ inicial, onGuardar, onCancelar, deshabilitado }) {
  const [form, setForm] = useState(inicial ? { ...inicial, year: String(inicial.year) } : VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  function validar() {
    const e = {};
    const anio = Number(form.year);
    if (!form.title.trim()) e.title = 'Escribí el título.';
    if (!form.artist.trim()) e.artist = 'Escribí el artista.';
    if (!Number.isInteger(anio) || anio < ANIO_MIN || anio > ANIO_MAX)
      e.year = `Tiene que ser entre ${ANIO_MIN} y ${ANIO_MAX}.`;
    return e;
  }

  async function enviar(ev) {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;
    setGuardando(true);
    const ok = await onGuardar({
      title: form.title.trim(),
      artist: form.artist.trim(),
      year: Number(form.year),
      coast: form.coast,
    });
    setGuardando(false);
    if (ok && !inicial) setForm(VACIO);
  }

  const id = inicial ? `edit-${inicial.id}` : 'nuevo';

  return (
    <form onSubmit={enviar} className="form" noValidate>
      <div className="campo campo-titulo">
        <label htmlFor={`${id}-title`}>Título</label>
        <input id={`${id}-title`} value={form.title} onChange={cambiar('title')} maxLength={120} />
        {errores.title && <small className="error">{errores.title}</small>}
      </div>
      <div className="campo">
        <label htmlFor={`${id}-artist`}>Artista</label>
        <input id={`${id}-artist`} value={form.artist} onChange={cambiar('artist')} maxLength={80} />
        {errores.artist && <small className="error">{errores.artist}</small>}
      </div>
      <div className="campo campo-corto">
        <label htmlFor={`${id}-year`}>Año</label>
        <input
          id={`${id}-year`}
          type="number"
          inputMode="numeric"
          min={ANIO_MIN}
          max={ANIO_MAX}
          value={form.year}
          onChange={cambiar('year')}
        />
        {errores.year && <small className="error">{errores.year}</small>}
      </div>
      <div className="campo campo-corto">
        <label htmlFor={`${id}-coast`}>Costa</label>
        <select id={`${id}-coast`} value={form.coast} onChange={cambiar('coast')}>
          {COSTAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="acciones-form">
        <button className="btn btn-primario" disabled={deshabilitado || guardando}>
          {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Agregar disco'}
        </button>
        {onCancelar && (
          <button type="button" className="btn" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
