import type { LocationKey } from './coordinates';
import type {
  AssignmentAction,
  BallEvent,
  BallType,
  DefensivePosition,
  RunnerBase,
} from './types';

/**
 * THE COACH'S DEFENSIVE SYSTEM
 *
 * One rule per BallEvent. Each rule says what every position does.
 * To change a responsibility, edit the line for that position — no
 * component or animation code needs to change.
 *
 * COACH'S SECOND-BASE RULE: ball hit LEFT of the pitcher → 2B covers second.
 * Ball hit RIGHT of the pitcher → SS covers second.
 *
 * Anything marked TODO(coach) is a spot where the build spec was not
 * specific; a sensible 8U default was chosen and flagged for review.
 */

export interface RuleAssignment {
  action: AssignmentAction;
  /** Override the catalog's default destination. */
  destination?: LocationKey | 'BALL' | null;
  /** Kid-friendly "why" for this position in this play. */
  explanation: string;
  /** Flag for coach review. Shown in Debug mode. */
  todo?: string;
}

export type PositionRules = Record<DefensivePosition, RuleAssignment>;

export interface RuleVariant {
  /** Applies when ALL of these bases have a runner. */
  whenRunnersOn: RunnerBase[];
  note: string;
  assignments: Partial<PositionRules>;
}

export interface DefensiveRule {
  event: BallEvent;
  description: string;
  ballLocation: LocationKey | null;
  ballType: BallType;
  /** Who fields the ball (null = someone already has it). */
  primaryFielder: DefensivePosition | null;
  assignments: PositionRules;
  variants?: RuleVariant[];
}

const a = (
  action: AssignmentAction,
  explanation: string,
  extra: Partial<RuleAssignment> = {},
): RuleAssignment => ({ action, explanation, ...extra });


// ─────────────────────────────────────────────────────────────
// GROUND BALLS
// ─────────────────────────────────────────────────────────────

const GROUND_BALL_SS: DefensiveRule = {
  event: 'GROUND_BALL_SS',
  description: 'Ground ball to the shortstop',
  ballLocation: 'GROUNDER_SS',
  ballType: 'GROUND',
  primaryFielder: 'SS',
  assignments: {
    SS: a('FIELD_BALL', "It's hit to you! Field it and make the sure throw."),
    '2B': a('COVER_SECOND', 'Ball is on the left side. You cover second!'),
    '1B': a('COVER_FIRST', 'Get to first and catch the throw!'),
    '3B': a('COVER_THIRD', 'Protect third base!'),
    LF: a('BACKUP_INFIELDER', 'Come in behind the shortstop in case it gets through!', {
      destination: 'BACKUP_LEFT_SIDE',
    }),
    LCF: a('BACKUP_SECOND', 'Move toward second in case a throw gets away!', {
      destination: 'BACKUP_SECOND_LEFT',
    }),
    RCF: a('BACKUP_SECOND', 'Move toward second in case a throw gets away!', {
      destination: 'BACKUP_SECOND_RIGHT',
    }),
    RF: a('BACKUP_FIRST', 'Get behind first in case the throw gets away!'),
    P: a('BACKUP_PLAY', "Don't watch from the mound. Move to help!"),
    C: a('COVER_HOME', 'Protect home and tell everyone where to throw!'),
  },
  variants: [
    {
      whenRunnersOn: ['FIRST'],
      note: 'Runner on first: second base may be the force.',
      assignments: {
        '2B': a('COVER_SECOND', 'Runner on first! Get to second — the shortstop will toss it to you for the force.'),
      },
    },
  ],
};

