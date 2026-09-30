import type { DefensiveLineup, PlayerId } from '../data/lineups';
import { positionOf } from '../data/lineups';
import { SCENARIOS } from '../data/scenarios';
import {
  choiceQuestions,
  decisionQuestion,
  destinationQuestion,
  forceTagQuestion,
  prePitchDestinationQuestion,
  prePitchQuestion,
  type Question,
} from './questions';
import type { DefensivePosition } from './types';

/**
 * PRACTICE MY GAME
 *
 * 1. Look up the player's position in each inning.
 * 2. For each inning (skipping bench), pull scenarios whose
 *    `relevantPositions` include that position.
 * 3. Build "Where should you go?" questions for that position, plus any
 *    hold-the-ball / don't-chase questions that belong to that position.
 * 4. Prefer variety (not the same answer over and over), aim for ~10 total.
 */

export interface PracticeRound {
  inning: number;
  position: DefensivePosition;
  questions: Question[];
}

export interface PracticeSession {
  playerId: PlayerId;
  rounds: PracticeRound[];
  total: number;
}

/** Small seeded RNG so a session is varied but reproducible in debug. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const answerKey = (q: Question) => (q.kind === 'DESTINATION' ? q.correctId : q.concept);

export function buildPracticeSession(
  playerId: PlayerId,
  lineups: DefensiveLineup[],
  seed = Date.now(),
): PracticeSession {
  const rand = rng(seed);
  const active = lineups
    .map((l) => ({ inning: l.inning, position: positionOf(l, playerId) }))
    .filter((r): r is { inning: number; position: DefensivePosition } => r.position !== 'BENCH');

  const perRound = active.length ? Math.max(2, Math.min(4, Math.round(10 / active.length))) : 0;
  const used = new Set<string>();

  const rounds: PracticeRound[] = active.map(({ inning, position }) => {
    const candidates: Question[] = [];
    for (const s of shuffle(SCENARIOS, rand)) {
      const extra = [decisionQuestion(s), ...choiceQuestions(s)].filter(
        (q): q is NonNullable<typeof q> => !!q && q.position === position,
      );
      candidates.push(...extra);
      if (s.relevantPositions.includes(position)) candidates.push(destinationQuestion(s, position));
    }
    // Pick with variety: at most 2 questions with the same answer per round.
    const picked: Question[] = [];
    const answerCount = new Map<string, number>();
    for (const q of candidates) {
      if (picked.length >= perRound) break;
      if (used.has(q.id)) continue;
      const k = answerKey(q);
      if ((answerCount.get(k) ?? 0) >= 2) continue;
      picked.push(q);
      used.add(q.id);
      answerCount.set(k, (answerCount.get(k) ?? 0) + 1);
    }
    return { inning, position, questions: picked };
  });

  // Top up with Force-or-Tag questions if we're short of 8.
  let total = rounds.reduce((n, r) => n + r.questions.length, 0);
  if (rounds.length && total < 8) {
    const ft = shuffle(SCENARIOS, rand)
      .map(forceTagQuestion)
      .filter((q): q is NonNullable<typeof q> => !!q && !used.has(q.id));
    const last = rounds[rounds.length - 1];
    while (total < 8 && ft.length) {
      last.questions.push(ft.shift()!);
      total++;
    }
  }

  return { playerId, rounds: rounds.filter((r) => r.questions.length), total };
}

/**
 * BEFORE THE PITCH
 * For each inning the kid plays: 1–2 "it's hit to YOU, what's the play?"
 * questions, plus "it's hit over THERE, where do you go?" to fill ~8 total.
 * Every question is asked with the field frozen before the pitch.
 */
export function buildBeforePitchSession(
  playerId: PlayerId,
  lineups: DefensiveLineup[],
  seed = Date.now(),
): PracticeSession {
  const rand = rng(seed);
  const active = lineups
    .map((l) => ({ inning: l.inning, position: positionOf(l, playerId) }))
    .filter((r): r is { inning: number; position: DefensivePosition } => r.position !== 'BENCH');
  const perRound = active.length ? Math.max(2, Math.min(4, Math.round(8 / active.length))) : 0;
  const usedScenario = new Set<string>();
  const usedAnswer = new Set<string>();

  const rounds: PracticeRound[] = active.map(({ inning, position }) => {
    const picked: Question[] = [];
    // 1) It's hit to you.
    for (const s of shuffle(SCENARIOS, rand)) {
      if (picked.length >= Math.min(2, perRound - 1)) break;
      if (usedScenario.has(s.id)) continue;
      const q = prePitchQuestion(s);
      if (!q || q.position !== position) continue;
      const key = `${position}:${q.correctId}:${s.gameState.runners.join('')}`;
      if (usedAnswer.has(key)) continue;
      usedAnswer.add(key);
      usedScenario.add(s.id);
      picked.push(q);
    }
    // 2) It's hit somewhere else — where do you go?
    for (const s of shuffle(SCENARIOS, rand)) {
      if (picked.length >= perRound) break;
      if (usedScenario.has(s.id) || !s.relevantPositions.includes(position)) continue;
      const q = prePitchDestinationQuestion(s, position);
      const key = `${position}:dest:${q.correctId}`;
      if (usedAnswer.has(key)) continue;
      usedAnswer.add(key);
      usedScenario.add(s.id);
      picked.push(q);
    }
    return { inning, position, questions: picked };
  });

  const total = rounds.reduce((n, r) => n + r.questions.length, 0);
  return { playerId, rounds: rounds.filter((r) => r.questions.length), total };
}
