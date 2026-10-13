// Puntaje de 0 a 5. Tocar la misma estrella otra vez lo vuelve a 0.
export default function Puntaje({ valor, onCambiar }) {
  return (
    <div className="puntaje" role="group" aria-label="Puntaje">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= valor ? 'estrella llena' : 'estrella'}
          aria-label={`${n} de 5`}
          aria-pressed={n <= valor}
          onClick={() => onCambiar(n === valor ? 0 : n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
