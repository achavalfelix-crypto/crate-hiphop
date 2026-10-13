import { useState } from 'react';
import { ANIO_MAX, ANIO_MIN, COSTAS, TIPOS } from '../data/constantes';
import { idDeYouTube } from '../services/youtube';

const VACIO = { type: 'album', title: '', artist: '', album: '', link: '', year: '', coast: 'west' };

// Sirve para agregar un disco o una canción, o editar uno existente (si recibe `inicial`).
export default function AlbumForm({ inicial, onGuardar, onCancelar, deshabilitado }) {
  const [form, setForm] = useState(
    inicial ? { ...inicial, year: String(inicial.year), link: inicial.videoId ?? '' } : VACIO,
  );
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const esCancion = form.type === 'cancion';
  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  function validar() {
    const e = {};
    const anio = Number(form.year);
    if (!form.title.trim()) e.title = 'Escribí el título.';
    if (!form.artist.trim()) e.artist = 'Escribí el artista.';
    if (!Number.isInteger(anio) || anio < ANIO_MIN || anio > ANIO_MAX)
      e.year = `Tiene que ser entre ${ANIO_MIN} y ${ANIO_MAX}.`;
    if (esCancion && form.link.trim() && !idDeYouTube(form.link))
      e.link = 'Pegá un link de YouTube o YouTube Music.';
    return e;
  }

  async function enviar(ev) {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;
    setGuardando(true);
    const ok = await onGuardar({
      type: form.type,
      title: form.title.trim(),
      artist: form.artist.trim(),
      album: esCancion ? form.album.trim() : '',
      videoId: esCancion ? idDeYouTube(form.link) : '',
      year: Number(form.year),
      coast: form.coast,
    });
    setGuardando(false);
    if (ok && !inicial) setForm({ ...VACIO, type: form.type });
  }

  const id = inicial ? `edit-${inicial.id}` : 'nuevo';
  const textoBoton = inicial ? 'Guardar cambios' : esCancion ? 'Agregar canción' : 'Agregar disco';

  return (
    <form onSubmit={enviar} className="form" noValidate>
      <div className="fila-tipo">
      <div className="segmentado" role="group" aria-label="Qué querés agregar">
        {TIPOS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={form.type === t.id}
            onClick={() => setForm({ ...form, type: t.id })}
          >
            {t.nombre}
          </button>
        ))}
      </div>
      </div>

      <div className="campo campo-titulo">
        <label htmlFor={`${id}-title`}>{esCancion ? 'Canción' : 'Título del disco'}</label>
        <input id={`${id}-title`} value={form.title} onChange={cambiar('title')} maxLength={120} />
        {errores.title && <small className="error">{errores.title}</small>}
      </div>
      <div className="campo">
        <label htmlFor={`${id}-artist`}>Artista</label>
        <input id={`${id}-artist`} value={form.artist} onChange={cambiar('artist')} maxLength={80} />
        {errores.artist && <small className="error">{errores.artist}</small>}
      </div>
      {esCancion && (
        <div className="campo">
          <label htmlFor={`${id}-album`}>Del disco (opcional)</label>
          <input id={`${id}-album`} value={form.album} onChange={cambiar('album')} maxLength={120} />
        </div>
      )}
      {esCancion && (
        <div className="campo">
          <label htmlFor={`${id}-link`}>Link de YouTube (opcional)</label>
          <input
            id={`${id}-link`}
            value={form.link}
            onChange={cambiar('link')}
            placeholder="music.youtube.com/watch?v=…"
            inputMode="url"
          />
          {errores.link && <small className="error">{errores.link}</small>}
        </div>
      )}
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
          {guardando ? 'Guardando…' : textoBoton}
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
