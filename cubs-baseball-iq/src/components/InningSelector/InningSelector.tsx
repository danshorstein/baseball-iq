interface Props {
  inning: number;
  onChange: (n: number) => void;
}

export function InningSelector({ inning, onChange }: Props) {
  return (
    <div className="inning-select" role="group" aria-label="Lineup inning">
      <span className="muted">Names from inning</span>
      {[1, 2, 3, 4].map((n) => (
        <button key={n} className={`chip ${n === inning ? 'chip-on' : ''}`} onClick={() => onChange(n)}>
          {n}
        </button>
      ))}
    </div>
  );
}
