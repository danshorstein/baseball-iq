import { useMemo, useState } from 'react';
import { TopBar } from '../components/Layout/TopBar';
import { QuizRunner } from '../components/QuizRunner/QuizRunner';
import { ScorePanel, type QuestionResult } from '../components/ScorePanel/ScorePanel';
import { buildPositionSession } from '../baseball/practice';
import { POSITION_NAMES, type DefensivePosition } from '../baseball/types';
import { go } from '../router';
import { useApp } from '../state/AppContext';

export function Practice({ mode = 'practice' }: { mode?: 'practice' | 'pitch' }) {
  const { positions, scenarios, names } = useApp();
  const [position, setPosition] = useState<DefensivePosition | null>(null);
  const [name, setName] = useState('');
  const [stage, setStage] = useState<'pick' | 'quiz' | 'done'>('pick');
  const [seed, setSeed] = useState(Date.now);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const items = useMemo(() => position ? buildPositionSession(position, scenarios, mode, seed).map((question) => ({ question, names: { ...names, [position]: name.trim() || position } })) : [], [position, scenarios, mode, seed, names, name]);
  return (
    <div className="page">
      <TopBar back="/" title={mode === 'pitch' ? 'Before the Pitch' : 'Practice a Position'} />
      {stage === 'pick' && <>
        <h2 className="section-title">What position are you practicing?</h2>
        <label className="setup-label" htmlFor="practice-name">First name (optional)</label>
        <input id="practice-name" className="setup-input" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} placeholder="Use position names, or add your first name" />
        <div className="position-grid">
          {positions.map((p) => <button key={p} className="player-btn" onClick={() => { setPosition(p); setStage('quiz'); }}><span className="player-first">{p}</span><span className="player-last">{POSITION_NAMES[p]}</span></button>)}
        </div>
        <p className="muted small">Short practice sessions about your job. No roster or account needed.</p>
      </>}
      {stage === 'quiz' && <QuizRunner items={items} onFinish={(r) => { setResults(r); setStage('done'); }} />}
      {stage === 'done' && <ScorePanel results={results} title={`GREAT WORK${name.trim() ? `, ${name.trim().toUpperCase()}` : ''}! ⚾`}>
        <button className="btn btn-primary" onClick={() => { setSeed(Date.now()); setStage('quiz'); }}>Practice again</button>
        <button className="btn btn-ghost" onClick={() => setStage('pick')}>Change position</button>
        <button className="btn btn-ghost" onClick={() => go('/')}>Home</button>
      </ScorePanel>}
    </div>
  );
}
