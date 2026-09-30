import type { BaseName, Coordinate, DefensivePosition } from './types';

/**
 * CENTRALIZED FIELD COORDINATES
 *
 * All coordinates are normalized to a 0–100 square.
 *   x: 0 = left (third-base side) … 100 = right (first-base side)
 *   y: 0 = deep outfield … 100 = behind home plate
 *
 * Tune positioning here (turn on Debug mode and tap the field to read
 * coordinates). Nothing else in the app hard-codes a field location.
 */

export const FIELD = {
  home: { x: 50, y: 88 },
  /** Distance from home plate to the outfield fence. */
  fenceRadius: 68,
  /** Radius of the infield dirt arc, measured from the mound. */
  infieldArcRadius: 22.5,
} as const;

export interface FieldLocation extends Coordinate {
  /** Short label used on quiz target pins. */
  label: string;
  /**
   * Quiz grouping. Several tactical spots can count as the same answer
   * (e.g. the spot where a fielder stands to cover first IS "first base").
   */
  target: QuizTarget;
}

export type QuizTarget =
  | 'FIRST'
  | 'SECOND'
  | 'THIRD'
  | 'HOME'
  | 'BALL'
  | 'BEHIND_FIRST'
  | 'BEHIND_SECOND'
  | 'BEHIND_THIRD'
  | 'BEHIND_HOME'
  | 'CUTOFF_LEFT'
  | 'CUTOFF_RIGHT'
  | 'BEHIND_LF'
  | 'BEHIND_RF'
  | 'BEHIND_SS'
  | 'BEHIND_2B'
  | 'BEHIND_3B'
  | 'BEHIND_1B'
  | 'TOWARD_FIRST'
  | 'READY'
  | 'NONE';

const loc = (x: number, y: number, label: string, target: QuizTarget): FieldLocation => ({
  x,
  y,
  label,
  target,
});

