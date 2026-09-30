import { useState } from 'react';
import { TopBar } from '../components/Layout/TopBar';
import { AGE_LABELS, ageDefaults, batterAdvice, ruleNotes, validateSettings, type AgeGroup, type TrainingSettings } from '../baseball/settings';
import { useApp } from '../state/AppContext';
import { go } from '../router';
import { TeamColors } from '../components/TeamColors/TeamColors';

export function Coach() {
  const { settings: s, saveSettings, storageAvailable, debug, setDebug } = useApp();
  const [message, setMessage] = useState('');
  const update = <K extends keyof TrainingSettings>(key: K, value: TrainingSettings[K]) => saveSettings({ ...s, [key]: value });
  const select = <K extends keyof TrainingSettings>(key: K, label: string, options: [TrainingSettings[K], string][]) => <label className="setup-label" htmlFor={`setup-${key}`}>
    {label}<select className="setup-input" id={`setup-${key}`} value={String(s[key])} onChange={(e) => update(key, (typeof s[key] === 'number' ? Number(e.target.value) : e.target.value) as TrainingSettings[K])}>
      {options.map(([value, text]) => <option key={String(value)} value={String(value)}>{text}</option>)}
    </select>
  </label>;
  const toggle = (key: 'leadingOff' | 'droppedThirdStrike' | 'infieldFly', label: string) => <label className="setup-toggle" htmlFor={`setup-${key}`}><input id={`setup-${key}`} type="checkbox" checked={s[key]} onChange={(e) => update(key, e.target.checked)} />{label}</label>;
  const exportSettings = () => {
    const blob = new Blob([JSON.stringify({ version: 1, settings: s }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'baseball-iq-setup.json'; link.click();
    URL.revokeObjectURL(url);
  };
  return <div className="page">
    <TopBar back="/" title="Setup & Rules" />
    <h1 className="section-title">Make it your team’s practice</h1>
    <p className="setup-note">Age groups load training defaults. Rec, advanced, and travel teams may use different rulebooks at the same age. Confirm every rule below with your league or tournament.</p>
    <div className="card setup-grid">
      <label className="setup-label" htmlFor="setup-teamName">Team name (optional)<input className="setup-input" id="setup-teamName" maxLength={60} value={s.teamName} placeholder="Your team" onChange={(e) => update('teamName', e.target.value)} /></label>
      <label className="setup-label" htmlFor="setup-age">Age group<select className="setup-input" id="setup-age" value={s.ageGroup} onChange={(e) => { saveSettings({ ...ageDefaults(e.target.value as AgeGroup), competition: s.competition, teamName: s.teamName, teamColors: s.teamColors, batter: s.batter }); setMessage('Loaded age defaults. Review the rules for this division.'); }}>
        {Object.entries(AGE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      {select('competition', 'Team type', [['rec', 'Recreational'], ['advanced', 'Advanced / select'], ['travel', 'Travel']])}
      {select('pitching', 'Pitching format', [['coach', 'Coach pitch'], ['machine', 'Machine pitch'], ['player', 'Player pitch']])}
      {select('fielders', 'Defensive players', [[9, '9 players · LF, CF, RF'], [10, '10 players · four outfielders']])}
      {select('basePath', 'Base path length', [60, 65, 70, 80, 90].map((n) => [n as TrainingSettings['basePath'], `${n} feet`]))}
    </div>
    <TeamColors />
    <details className="card rule-details" open>
      <summary>League rule details</summary>
      <div className="setup-grid">
        {toggle('leadingOff', 'Leading off allowed')}
        {select('stealing', 'Stealing starts', [['none', 'Stealing not allowed'], ...(s.leadingOff ? [] : [['plate', 'Pitch reaches home plate'] as [TrainingSettings['stealing'], string]]), ['release', 'Pitcher releases the ball']])}
        {toggle('droppedThirdStrike', 'Uncaught third strike rule enabled')}
        {toggle('infieldFly', 'Infield fly rule enabled')}
        {select('overthrowFirst', 'Overthrow at first (ball stays in play)', [['one-extra', 'Local cap: one extra base'], ['live', 'Live ball: no automatic cap']])}
        {select('playEnds', 'How play stops', [['controlled', 'Local rule: controlled ball + time'], ['umpire', 'Umpire calls time / dead-ball rule']])}
      </div>
      <label className="setup-label" htmlFor="setup-rulesSource">Rulebook name or link (optional)<input className="setup-input" id="setup-rulesSource" maxLength={300} value={s.rulesSource} onChange={(e) => update('rulesSource', e.target.value)} placeholder="League, division, season, or tournament rules" /></label>
      <p className="muted small">Leading off, stealing, and third strikes matter with player pitching. Pitching limits, bats, balks, mercy rules, and game lengths also vary; check your rulebook for those.</p>
      <ul className="rule-list">{ruleNotes(s).map((note) => <li key={note}>{note}</li>)}</ul>
      <button className="btn btn-primary" onClick={() => go('/rules')}>Practice these rules</button>
    </details>
    <div className="card">
      <h2 className="section-title small-title">Batter contact</h2>
      {select('batter', 'What have you observed?', [['balanced', 'Balanced / unknown'], ['power', 'Strong contact'], ['developing', 'Developing contact']])}
      <p className="muted">{batterAdvice(s)}</p>
      <p className="muted small">This adjusts starting outfield depth. The animated hit stays the same so you can compare the defense. It does not change the rules or predict the batter’s next hit.</p>
    </div>
    <div className="card">
      <h2 className="section-title small-title">Share your setup</h2>
      <p className="muted">Settings save on this device. Export a small file for another coach or family to import.</p>
      <div className="row gap"><button className="btn btn-outline" onClick={exportSettings}>Export setup</button><label className="setup-label" htmlFor="setup-import">Import setup<input id="setup-import" type="file" accept=".json,application/json" onChange={async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
          if (file.size > 20000) throw new Error('Setup file is too large.');
          const imported = JSON.parse(await file.text());
          if (imported.version !== 1 || !imported.settings || typeof imported.settings !== 'object' || Array.isArray(imported.settings)) throw new Error('Choose a Baseball IQ setup export (version 1).');
          saveSettings(validateSettings(imported.settings)); setMessage('Imported setup. Review the league rules before practicing.');
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not import this file.'); }
        e.target.value = '';
      }} /></label></div>
      <p role="status" className={storageAvailable ? 'ok small' : 'problems'}>{storageAvailable ? 'Settings saved on this device.' : 'Browser storage is unavailable. Settings work for this visit; export them to keep a copy.'}</p>
      {message && <p role="status">{message}</p>}
    </div>
    <label className="setup-toggle" htmlFor="debug-toggle"><input id="debug-toggle" type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)} />Show animation debug details</label>
  </div>;
}