const GROUND_BALL_2B: DefensiveRule = {
  event: 'GROUND_BALL_2B',
  description: 'Ground ball to the second baseman',
  ballLocation: 'GROUNDER_2B',
  ballType: 'GROUND',
  primaryFielder: '2B',
  assignments: {
    '2B': a('FIELD_BALL', "It's hit to you! Field it and make the sure throw."),
    SS: a('COVER_SECOND', 'Ball is on the right side. You cover second!'),
    '1B': a('COVER_FIRST', 'Get to first and catch the throw!'),
    '3B': a('COVER_THIRD', 'Protect third base!'),
    RF: a('BACKUP_FIRST', 'Get behind first in case the throw gets away!'),
    RCF: a('BACKUP_INFIELDER', 'Come in behind the second baseman in case it gets through!', {
      destination: 'BACKUP_RIGHT_SIDE',
    }),
    LCF: a('BACKUP_SECOND', 'Move toward second in case a throw gets away!', {
      destination: 'BACKUP_SECOND_LEFT',
    }),
    LF: a('READY', 'Ball is on the other side. Come in a few steps and be ready.', {
      destination: 'LF_READY',
      todo: 'Spec does not give LF a job on a grounder to 2B. Defaulting to "come in and be ready".',
    }),
    P: a('BACKUP_PLAY', "Don't watch from the mound. Move to help!"),
    C: a('COVER_HOME', 'Protect home and tell everyone where to throw!'),
  },
  variants: [
    {
      whenRunnersOn: ['FIRST'],
      note: 'Runner on first: SS covers second for the force.',
      assignments: {
        SS: a('COVER_SECOND', 'Runner on first! Second baseman has the ball — you cover second for the force.'),
      },
    },
  ],
};

const GROUND_BALL_3B: DefensiveRule = {
  event: 'GROUND_BALL_3B',
  description: 'Ground ball to the third baseman',
  ballLocation: 'GROUNDER_3B',
  ballType: 'GROUND',
  primaryFielder: '3B',
  assignments: {
    '3B': a('FIELD_BALL', "It's hit to you! Field it and throw to first for the sure out."),
    SS: a('COVER_THIRD', 'Third baseman left the bag. You protect third!', {
      todo: 'Spec: SS protects third "when appropriate". Always covering third for now.',
    }),
    '2B': a('COVER_SECOND', 'Shortstop is helping at third. You cover second!'),
    '1B': a('COVER_FIRST', 'Get to first and catch the throw!'),
    LF: a('BACKUP_THIRD', 'Get behind third in case the ball gets away!'),
    LCF: a('BACKUP_SECOND', 'Move toward second in case a throw gets away!', {
      destination: 'BACKUP_SECOND_LEFT',
    }),
    RCF: a('BACKUP_SECOND', 'Move toward second in case a throw gets away!', {
      destination: 'BACKUP_SECOND_RIGHT',
    }),
    RF: a('BACKUP_FIRST', 'Long throw coming to first! Get behind first!'),
    P: a('BACKUP_PLAY', "Don't watch from the mound. Move to help!"),
    C: a('COVER_HOME', 'Protect home and tell everyone where to throw!'),
  },
};

const GROUND_BALL_1B: DefensiveRule = {
  event: 'GROUND_BALL_1B',
  description: 'Ground ball to the first baseman — near the bag',
  ballLocation: 'GROUNDER_1B_NEAR',
  ballType: 'GROUND',
  primaryFielder: '1B',
  assignments: {
    '1B': a('FIELD_BALL', "It's hit to you near the bag. Field it and step on first!"),
    P: a('BACKUP_PLAY', 'Break toward first in case the first baseman needs you!', {
      destination: 'P_TOWARD_FIRST',
    }),
    '2B': a('BACKUP_INFIELDER', 'Back up the first baseman in case it gets past!', {
      destination: 'BACKUP_RIGHT_SIDE',
      todo: 'Spec does not give 2B a job on a grounder to 1B. Defaulting to backing up behind the play.',
    }),
    SS: a('COVER_SECOND', 'Ball is on the right side. You cover second!'),
    '3B': a('COVER_THIRD', 'Protect third base!'),
    RF: a('BACKUP_FIRST', 'Get behind first in case it gets away!'),
    RCF: a('BACKUP_SECOND', 'Move toward second in case a throw gets away!', {
      destination: 'BACKUP_SECOND_RIGHT',
    }),
    LCF: a('READY', 'Come in a few steps and be ready.', { destination: 'LCF_READY' }),
    LF: a('READY', 'Come in a few steps and be ready.', { destination: 'LF_READY' }),
    C: a('COVER_HOME', 'Protect home and tell everyone where to throw!'),
  },
};

const GROUND_BALL_1B_OFF_BAG: DefensiveRule = {
  ...GROUND_BALL_1B,
  event: 'GROUND_BALL_1B_OFF_BAG',
  description: 'Ground ball pulls the first baseman AWAY from the bag',
  ballLocation: 'GROUNDER_1B_AWAY',
  assignments: {
    ...GROUND_BALL_1B.assignments,
    '1B': a('FIELD_BALL', 'You had to leave the bag to get it. Throw to the pitcher at first!'),
    P: a('COVER_FIRST', 'First baseman left the bag. Pitcher — run to first!'),
  },
};

