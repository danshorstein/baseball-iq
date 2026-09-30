import type { BaseName, RunnerBase, RunnerId } from './types';
import { RUNNER_START_BASE } from './types';

/** The coaching philosophy, shown throughout the app. */
export const PRINCIPLES = {
  mentalModel: 'BALL → BASE → BACKUP',
  oneKid: 'The ball only needs one kid. The play needs everybody.',
  nextPlay: 'Know where the next play is.',
  coverBase: 'Cover your base.',
  backUp: 'Back up throws.',
  getItIn: 'Get it in. Hit the cutoff.',
  shareSecond: 'SS and 2B share second base.',
  sideRule: 'Ball left of the pitcher → 2B covers 2nd. Ball right of the pitcher → SS covers 2nd.',
  closestSide: 'Throw to the closest, easiest out. Short toss to 2nd if he’s there — or take the out at 1st.',
  overthrowFirst: 'League rule: overthrow at 1st = the runner only gets ONE extra base.',
  overthrowOther: 'Overthrow anywhere else = runners keep going until an infielder has the ball in front of the lead runner and calls TIME.',
  pitcherBackup: "The pitcher doesn't watch the play. The pitcher backs it up.",
  catcher: 'Catcher protects home and talks.',
  dontThrow: "Don't throw it just because you have it.",
  holdIt: 'No play? HOLD THE BALL. ✋',
  extraBases: 'Backing up a throw prevents extra bases.',
  forceTag: 'Force = touch the base. Tag = tag the runner.',
} as const;

export const BALL_BASE_BACKUP = [
  { step: 'BALL', question: 'Where is the ball?' },
  { step: 'BASE', question: 'What base is mine?' },
  { step: 'BACKUP', question: 'Who am I backing up?' },
] as const;

/**
 * FORCE vs TAG
 *
 * A runner is FORCED to run when every base behind him is occupied
 * (the batter always forces the runner on first, and so on).
 *
 * `runner` is the runner we're asking about. `occupied` are the bases
 * that had runners when the ball was hit.
 */
export function isForced(runner: RunnerId, occupied: RunnerBase[]): boolean {
  const start = RUNNER_START_BASE[runner];
  if (start === 'HOME') return true; // batter must run to first
  const chain: BaseName[] = ['FIRST', 'SECOND', 'THIRD'];
  const idx = chain.indexOf(start);
  // All bases behind this runner must be occupied.
  for (let i = 0; i < idx; i++) {
    if (!occupied.includes(chain[i] as RunnerBase)) return false;
  }
  return true;
}

export type PlayType = 'FORCE' | 'TAG';

export const playTypeFor = (runner: RunnerId, occupied: RunnerBase[]): PlayType =>
  isForced(runner, occupied) ? 'FORCE' : 'TAG';

export const PLAY_TYPE_TEXT: Record<PlayType, { title: string; text: string }> = {
  FORCE: {
    title: 'FORCE PLAY',
    text: 'The runner HAS to run. Touch the base with the ball before he gets there!',
  },
  TAG: {
    title: 'TAG PLAY',
    text: "The runner doesn't have to go. You must TAG the runner!",
  },
};
