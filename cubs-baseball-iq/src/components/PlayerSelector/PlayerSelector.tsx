import { PLAYERS, type Player } from '../../data/players';

interface Props {
  onPick: (p: Player) => void;
  /** Player ids in this week's lineup. Others show as "not playing". */
  present: string[];
}

export function PlayerSelector({ onPick, present }: Props) {
  return (
    <div className="player-grid">
      {PLAYERS.map((p) => {
        const out = !present.includes(p.id);
        return (
          <button key={p.id} className={`player-btn ${out ? 'player-out' : ''}`} onClick={() => onPick(p)}>
            <span className="player-first">{p.firstName}</span>
            <span className="player-last">{out ? 'Not in this week’s lineup' : p.lastName}</span>
          </button>
        );
      })}
    </div>
  );
}
