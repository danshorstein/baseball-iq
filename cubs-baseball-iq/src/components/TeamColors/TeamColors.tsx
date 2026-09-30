import { TEAM_PALETTES } from '../../theme/teamColors';
import { useApp } from '../../state/AppContext';

export function TeamColors() {
  const { settings, saveSettings } = useApp();
  const colors = settings.teamColors;
  const selected = TEAM_PALETTES.find((p) => p.primary === colors.primary && p.accent === colors.accent)?.id ?? 'custom';
  return <section className="card" aria-labelledby="team-colors-title">
    <h2 id="team-colors-title" className="section-title small-title">Team colors</h2>
    <label className="setup-label" htmlFor="team-palette">Color preset
      <select id="team-palette" className="setup-input" value={selected} onChange={(e) => {
        const palette = TEAM_PALETTES.find((p) => p.id === e.target.value);
        if (palette) saveSettings({ ...settings, teamColors: { primary: palette.primary, accent: palette.accent } });
      }}>
        {TEAM_PALETTES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        <option value="custom" disabled>Custom colors · use the pickers below</option>
      </select>
    </label>
    <div className="setup-grid">
      {(['primary', 'accent'] as const).map((key) => <div key={key}>
        <label className="setup-label" htmlFor={`team-${key}`}>{key === 'primary' ? 'Primary color' : 'Accent color'}</label>
        <div className="color-picker-row">
          <input id={`team-${key}`} type="color" value={colors[key]} onChange={(e) => saveSettings({ ...settings, teamColors: { ...colors, [key]: e.target.value } })} />
          <code>{colors[key].toUpperCase()}</code>
        </div>
      </div>)}
    </div>
    <div className="team-color-preview" aria-label="Team color preview">
      <span className="team-color-name">{settings.teamName || 'Your team'}</span>
      <span className="team-color-badge">BALL → BASE → BACKUP</span>
    </div>
    <p className="muted small">Pick a preset or customize either color. These are starter palettes, not official team branding. The Sharks preset uses charcoal and light blue from your team reference. Colors save with your setup.</p>
  </section>;
}
