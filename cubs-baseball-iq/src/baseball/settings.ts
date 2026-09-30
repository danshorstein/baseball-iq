import { START_POSITIONS } from './coordinates';
import type { Coordinate, DefensivePosition } from './types';
import { DEFAULT_TEAM_COLORS, validateTeamColors, type TeamColors } from '../theme/teamColors';

export type AgeGroup = '8U' | '10U' | '12U' | '14U';
export interface TrainingSettings {
  ageGroup: AgeGroup;
  competition: 'rec' | 'advanced' | 'travel';
  pitching: 'coach' | 'machine' | 'player';
  fielders: 9 | 10;
  basePath: 60 | 65 | 70 | 80 | 90;
  leadingOff: boolean;
  stealing: 'none' | 'plate' | 'release';
  droppedThirdStrike: boolean;
  infieldFly: boolean;
  overthrowFirst: 'one-extra' | 'live';
  playEnds: 'controlled' | 'umpire';
  batter: 'balanced' | 'power' | 'developing';
  teamName: string;
  rulesSource: string;
  teamColors: TeamColors;
}

export const AGE_LABELS: Record<AgeGroup, string> = {
  '8U': '6–8U', '10U': '9–10U', '12U': '11–12U', '14U': '13–14U',
};

/** Editable training templates. These are not an organization's official rules. */
export function ageDefaults(ageGroup: AgeGroup): TrainingSettings {
  const young = ageGroup === '8U';
  const older = ageGroup === '14U';
  return {
    ageGroup, competition: 'rec', pitching: young ? 'coach' : 'player',
    fielders: young ? 10 : 9, basePath: older ? 90 : 60,
    leadingOff: older, stealing: young ? 'none' : older ? 'release' : 'plate',
    droppedThirdStrike: ageGroup === '12U' || older,
    infieldFly: !young, overthrowFirst: young ? 'one-extra' : 'live',
    playEnds: young ? 'controlled' : 'umpire', batter: 'balanced',
    teamName: '', rulesSource: '',
    teamColors: { ...DEFAULT_TEAM_COLORS },
  };
}

export const DEFAULT_SETTINGS = ageDefaults('10U');
const INFIELD: DefensivePosition[] = ['C', 'P', '1B', '2B', 'SS', '3B'];
export function activePositions(settings: TrainingSettings): DefensivePosition[] {
  return [...INFIELD, 'LF', ...(settings.fielders === 9 ? ['CF' as const] : ['LCF' as const, 'RCF' as const]), 'RF'];
}

export function startingPositions(settings: TrainingSettings): Record<DefensivePosition, Coordinate> {
  const result = structuredClone(START_POSITIONS);
  const depth = settings.batter === 'power' ? -5 : settings.batter === 'developing' ? 4 : 0;
  for (const pos of ['LF', 'CF', 'LCF', 'RCF', 'RF'] as const) result[pos].y += depth;
  return result;
}

export function batterAdvice(settings: TrainingSettings): string {
  if (settings.batter === 'power') return 'Strong contact: start the outfield a few steps deeper to protect against extra bases. Adjust to what you have actually seen.';
  if (settings.batter === 'developing') return 'Developing contact: the outfield starts a few steps shallower. Stay ready for a ball over your head; contact strength does not tell you running speed.';
  return 'Balanced contact: use normal starting depth, then adjust to the batter and your coach’s plan.';
}

export function ruleNotes(s: TrainingSettings): string[] {
  return [
    s.leadingOff ? 'Leading off is enabled. Watch runners before the pitch.' : 'No leading off. Stay on the base until your league’s allowed release point.',
    s.stealing === 'none' ? 'Stealing is disabled in this setup.' : s.stealing === 'plate' ? 'Stealing starts after the pitch reaches home plate.' : 'Stealing starts when the pitcher releases the ball.',
    s.overthrowFirst === 'one-extra' ? 'Local training rule: an overthrow at first allows at most one extra base. A backup can still prevent that advance.' : 'An overthrow that stays in play is live: runners may advance at their own risk. A throw out of play has a separate base award.',
    s.playEnds === 'controlled' ? 'Local training rule: control the ball in front of the lead runner and request time. Follow your league’s exact stopping rule; do not assume yelling “time” is enough.' : 'The ball stays live until the umpire calls time or a rule makes it dead. Holding the ball does not automatically stop runners.',
    s.droppedThirdStrike ? 'An uncaught third strike can let the batter try for first when first is unoccupied, or with two outs. Complete the out with a tag or throw.' : 'The batter cannot advance on an uncaught third strike in this setup.',
    s.infieldFly ? 'Infield fly is enabled: fewer than two outs, first and second occupied (or bases loaded), and a fair fly an infielder can catch with ordinary effort. The umpire makes the call; runners are not forced by that batter.' : 'Infield fly is disabled in this setup. Do not assume a pop-up automatically retires the batter.',
  ];
}

/** Only known keys and values survive loading or importing browser settings. */
export function validateSettings(value: unknown): TrainingSettings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_SETTINGS };
  const v = value as Record<string, unknown>;
  const age = Object.hasOwn(AGE_LABELS, String(v.ageGroup)) ? v.ageGroup as AgeGroup : DEFAULT_SETTINGS.ageGroup;
  const result = ageDefaults(age);
  result.teamColors = validateTeamColors(v.teamColors);
  const allowed = {
    competition: ['rec', 'advanced', 'travel'], pitching: ['coach', 'machine', 'player'],
    fielders: [9, 10], basePath: [60, 65, 70, 80, 90], stealing: ['none', 'plate', 'release'],
    overthrowFirst: ['one-extra', 'live'], playEnds: ['controlled', 'umpire'],
    batter: ['balanced', 'power', 'developing'],
  };
  for (const [key, options] of Object.entries(allowed)) {
    if ((options as unknown[]).includes(v[key])) Object.assign(result, { [key]: v[key] });
  }
  for (const key of ['leadingOff', 'droppedThirdStrike', 'infieldFly'] as const) {
    if (typeof v[key] === 'boolean') result[key] = v[key];
  }
  for (const key of ['teamName', 'rulesSource'] as const) {
    if (typeof v[key] === 'string') result[key] = v[key].slice(0, key === 'teamName' ? 60 : 300);
  }
  // A base runner who may lead can move before release; "plate" is contradictory.
  if (result.leadingOff && result.stealing === 'plate') result.stealing = 'release';
  return result;
}
