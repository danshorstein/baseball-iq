import { DEFAULT_SETTINGS, validateSettings, type TrainingSettings } from '../baseball/settings';

export const SETTINGS_KEY = 'baseball-iq:settings:v1';
export function loadSettings(): TrainingSettings {
  try { return validateSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null')); }
  catch { return { ...DEFAULT_SETTINGS }; }
}
/** Returns false when saving is blocked so the app can tell the coach. */
export function persistSettings(settings: TrainingSettings): boolean {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); return true; }
  catch { return false; }
}
