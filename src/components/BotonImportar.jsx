import { useRef, useState } from 'react';

// Botón que abre el selector de archivos y pasa el JSON elegido a `onArchivo`.
export default function BotonImportar({ onArchivo, className = 'btn' }) {
  const input = useRef(null);
  const [importando, setImportando] = useState(false);

  async function elegir(e) {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo) return;
    setImportando(true);
    await onArchivo(archivo);
    setImportando(false);
  }

  return (
    <>
      <button type="button" className={className} disabled={importando} onClick={() => input.current?.click()}>
        {importando ? 'Importando…' : 'Importar'}
      </button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={elegir}
        aria-label="Elegir archivo para importar"
      />
    </>
  );
}
