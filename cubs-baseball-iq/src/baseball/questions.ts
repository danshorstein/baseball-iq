import { CONCEPT_LABELS, type Concept } from './assignments';
import { LOCATIONS, START_POSITIONS, coord, distance, type QuizTarget } from './coordinates';
import { resolveScenario, type ResolvedPlay } from './scenarioResolver';
import type { ChoiceOption, Scenario } from './scenarioTypes';
import { PLAY_TYPE_TEXT, playTypeFor } from './teachingRules';
import type { Coordinate, DefensivePosition } from './types';

/**
 * QUIZ QUESTION BUILDER
 *
 * "Where should NAME go?" answers are NOT hand-written. They come from the
 * rule engine, so a quiz can never disagree with the animation.
 */

export interface TargetPin extends Coordinate {
  id: QuizTarget | 'STAY';
  label: string;
}

export interface DestinationQuestion {
  kind: 'DESTINATION';
  id: string;
  scenarioId: string;
  position: DefensivePosition;
  customPrompt?: string;
  correctId: TargetPin['id'];
  targets: TargetPin[];
  concept: Concept;
  cheer: string;
  explanation: string;
  hint: string;
}

export interface ChoiceQuestion {
  kind: 'CHOICE';
  id: string;
  scenarioId: string;
  position?: DefensivePosition;
  prompt: string;
  choices: ChoiceOption[];
  correctId: string;
  correctTitle: string;
  explanation: string;
  concept: Concept;
  /** Where in the play the question appears. */
  pauseAt: 'HIT' | 'DECISION' | 'HIGHLIGHT';
  hint: string;
}

export type Question = DestinationQuestion | ChoiceQuestion;

const BASE_PINS: TargetPin[] = [
  { id: 'FIRST', label: '1st', ...coord('FIRST_BASE') },
  { id: 'SECOND', label: '2nd', ...coord('SECOND_BASE') },
  { id: 'THIRD', label: '3rd', ...coord('THIRD_BASE') },
  { id: 'HOME', label: 'Home', ...coord('HOME') },
];
const EXTRA_PINS: TargetPin[] = [
  { id: 'BEHIND_FIRST', label: 'Behind 1st', ...coord('BACKUP_FIRST') },
  { id: 'BEHIND_THIRD', label: 'Behind 3rd', ...coord('BACKUP_THIRD') },
  { id: 'BEHIND_HOME', label: 'Behind home', ...coord('BACKUP_HOME') },
  { id: 'BEHIND_SECOND', label: 'Behind 2nd', ...coord('BACKUP_SECOND_RIGHT') },
];

function pinFor(resolved: ResolvedPlay, pos: DefensivePosition): TargetPin {
  const a = resolved.assignments[pos];
  if (a.destination === null) return { id: 'STAY', label: 'Stay here', ...START_POSITIONS[pos] };
  if (a.destination === 'BALL') {
    return { id: 'BALL', label: 'The ball', ...coord(resolved.ballLocation ?? 'MOUND') };
  }
  const l = LOCATIONS[a.destination];
  return { id: l.target, label: l.label, x: l.x, y: l.y };
}

/** Correct pin + 3 believable wrong pins that don't overlap on screen. */
export function buildTargets(resolved: ResolvedPlay, pos: DefensivePosition): TargetPin[] {
  const correct = pinFor(resolved, pos);
  const chosen: TargetPin[] = [correct];
  const pool: TargetPin[] = [];
  if (resolved.ballLocation && correct.id !== 'BALL') {
    pool.push({ id: 'BALL', label: 'The ball', ...coord(resolved.ballLocation) });
  }
  const start = START_POSITIONS[pos];
  const rest = [...BASE_PINS, ...EXTRA_PINS].sort((a, b) => distance(a, start) - distance(b, start));
  pool.push(...rest);
  for (const p of pool) {
    if (chosen.length >= 4) break;
    if (chosen.some((c) => c.id === p.id || distance(c, p) < 7.5)) continue;
    chosen.push(p);
  }
  // Stable, position-based order so the answer isn't always first.
  return chosen.sort((a, b) => a.x - b.x || a.y - b.y);
}

