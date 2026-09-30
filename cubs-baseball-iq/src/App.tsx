import { Rules } from './pages/Rules';
import { Coach } from './pages/Coach';
import { Home } from './pages/Home';
import { Lesson } from './pages/Lesson';
import { Play } from './pages/Play';
import { Plays } from './pages/Plays';
import { Practice } from './pages/Practice';
import { useRoute } from './router';
import { AppProvider, useApp } from './state/AppContext';
import { themeVariables } from './theme/teamColors';
import type { CSSProperties } from 'react';

function ThemedApp() {
  const { settings } = useApp();
  return <div className="team-theme" style={themeVariables(settings.teamColors) as CSSProperties}><Routes /></div>;
}

function Routes() {
  const r = useRoute();
  switch (r.name) {
    case 'lesson':
      return <Lesson key={r.id} id={r.id} />;
    case 'play':
      return <Play key={r.id} id={r.id} />;
    case 'plays':
      return <Plays />;
    case 'practice':
      return <Practice key="practice" />;
    case 'pitch':
      return <Practice key="pitch" mode="pitch" />;
    case 'rules':
      return <Rules />;
    case 'coach':
      return <Coach />;
    default:
      return <Home />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
}
