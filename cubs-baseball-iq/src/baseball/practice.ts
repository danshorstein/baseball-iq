import { choiceQuestions, decisionQuestion, destinationQuestion, forceTagQuestion, prePitchDestinationQuestion, prePitchQuestion, type Question } from './questions';
import type { Scenario } from './scenarioTypes';
import type { DefensivePosition } from './types';

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
}
function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** A varied session about a position; no roster or fixed inning count is needed. */
export function buildPositionSession(position: DefensivePosition, scenarios: Scenario[], mode: 'practice' | 'pitch', seed = Date.now()): Question[] {
  const random = rng(seed);
  const candidates: Question[] = [];
  for (const s of shuffle(scenarios, random)) {
    if (mode === 'pitch') {
      const q = prePitchQuestion(s);
      if (q?.position === position) candidates.push(q);
      else if (s.relevantPositions.includes(position)) candidates.push(prePitchDestinationQuestion(s, position));
    } else {
      const extras = [decisionQuestion(s), ...choiceQuestions(s)].filter((q): q is NonNullable<typeof q> => !!q && q.position === position);
      candidates.push(...extras);
      if (s.relevantPositions.includes(position)) candidates.push(destinationQuestion(s, position));
    }
  }
  const picked: Question[] = [];
  const counts = new Map<string, number>();
  for (const q of candidates) {
    const key = q.kind === 'DESTINATION' ? q.correctId : q.concept;
    if ((counts.get(key) ?? 0) >= 3) continue;
    picked.push(q); counts.set(key, (counts.get(key) ?? 0) + 1);
    if (picked.length === 8) break;
  }
  if (mode === 'practice') for (const s of shuffle(scenarios, random)) {
    if (picked.length >= 8) break;
    const q = forceTagQuestion(s);
    if (q && !picked.some((p) => p.id === q.id)) picked.push(q);
  }
  return picked;
}
