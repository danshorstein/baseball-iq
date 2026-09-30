import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { configureScenario } from '../baseball/configureScenario';
import { activePositions, validateSettings, type TrainingSettings } from '../baseball/settings';
import { DEFENSIVE_POSITIONS, type DefensivePosition } from '../baseball/types';
import { SCENARIOS } from '../data/scenarios';
import { loadSettings, persistSettings } from '../storage/settingsRepository';

interface AppState {
  settings: TrainingSettings;
  saveSettings: (settings: TrainingSettings) => void;
  storageAvailable: boolean;
  positions: DefensivePosition[];
  names: Record<DefensivePosition, string>;
  scenarios: typeof SCENARIOS;
  speed: number;
  setSpeed: (n: number) => void;
  debug: boolean;
  setDebug: (b: boolean) => void;
}
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(loadSettings);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [debug, setDebug] = useState(() => new URLSearchParams(window.location.search).get('debug') === '1');
  const saveSettings = useCallback((input: TrainingSettings) => {
    const next = validateSettings(input);
    setSettings(next);
    setStorageAvailable(persistSettings(next));
  }, []);
  const positions = useMemo(() => activePositions(settings), [settings]);
  const scenarios = useMemo(() => SCENARIOS.map((s) => configureScenario(s, settings)), [settings]);
  const names = useMemo(() => Object.fromEntries(DEFENSIVE_POSITIONS.map((p) => [p, p])) as Record<DefensivePosition, string>, []);
  const value = useMemo(() => ({ settings, saveSettings, storageAvailable, positions, names, scenarios, speed, setSpeed, debug, setDebug }), [settings, saveSettings, storageAvailable, positions, names, scenarios, speed, debug]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