// ─────────────────────────────────────────────────────────────
// OUTFIELD
// ─────────────────────────────────────────────────────────────

const SINGLE_LF: DefensiveRule = {
  event: 'SINGLE_LF',
  description: 'Base hit to left field',
  ballLocation: 'LEFT_FIELD_BALL',
  ballType: 'LINE',
  primaryFielder: 'LF',
  assignments: {
    LF: a('FIELD_BALL', 'Get the ball and throw it to the cutoff!'),
    LCF: a('BACKUP_FIELDER', 'Run behind left fielder in case it gets past him!', {
      destination: 'BACKUP_LF',
    }),
    SS: a('CUTOFF', 'Go out toward left field. Arms up! You are the cutoff.', {
      destination: 'SS_CUTOFF_LEFT',
    }),
    '3B': a('COVER_THIRD', 'Protect third base!'),
    '2B': a('COVER_SECOND', 'Shortstop went out for the cutoff. You cover second!'),
    '1B': a('COVER_FIRST', 'Stay at first in case the runner turns too far!'),
    C: a('COVER_HOME', 'Protect home and tell everyone where to throw!'),
    P: a('BACKUP_THIRD', 'Get behind third in case the throw gets away!'),
    RCF: a('BACKUP_SECOND', 'Move toward second in case a throw gets away!', {
      destination: 'BACKUP_SECOND_RIGHT',
    }),
    RF: a('BACKUP_FIRST', 'Ball is on the far side. Get behind first in case of a throw there!'),
  },
  variants: [
    {
      whenRunnersOn: ['SECOND'],
      note: 'Runner on second may try to score: pitcher backs up home.',
      assignments: {
        P: a('BACKUP_HOME', 'Runner might go home! Get behind the catcher.'),
      },
    },
  ],
};

const SINGLE_RF: DefensiveRule = {
  event: 'SINGLE_RF',
  description: 'Base hit to right field',
  ballLocation: 'RIGHT_FIELD_BALL',
  ballType: 'LINE',
  primaryFielder: 'RF',
  assignments: {
    RF: a('FIELD_BALL', 'Get the ball and throw it to the cutoff!'),
    RCF: a('BACKUP_FIELDER', 'Run behind right fielder in case it gets past him!', {
      destination: 'BACKUP_RF',
    }),
    '2B': a('CUTOFF', 'Go out toward right field. Arms up! You are the cutoff.', {
      destination: 'SECOND_BASE_CUTOFF_RIGHT',
    }),
    SS: a('COVER_SECOND', 'Second baseman went out for the cutoff. You cover second!'),
    '1B': a('COVER_FIRST', 'Stay at first in case the runner turns too far!'),
    '3B': a('COVER_THIRD', 'Protect third base!'),
    C: a('COVER_HOME', 'Protect home and tell everyone where to throw!'),
    P: a('BACKUP_THIRD', 'Get behind third in case the throw gets away!'),
    LCF: a('BACKUP_SECOND', 'Move toward second in case a throw gets away!', {
      destination: 'BACKUP_SECOND_LEFT',
    }),
    // P and LF both back up third here; LF sets up a little deeper so they don't collide.
    LF: a('BACKUP_THIRD', 'Ball is on the far side. Get behind third in case of a throw there!', {
      destination: 'BACKUP_THIRD_DEEP',
    }),
  },
  variants: [
    {
      whenRunnersOn: ['SECOND'],
      note: 'Runner on second may try to score: pitcher backs up home.',
      assignments: {
        P: a('BACKUP_HOME', 'Runner might go home! Get behind the catcher.'),
      },
    },
  ],
};

const FLY_BALL_LF: DefensiveRule = {
  ...SINGLE_LF,
  event: 'FLY_BALL_LF',
  description: 'Fly ball to left field',
  ballLocation: 'FLY_LF',
  ballType: 'FLY',
  assignments: {
    ...SINGLE_LF.assignments,
    LF: a('FIELD_BALL', 'Call it! Catch it and throw it to the cutoff!'),
    SS: a('CUTOFF', 'Go out and be the cutoff. Get the ball back in!', {
      destination: 'SS_CUTOFF_LEFT',
    }),
    P: a('BACKUP_HOME', 'Get behind home in case the throw gets past the catcher!'),
  },
  variants: [],
};