export const LOCATIONS = {
  // ── Bases ────────────────────────────────────────────────
  HOME: loc(50, 88, 'Home', 'HOME'),
  FIRST_BASE: loc(66, 72, '1st', 'FIRST'),
  SECOND_BASE: loc(50, 56, '2nd', 'SECOND'),
  THIRD_BASE: loc(34, 72, '3rd', 'THIRD'),
  MOUND: loc(50, 72, 'Mound', 'NONE'),

  // ── Where a fielder stands to COVER a base (just inside the bag) ──
  COVER_HOME_SPOT: loc(50, 90.4, 'Home', 'HOME'),
  COVER_FIRST_SPOT: loc(64.4, 70.6, '1st', 'FIRST'),
  COVER_SECOND_SPOT: loc(50, 58.2, '2nd', 'SECOND'),
  COVER_THIRD_SPOT: loc(35.6, 70.6, '3rd', 'THIRD'),

  // ── Backups ──────────────────────────────────────────────
  BACKUP_FIRST: loc(72.8, 77.5, 'Behind 1st', 'BEHIND_FIRST'),
  BACKUP_SECOND_LEFT: loc(43.5, 44, 'Behind 2nd', 'BEHIND_SECOND'),
  BACKUP_SECOND_RIGHT: loc(56.5, 44, 'Behind 2nd', 'BEHIND_SECOND'),
  BACKUP_THIRD: loc(27.2, 77.5, 'Behind 3rd', 'BEHIND_THIRD'),
  BACKUP_THIRD_DEEP: loc(22, 73, 'Behind 3rd', 'BEHIND_THIRD'),
  BACKUP_HOME: loc(42.5, 95, 'Behind home', 'BEHIND_HOME'),
  BACKUP_LEFT_SIDE: loc(36.5, 52, 'Behind SS', 'BEHIND_SS'),
  BACKUP_RIGHT_SIDE: loc(63.5, 52, 'Behind 2B', 'BEHIND_2B'),
  BACKUP_3B_FIELDER: loc(31.5, 55, 'Behind 3B', 'BEHIND_3B'),
  BACKUP_1B_FIELDER: loc(69.5, 59.5, 'Behind 1B', 'BEHIND_1B'),
  BACKUP_LF: loc(18.5, 31, 'Behind LF', 'BEHIND_LF'),
  BACKUP_RF: loc(81.5, 31, 'Behind RF', 'BEHIND_RF'),
  BACKUP_GAP_LEFT: loc(28, 27.5, 'Behind him', 'BEHIND_LF'),
  BACKUP_GAP_RIGHT: loc(70, 28.5, 'Behind him', 'BEHIND_RF'),
  BACKUP_DEEP_LF: loc(26, 35, 'Near LF', 'BEHIND_LF'),
  // Pitcher breaks toward first on infield grounders (coach confirmed).
  P_TOWARD_FIRST: loc(57, 78.5, 'Toward 1st', 'TOWARD_FIRST'),

  // ── Cutoffs / relays ─────────────────────────────────────
  SS_CUTOFF_LEFT: loc(35, 50, 'Cutoff', 'CUTOFF_LEFT'),
  SECOND_BASE_CUTOFF_RIGHT: loc(65, 50, 'Cutoff', 'CUTOFF_RIGHT'),
  SS_RELAY_DEEP: loc(29, 43.5, 'Relay', 'CUTOFF_LEFT'),

  // ── "Come in and be ready" spots for far-side outfielders ──
  LF_READY: loc(25, 47, 'Be ready', 'READY'),
  LCF_READY: loc(41, 38, 'Be ready', 'READY'),
  RCF_READY: loc(59, 38, 'Be ready', 'READY'),
  RF_READY: loc(75, 47, 'Be ready', 'READY'),

  // ── Where batted balls go ────────────────────────────────
  GROUNDER_SS: loc(42, 61.5, 'The ball', 'BALL'),
  GROUNDER_SS_BOBBLE: loc(38.5, 59.5, 'The ball', 'BALL'),
  GROUNDER_2B: loc(58, 61.5, 'The ball', 'BALL'),
  GROUNDER_3B: loc(37, 63.5, 'The ball', 'BALL'),
  GROUNDER_1B_NEAR: loc(66, 67, 'The ball', 'BALL'),
  GROUNDER_1B_AWAY: loc(60, 64, 'The ball', 'BALL'),
  LEFT_FIELD_BALL: loc(25, 44, 'The ball', 'BALL'),
  RIGHT_FIELD_BALL: loc(75, 44, 'The ball', 'BALL'),
  FLY_LF: loc(22.5, 38.5, 'The ball', 'BALL'),
  FLY_RF: loc(77.5, 38.5, 'The ball', 'BALL'),
  GROUNDER_P: loc(51.5, 76.5, 'The ball', 'BALL'),
  DRIBBLER_C: loc(54.5, 82.5, 'The ball', 'BALL'),
  GAP_LEFT_BALL: loc(31, 35, 'The ball', 'BALL'),
  GAP_RIGHT_BALL: loc(67, 36, 'The ball', 'BALL'),
  POPUP_SS_SPOT: loc(41, 64, 'The ball', 'BALL'),
  OVER_LF: loc(18, 30, 'The ball', 'BALL'),

  // ── Where a ball ends up when NOBODY backs up ────────────
  LOOSE_PAST_FIRST: loc(83, 84, 'Loose ball', 'NONE'),
  LOOSE_PAST_THIRD: loc(17, 84, 'Loose ball', 'NONE'),
  LOOSE_BACKSTOP: loc(40, 99, 'Loose ball', 'NONE'),
  WILD_PAST_FIRST: loc(79, 62, 'Loose ball', 'NONE'),
  WILD_PAST_SECOND: loc(58, 44, 'Loose ball', 'NONE'),
  LOOSE_PAST_SECOND: loc(33, 52, 'Loose ball', 'NONE'),
} satisfies Record<string, FieldLocation>;

export type LocationKey = keyof typeof LOCATIONS;

/** Where each position stands before the pitch. */
export const START_POSITIONS: Record<DefensivePosition, Coordinate> = {
  C: { x: 50, y: 92 },
  P: { x: 50, y: 71 },
  '1B': { x: 69, y: 67 },
  '2B': { x: 59.5, y: 58.5 },
  SS: { x: 40.5, y: 58.5 },
  '3B': { x: 31, y: 67 },
  LF: { x: 22, y: 42 },
  CF: { x: 50, y: 31 },
  LCF: { x: 40, y: 31 },
  RCF: { x: 60, y: 31 },
  RF: { x: 78, y: 42 },
};

/**
 * Runner coordinates at each base. Runners stand just OUTSIDE the bag so the
 * fielder covering the base (standing just inside) is still visible.
 */
export const RUNNER_BASE_SPOTS: Record<BaseName, Coordinate> = {
  HOME: { x: 46.5, y: 88.5 }, // batter's box
  FIRST: { x: 67.4, y: 73.6 },
  SECOND: { x: 50, y: 54.2 },
  THIRD: { x: 32.6, y: 73.6 },
};

export const BASE_ORDER: BaseName[] = ['HOME', 'FIRST', 'SECOND', 'THIRD', 'HOME'];

/** Where the (coach) pitch is thrown from. */
export const PITCH_RELEASE: Coordinate = { x: 50, y: 74 };

export const coord = (key: LocationKey): Coordinate => {
  const l = LOCATIONS[key];
  return { x: l.x, y: l.y };
};

export const distance = (a: Coordinate, b: Coordinate): number =>
  Math.hypot(a.x - b.x, a.y - b.y);
