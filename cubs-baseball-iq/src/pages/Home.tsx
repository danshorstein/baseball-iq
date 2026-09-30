import { useApp } from '../state/AppContext';
import { AGE_LABELS, ageDefaults, type AgeGroup } from '../baseball/settings';
import { TopBar } from '../components/Layout/TopBar';
import { LESSONS } from '../data/lessons';
import { go } from '../router';
import { BALL_BASE_BACKUP, PRINCIPLES } from '../baseball/teachingRules';

export function Home() {
  const { settings, saveSettings } = useApp();
  return (
    <div className="page">
      <TopBar />
      <section className="hero">
        <div className="hero-kicker">Defense Trainer</div>
        <h1 className="hero-title">
          <span>BASEBALL</span> IQ
        </h1>
        <div className="bbb">
          {BALL_BASE_BACKUP.map((s, i) => (
            <div key={s.step} className="bbb-step">
              <div className="bbb-word">{s.step}</div>
              <div className="bbb-q">{s.question}</div>
              {i < 2 && <div className="bbb-arrow">→</div>}
            </div>
          ))}
        </div>
        <button className="btn btn-accent btn-big btn-wide" onClick={() => go('/practice')}>
          ⚾ PRACTICE A POSITION
        </button>
        <button className="btn btn-outline btn-big btn-wide btn-pitch" onClick={() => go('/before-pitch')}>
          ⏸ BEFORE THE PITCH
          <span className="btn-sub">What's my job if it's hit to me?</span>
        </button>
        <p className="hero-sub">{PRINCIPLES.oneKid}</p>
      </section>

      <div className="card home-setup">
        <label className="setup-label" htmlFor="home-age">Age group<select id="home-age" className="setup-input" value={settings.ageGroup} onChange={(e) => saveSettings({ ...ageDefaults(e.target.value as AgeGroup), teamName: settings.teamName, teamColors: settings.teamColors, competition: settings.competition, batter: settings.batter })}>{Object.entries(AGE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <p className="muted small">{settings.teamName || 'Any team'} · {settings.fielders} fielders · {settings.pitching} pitch · {settings.basePath} ft bases</p>
        <p className="muted small">Age changes load training defaults. Confirm your league’s rules in Setup.</p>
        <div className="row gap"><button className="btn btn-outline" onClick={() => go('/coach')}>Setup & rules</button><button className="btn btn-ghost" onClick={() => go('/rules')}>Practice your rules</button></div>
      </div>
      <h2 className="section-title">Lessons</h2>
      <div className="lessons">
        {LESSONS.map((l) => (
          <button key={l.id} className="lesson-card" onClick={() => go(`/lesson/${l.id}`)}>
            <div className="lesson-num">{l.number}</div>
            <div className="lesson-body">
              <div className="lesson-title">
                {l.title} <span aria-hidden>{l.emoji}</span>
              </div>
              <div className="lesson-tag">“{l.tagline}”</div>
              <div className="lesson-meta">{l.scenarioIds.length} plays</div>
            </div>
            <div className="lesson-go">›</div>
          </button>
        ))}
      </div>
      <button className="btn btn-outline btn-wide" onClick={() => go('/plays')}>
        📋 All plays
      </button>
      <footer className="foot muted small">For youth baseball teams. Training examples and coach-selected rules; not an official league rulebook.</footer>
    </div>
  );
}