const FLY_BALL_RF: DefensiveRule = {
  ...SINGLE_RF,
  event: 'FLY_BALL_RF',
  description: 'Fly ball to right field',
  ballLocation: 'FLY_RF',
  ballType: 'FLY',
  assignments: {
    ...SINGLE_RF.assignments,
    RF: a('FIELD_BALL', 'Call it! Catch it and throw it to the cutoff!'),
    '2B': a('CUTOFF', 'Go out and be the cutoff. Get the ball back in!', {
      destination: 'SECOND_BASE_CUTOFF_RIGHT',
    }),
    P: a('BACKUP_HOME', 'Get behind home in case the throw gets past the catcher!'),
  },
  variants: [],
};

// ─────────────────────────────────────────────────────────────
// THROWS (backup lessons)
// ─────────────────────────────────────────────────────────────

/** Grounder to SS, throw across to first. RF must back it up. */
const THROW_FIRST: DefensiveRule = {
  ...GROUND_BALL_SS,
  event: 'THROW_FIRST',
  description: 'Throw to first base',
  assignments: {
    ...GROUND_BALL_SS.assignments,
    '1B': a('COVER_FIRST', 'Get to first and catch the throw!'),
    RF: a('BACKUP_FIRST', 'Throw is coming to first. Get behind first in case it gets away!'),
  },
  variants: [],
};

/** Runner on second, grounder to SS, throw to third. LF must back it up. */
const THROW_THIRD: DefensiveRule = {
  ...GROUND_BALL_SS,
  event: 'THROW_THIRD',
  description: 'Throw to third base',
  assignments: {
    ...GROUND_BALL_SS.assignments,
    '3B': a('COVER_THIRD', 'Get to third and catch the throw!'),
    LF: a('BACKUP_THIRD', 'Throw is coming to third. Get behind third in case it gets away!'),
  },
  variants: [],
};

/** Hit to left, runner heading home. Pitcher backs up the catcher. */
const THROW_HOME: DefensiveRule = {
  ...SINGLE_LF,
  event: 'THROW_HOME',
  description: 'Throw to home plate',
  assignments: {
    ...SINGLE_LF.assignments,
    C: a('COVER_HOME', 'Throw is coming home! Catch it and protect the plate!'),
    P: a('BACKUP_HOME', "Don't watch the play — get behind the catcher in case the throw gets past!"),
  },
  variants: [],
};

// ─────────────────────────────────────────────────────────────
// DECISIONS
// ─────────────────────────────────────────────────────────────

/**
 * Runners have stopped, someone has the ball, no realistic out.
 * The ball holder HOLDS THE BALL. Everyone else stays put.
 * (The resolver assigns HOLD_BALL to whoever `gameState.ballHolder` is.)
 */
const NO_PLAY_RUNNERS_STOPPED: DefensiveRule = {
  event: 'NO_PLAY_RUNNERS_STOPPED',
  description: 'Runners stopped — no play',
  ballLocation: null,
  ballType: 'NONE',
  primaryFielder: null,
  assignments: {
    C: a('COVER_HOME', 'Stay at home.'),
    P: a('HOLD_POSITION', 'Stay ready.'),
    '1B': a('HOLD_POSITION', 'Stay at your base.'),
    '2B': a('HOLD_POSITION', 'Stay at your base.'),
    SS: a('HOLD_POSITION', 'Stay ready.'),
    '3B': a('HOLD_POSITION', 'Stay at your base.'),
    LF: a('HOLD_POSITION', 'Stay ready.'),
    LCF: a('HOLD_POSITION', 'Stay ready.'),
    RCF: a('HOLD_POSITION', 'Stay ready.'),
    RF: a('HOLD_POSITION', 'Stay ready.'),
  },
};

export const HOLD_BALL_RULE: RuleAssignment = a(
  'HOLD_BALL',
  'There is no play. An unnecessary throw can give the runner another base. HOLD IT!',
);

export const DEFENSIVE_RULES: Record<BallEvent, DefensiveRule> = {
  GROUND_BALL_SS,
  GROUND_BALL_2B,
  GROUND_BALL_3B,
  GROUND_BALL_1B,
  GROUND_BALL_1B_OFF_BAG,
  SINGLE_LF,
  SINGLE_RF,
  FLY_BALL_LF,
  FLY_BALL_RF,
  THROW_FIRST,
  THROW_THIRD,
  THROW_HOME,
  NO_PLAY_RUNNERS_STOPPED,
};