export function destinationQuestion(scenario: Scenario, pos: DefensivePosition): DestinationQuestion {
  const resolved = resolveScenario({ event: scenario.event, ...scenario.gameState, overrides: scenario.overrides });
  const a = resolved.assignments[pos];
  const targets = buildTargets(resolved, pos);
  return {
    kind: 'DESTINATION',
    id: `${scenario.id}:${pos}`,
    scenarioId: scenario.id,
    position: pos,
    customPrompt: scenario.prompts?.[pos],
    correctId: pinFor(resolved, pos).id,
    targets,
    concept: a.concept,
    cheer: a.cheer,
    explanation: a.explanation,
    hint: a.hint,
  };
}

const BASE_WORD: Record<string, string> = { FIRST: 'first', SECOND: 'second', THIRD: 'third', HOME: 'home' };

export function forceTagQuestion(scenario: Scenario): ChoiceQuestion | null {
  const ft = scenario.forceTag;
  if (!ft) return null;
  const type = playTypeFor(ft.runner, scenario.gameState.runners);
  return {
    kind: 'CHOICE',
    id: `${scenario.id}:force-tag`,
    scenarioId: scenario.id,
    prompt: `Is the play at ${BASE_WORD[ft.base]} a FORCE or a TAG?`,
    choices: [
      { id: 'FORCE', label: 'FORCE 👟 touch the base' },
      { id: 'TAG', label: 'TAG 🧤 tag the runner' },
    ],
    correctId: type,
    correctTitle: `YES! ${PLAY_TYPE_TEXT[type].title}!`,
    explanation: PLAY_TYPE_TEXT[type].text,
    concept: 'FORCE_VS_TAG',
    pauseAt: 'HIGHLIGHT',
    hint: 'Does the runner HAVE to run? Look at the bases behind him.',
  };
}

export function decisionQuestion(scenario: Scenario): ChoiceQuestion | null {
  const d = scenario.decision;
  if (!d) return null;
  return {
    kind: 'CHOICE',
    id: `${scenario.id}:decision`,
    scenarioId: scenario.id,
    position: d.position,
    prompt: d.prompt,
    choices: d.choices,
    correctId: d.correctId,
    correctTitle: d.correctTitle,
    explanation: d.explanation,
    concept: 'HOLD_THE_BALL',
    pauseAt: 'DECISION',
    hint: 'The runners stopped. Is there really a play?',
  };
}

export function choiceQuestions(scenario: Scenario): ChoiceQuestion[] {
  return (scenario.choiceQuestions ?? []).map((c) => ({
    kind: 'CHOICE',
    id: `${scenario.id}:${c.id}`,
    scenarioId: scenario.id,
    position: c.position,
    prompt: c.prompt,
    choices: c.choices,
    correctId: c.correctId,
    correctTitle: c.correctTitle,
    explanation: c.explanation,
    concept: c.concept,
    pauseAt: 'HIT',
    hint: 'Remember: the ball only needs one kid.',
  }));
}

/** The short quiz shown after watching a scenario inside a lesson. */
export function lessonQuestions(scenario: Scenario): Question[] {
  const out: Question[] = [];
  const ft = forceTagQuestion(scenario);
  const dec = decisionQuestion(scenario);
  if (dec) return [dec];
  out.push(...choiceQuestions(scenario));
  if (ft) out.push(ft);

  const positions: DefensivePosition[] = [];
  for (const p of Object.keys(scenario.prompts ?? {}) as DefensivePosition[]) positions.push(p);
  for (const c of scenario.choiceQuestions ?? []) if (c.position && !positions.includes(c.position)) positions.push(c.position);
  for (const p of scenario.relevantPositions) {
    if (positions.length >= (ft ? 1 : 2)) break;
    if (!positions.includes(p)) positions.push(p);
  }
  for (const p of positions) out.push(destinationQuestion(scenario, p));
  return out;
}

export const conceptLabel = (c: Concept) => CONCEPT_LABELS[c];
