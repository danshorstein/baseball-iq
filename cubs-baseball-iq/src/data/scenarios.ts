import type { RuleAssignment } from '../baseball/defensiveRules';
import type {
  ChoiceOption,
  DecisionDef,
  RunnerMove,
  Scenario,
  ScenarioPhase,
} from '../baseball/scenarioTypes';
import { PLAY_TYPE_TEXT, PRINCIPLES } from '../baseball/teachingRules';
import type { BaseName, RunnerId } from '../baseball/types';

/**
 * SCENARIO LIBRARY
 *
 * Scenarios describe the SITUATION and what the ball/runners do.
 * Where each fielder goes is decided by the rule engine (defensiveRules.ts),
 * so fixing a responsibility there fixes it in every scenario.
 *
 * To add a scenario: copy one below, give it a new id, add it to SCENARIOS,
 * then (optionally) add the id to a lesson in lessons.ts.
 */

// ── little helpers to keep scenarios readable ──
const run = (runner: RunnerId, to: BaseName, extra: Partial<RunnerMove> = {}): RunnerMove => ({
  runner,
  to,
  ...extra,
});
const PITCH: ScenarioPhase = { kind: 'PITCH', caption: 'Here comes the pitch…' };
const REACT: ScenarioPhase = { kind: 'REACT', caption: 'Everybody moves!' };
const hit = (caption: string, runners: RunnerMove[] = [run('BATTER', 'FIRST')]): ScenarioPhase => ({
  kind: 'HIT',
  caption,
  runners,
});
const chase = (): RuleAssignment => ({
  action: 'CHASE_BALL',
  explanation: 'Chasing the ball left your job empty!',
});
const stayPut = (why: string): RuleAssignment => ({ action: 'HOLD_POSITION', explanation: why });

const HOLD_CHOICES: ChoiceOption[] = [
  { id: 'THROW_2B', label: 'THROW TO 2ND' },
  { id: 'THROW_1B', label: 'THROW TO 1ST' },
  { id: 'HOLD', label: 'HOLD THE BALL ✋' },
];
const holdDecision = (
  d: Pick<DecisionDef, 'position' | 'wrongPhases'> & Partial<DecisionDef>,
): DecisionDef => ({
  prompt: 'WHAT SHOULD YOU DO?',
  choices: HOLD_CHOICES,
  correctId: 'HOLD',
  correctTitle: 'YES! KEEP THE RUNNER THERE.',
  explanation: 'There is no play. An unnecessary throw can give the runner another base.',
  wrongLesson: 'That throw gave the runner a free base! No play? HOLD IT.',
  ...d,
});
const YES_NO: ChoiceOption[] = [
  { id: 'YES', label: 'YES' },
  { id: 'NO', label: 'NO' },
];

export const SCENARIOS: Scenario[] = [
  // ───────────────────────── COVERAGE ─────────────────────────
  {
    id: 'gb-ss-empty',
    title: 'Grounder to Short',
    situation: ['BASES EMPTY', 'GROUND BALL TO SHORTSTOP'],
    category: 'COVERAGE',
    difficulty: 1,
    gameState: { runners: [], outs: 0 },
    event: 'GROUND_BALL_SS',
    phases: [
      PITCH,
      hit('Ground ball to short!'),
      REACT,
      { kind: 'THROW', to: '1B', outs: ['BATTER'], caption: 'Throw to first — OUT!' },
    ],
    teachingPoints: [
      { text: 'Ball to short — 2B covers second.', big: true },
      { text: PRINCIPLES.sideRule },
      { text: 'Throw to first — RF backs up first.' },
      { text: PRINCIPLES.oneKid },
    ],
    relevantPositions: ['SS', '2B', '1B', '3B', 'LF', 'LCF', 'RCF', 'RF', 'P', 'C'],
  },
  {
    id: 'gb-ss-r1',
    title: 'Grounder to Short, Runner on 1st',
    situation: ['RUNNER ON FIRST', 'GROUND BALL TO SHORTSTOP'],
    category: 'COVERAGE',
    difficulty: 1,
    gameState: { runners: ['FIRST'], outs: 0 },
    event: 'GROUND_BALL_SS',
    phases: [
      PITCH,
      hit('Ground ball to short!', [run('BATTER', 'FIRST'), run('R1', 'SECOND')]),
      REACT,
      // Coach: throw to the closest side. 2B is right there, so short toss for the force.
      { kind: 'THROW', to: '2B', outs: ['R1'], caption: 'Short throw to second — FORCE OUT!' },
    ],
    teachingPoints: [
      { text: 'Ball to short — 2B covers second!', big: true },
      { text: 'Runner on first? Second base may be the force.' },
      { text: PRINCIPLES.closestSide },
    ],
    relevantPositions: ['SS', '2B', '1B', '3B', 'LF', 'LCF', 'RCF', 'RF', 'P'],
  },
  {
    id: 'gb-2b-empty',
    title: 'Grounder to Second',
    situation: ['BASES EMPTY', 'GROUND BALL TO SECOND BASE'],
    category: 'COVERAGE',
    difficulty: 1,
    gameState: { runners: [], outs: 0 },
    event: 'GROUND_BALL_2B',
    phases: [
      PITCH,
      hit('Ground ball to second!'),
      REACT,
      { kind: 'THROW', to: '1B', outs: ['BATTER'], caption: 'Throw to first — OUT!' },
    ],
    teachingPoints: [
      { text: 'Ball to 2B — SS covers second.', big: true },
      { text: PRINCIPLES.sideRule },
      { text: 'RF backs up first on every throw there.' },
    ],
    relevantPositions: ['2B', 'SS', '1B', '3B', 'RF', 'RCF', 'LCF', 'LF', 'P', 'C'],
  },
  {
    id: 'gb-2b-r1',
    title: 'Grounder to Second, Runner on 1st',
    situation: ['RUNNER ON FIRST', 'GROUND BALL TO SECOND BASE'],
    category: 'COVERAGE',
    difficulty: 2,
    gameState: { runners: ['FIRST'], outs: 0 },
    event: 'GROUND_BALL_2B',
    phases: [
      PITCH,
      hit('Ground ball to second!', [run('BATTER', 'FIRST'), run('R1', 'SECOND')]),
      REACT,
      { kind: 'THROW', to: 'SS', outs: ['R1'], caption: 'Toss to the shortstop — FORCE OUT!' },
    ],
    teachingPoints: [
      { text: 'SS and 2B SHARE second base.', big: true },
      { text: 'Ball to SS → 2B covers. Ball to 2B → SS covers.', big: true },
      { text: PRINCIPLES.sideRule },
    ],
    relevantPositions: ['2B', 'SS', '1B', 'RF', 'RCF', 'LCF', 'P'],
  },
  {
    id: 'gb-3b',
    title: 'Grounder to Third',
    situation: ['BASES EMPTY', 'GROUND BALL TO THIRD BASE'],
    category: 'COVERAGE',
    difficulty: 1,
    gameState: { runners: [], outs: 0 },
    event: 'GROUND_BALL_3B',
    phases: [
      PITCH,
      hit('Ground ball to third!'),
      REACT,
      { kind: 'THROW', to: '1B', outs: ['BATTER'], caption: 'Long throw to first — sure out!' },
    ],
    teachingPoints: [
      { text: 'Get the sure out at first.', big: true },
      { text: 'Third baseman left the bag — SS protects third.' },
      { text: 'Long throw coming — RF backs up first!' },
    ],
    relevantPositions: ['3B', 'SS', '2B', '1B', 'LF', 'RF', 'P'],
  },
  {
    id: 'gb-1b-near',
    title: 'Grounder to First (near the bag)',
    situation: ['BASES EMPTY', 'GROUND BALL TO FIRST BASE'],
    category: 'COVERAGE',
    difficulty: 1,
    gameState: { runners: [], outs: 0 },
    event: 'GROUND_BALL_1B',
    phases: [
      PITCH,
      hit('Ground ball to first!'),
      REACT,
      { kind: 'CARRY', to: 'FIRST_BASE', outs: ['BATTER'], caption: 'Step on the bag — OUT!' },
    ],
    teachingPoints: [
      { text: 'Close to the bag? Step on first yourself!', big: true },
      { text: 'Pitcher still breaks toward first — just in case.' },
    ],
    relevantPositions: ['1B', 'P', 'SS', 'RF', '2B'],
  },
  {
    id: 'gb-1b-off',
    title: 'First Baseman Pulled Off the Bag',
    situation: ['BASES EMPTY', 'GROUNDER PULLS 1B OFF THE BAG'],
    category: 'COVERAGE',
    difficulty: 2,
    gameState: { runners: [], outs: 0 },
    event: 'GROUND_BALL_1B_OFF_BAG',
    phases: [
      PITCH,
      hit('Ground ball — 1B has to leave the bag!'),
      REACT,
      { kind: 'THROW', to: 'P', outs: ['BATTER'], caption: 'Toss to the pitcher — OUT!' },
    ],
    teachingPoints: [
      { text: '1B leaves the bag? PITCHER covers first!', big: true },
      { text: PRINCIPLES.coverBase },
    ],
    relevantPositions: ['P', '1B', 'RF', 'SS'],
    prompts: {
      P: "The first baseman had to leave the bag to get the ball. You're the pitcher. Where do you go?",
    },
  },

  // ───────────────────────── OUTFIELD ─────────────────────────
  {
    id: 'single-lf-r1',
    title: 'Single to Left, Runner on 1st',
    situation: ['RUNNER ON FIRST', 'BASE HIT TO LEFT FIELD'],
    category: 'OUTFIELD',
    difficulty: 2,
    gameState: { runners: ['FIRST'], outs: 0 },
    event: 'SINGLE_LF',
    phases: [
      PITCH,
      hit('Base hit to left!', [run('BATTER', 'FIRST'), run('R1', 'SECOND')]),
      REACT,
      { kind: 'THROW', to: 'SS', caption: 'Hit the cutoff!' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Ball is back in. Runners stop.' },
    ],
    teachingPoints: [
      { text: 'Get it in. Hit the cutoff!', big: true },
      { text: 'LCF backs up the left fielder.' },
      { text: 'No long hero throws!' },
    ],
    relevantPositions: ['LF', 'LCF', 'SS', '2B', '3B', 'P', 'RCF', 'RF', '1B'],
  },
  {
    id: 'single-rf-r1',
    title: 'Single to Right, Runner on 1st',
    situation: ['RUNNER ON FIRST', 'BASE HIT TO RIGHT FIELD'],
    category: 'OUTFIELD',
    difficulty: 2,
    gameState: { runners: ['FIRST'], outs: 0 },
    event: 'SINGLE_RF',
    phases: [
      PITCH,
      hit('Base hit to right!', [run('BATTER', 'FIRST'), run('R1', 'SECOND')]),
      REACT,
      { kind: 'THROW', to: '2B', caption: 'Hit the cutoff!' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Ball is back in. Runners stop.' },
    ],
    teachingPoints: [
      { text: 'Get it in. Hit the cutoff!', big: true },
      { text: 'RCF backs up the right fielder.' },
      { text: '2B is the cutoff on the right side. SS covers second.' },
    ],
    relevantPositions: ['RF', 'RCF', '2B', 'SS', '1B', '3B', 'LF', 'LCF', 'P'],
  },
  {
    id: 'single-lf-r2',
    title: 'Single to Left, Runner on 2nd',
    situation: ['RUNNER ON SECOND', 'BASE HIT TO LEFT FIELD'],
    category: 'OUTFIELD',
    difficulty: 2,
    gameState: { runners: ['SECOND'], outs: 0 },
    event: 'SINGLE_LF',
    phases: [
      PITCH,
      hit('Base hit to left!', [run('BATTER', 'FIRST'), run('R2', 'THIRD')]),
      REACT,
      { kind: 'THROW', to: 'SS', caption: 'Hit the cutoff!' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Runner stops at third. Ball is in!' },
    ],
    teachingPoints: [
      { text: 'Get it in. Hit the cutoff!', big: true },
      { text: 'Runner could go home — pitcher backs up home.' },
    ],
    relevantPositions: ['LF', 'SS', 'LCF', 'P', 'C', '3B', '2B'],
  },
  {
    id: 'single-rf-r2',
    title: 'Single to Right, Runner on 2nd',
    situation: ['RUNNER ON SECOND', 'BASE HIT TO RIGHT FIELD'],
    category: 'OUTFIELD',
    difficulty: 2,
    gameState: { runners: ['SECOND'], outs: 0 },
    event: 'SINGLE_RF',
    phases: [
      PITCH,
      hit('Base hit to right!', [run('BATTER', 'FIRST'), run('R2', 'THIRD')]),
      REACT,
      { kind: 'THROW', to: '2B', caption: 'Hit the cutoff!' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Runner stops at third. Ball is in!' },
    ],
    teachingPoints: [
      { text: 'Get it in. Hit the cutoff!', big: true },
      { text: 'Runner could go home — pitcher backs up home.' },
    ],
    relevantPositions: ['RF', '2B', 'RCF', 'SS', 'P', 'LF', 'C'],
  },
  {
    id: 'bases-loaded-fly-lf',
    title: 'Bases Loaded, Fly Ball to Left',
    situation: ['BASES LOADED', 'FLY BALL TO LEFT FIELD'],
    category: 'OUTFIELD',
    difficulty: 3,
    gameState: { runners: ['FIRST', 'SECOND', 'THIRD'], outs: 0 },
    event: 'FLY_BALL_LF',
    phases: [
      PITCH,
      hit('Fly ball to left!', [run('BATTER', 'FIRST', { partial: 0.55 })]),
      { kind: 'REACT', withPrevious: true, delay: 0.3 },
      { kind: 'OUT', outs: ['BATTER'] },
      { kind: 'FREEZE', title: 'BALL CAUGHT!', text: 'Runners can tag up.' },
      { kind: 'RUNNERS', runners: [run('R3', 'HOME')], caption: 'Lead runner goes home!' },
      { kind: 'THROW', to: 'SS', withPrevious: true, delay: 0.2, caption: 'Hit the cutoff!' },
      { kind: 'THROW', to: 'C', caption: 'Throw home — pitcher backs it up!' },
    ],
    teachingPoints: [
      { text: 'Know where the lead runner is going.', big: true },
      { text: 'Get the ball to the cutoff.' },
      { text: 'Protect home — pitcher backs up the catcher.' },
    ],
    relevantPositions: ['LF', 'LCF', 'SS', '3B', '2B', '1B', 'C', 'P', 'RCF', 'RF'],
  },
  {
    id: 'bases-loaded-fly-rf',
    title: 'Bases Loaded, Fly Ball to Right',
    situation: ['BASES LOADED', 'FLY BALL TO RIGHT FIELD'],
    category: 'OUTFIELD',
    difficulty: 3,
    gameState: { runners: ['FIRST', 'SECOND', 'THIRD'], outs: 0 },
    event: 'FLY_BALL_RF',
    phases: [
      PITCH,
      hit('Fly ball to right!', [run('BATTER', 'FIRST', { partial: 0.55 })]),
      { kind: 'REACT', withPrevious: true, delay: 0.3 },
      { kind: 'OUT', outs: ['BATTER'] },
      { kind: 'FREEZE', title: 'BALL CAUGHT!', text: 'Runners can tag up.' },
      { kind: 'RUNNERS', runners: [run('R3', 'HOME')], caption: 'Lead runner goes home!' },
      { kind: 'THROW', to: '2B', withPrevious: true, delay: 0.2, caption: 'Hit the cutoff!' },
      { kind: 'THROW', to: 'C', caption: 'Throw home — pitcher backs it up!' },
    ],
    teachingPoints: [
      { text: 'Know where the lead runner is going.', big: true },
      { text: 'Get the ball to the cutoff.' },
      { text: 'Protect home — pitcher backs up the catcher.' },
    ],
    relevantPositions: ['RF', 'RCF', '2B', 'SS', '1B', '3B', 'C', 'P', 'LCF', 'LF'],
  },

  // ───────────────────────── BACKUPS ─────────────────────────
  {
    id: 'backup-first',
    title: 'Throw to First — RF Backs Up',
    situation: ['BASES EMPTY', 'THROW TO FIRST'],
    category: 'BACKUP',
    difficulty: 1,
    gameState: { runners: [], outs: 0 },
    event: 'THROW_FIRST',
    phases: [
      PITCH,
      hit('Ground ball to short!'),
      REACT,
      { kind: 'OVERTHROW', to: '1B', stopper: 'RF', caption: 'Throw gets past first… RF is there!' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Runner has to stay at first!' },
    ],
    teachingPoints: [
      { text: PRINCIPLES.extraBases, big: true },
      { text: 'Throw to first? RF gets behind first!' },
      { text: PRINCIPLES.overthrowFirst },
    ],
    relevantPositions: ['RF', '1B', 'SS'],
    alternate: {
      label: "What if RF doesn't back up?",
      overrides: { RF: stayPut('RF stayed in the outfield…') },
      phases: [
        PITCH,
        hit('Ground ball to short!'),
        REACT,
        {
          kind: 'OVERTHROW',
          to: '1B',
          looseTo: 'LOOSE_PAST_FIRST',
          caption: 'Throw gets past first… nobody is there!',
        },
        { kind: 'RUNNERS', runners: [run('BATTER', 'SECOND')], withPrevious: true, delay: 0.6 },
        { kind: 'MOVE', moves: { RF: 'BALL' }, withPrevious: true },
      ],
      lesson: 'Nobody backed up — the runner got an extra base!',
    },
  },
  {
    id: 'backup-third',
    title: 'Throw to Third — LF Backs Up',
    situation: ['RUNNER ON SECOND', 'THROW TO THIRD'],
    category: 'BACKUP',
    difficulty: 2,
    gameState: { runners: ['SECOND'], outs: 0 },
    event: 'THROW_THIRD',
    phases: [
      PITCH,
      hit('Ground ball to short — runner goes to third!', [run('BATTER', 'FIRST'), run('R2', 'THIRD')]),
      REACT,
      { kind: 'OVERTHROW', to: '3B', stopper: 'LF', caption: 'Throw gets past third… LF is there!' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Runner has to stay at third!' },
    ],
    teachingPoints: [
      { text: PRINCIPLES.extraBases, big: true },
      { text: 'Throw to third? LF gets behind third!' },
      { text: PRINCIPLES.overthrowOther },
    ],
    relevantPositions: ['LF', '3B', 'SS'],
    prompts: {
      LF: "You're playing left field. A throw is coming to third. Where should you go?",
    },
    alternate: {
      label: "What if LF doesn't back up?",
      overrides: { LF: stayPut('LF stayed in the outfield…') },
      phases: [
        PITCH,
        hit('Ground ball to short — runner goes to third!', [run('BATTER', 'FIRST'), run('R2', 'THIRD')]),
        REACT,
        {
          kind: 'OVERTHROW',
          to: '3B',
          looseTo: 'LOOSE_PAST_THIRD',
          caption: 'Throw gets past third… nobody is there!',
        },
        { kind: 'RUNNERS', runners: [run('R2', 'HOME'), run('BATTER', 'SECOND')], withPrevious: true, delay: 0.5 },
        { kind: 'MOVE', moves: { LF: 'BALL' }, withPrevious: true },
      ],
      lesson: 'Nobody backed up — the runner scored!',
    },
  },
  {
    id: 'backup-home',
    title: 'Throw Home — Pitcher Backs Up',
    situation: ['RUNNER ON SECOND', 'THROW TO HOME'],
    category: 'BACKUP',
    difficulty: 2,
    gameState: { runners: ['SECOND'], outs: 0 },
    event: 'THROW_HOME',
    phases: [
      PITCH,
      hit('Base hit to left — runner heads home!', [run('BATTER', 'FIRST'), run('R2', 'HOME')]),
      REACT,
      { kind: 'THROW', to: 'SS', caption: 'Hit the cutoff!' },
      { kind: 'OVERTHROW', to: 'C', stopper: 'P', caption: 'Throw gets past the catcher… pitcher is there!' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Batter has to stay at first!' },
    ],
    teachingPoints: [
      { text: "The pitcher doesn't watch the play.", big: true },
      { text: 'The pitcher protects against the overthrow.', big: true },
      { text: PRINCIPLES.overthrowOther },
    ],
    relevantPositions: ['P', 'C', 'SS', 'LF'],
    alternate: {
      label: 'What if the pitcher just watches?',
      overrides: { P: stayPut('Pitcher stood on the mound and watched…') },
      phases: [
        PITCH,
        hit('Base hit to left — runner heads home!', [run('BATTER', 'FIRST'), run('R2', 'HOME')]),
        REACT,
        { kind: 'THROW', to: 'SS', caption: 'Hit the cutoff!' },
        {
          kind: 'OVERTHROW',
          to: 'C',
          looseTo: 'LOOSE_BACKSTOP',
          caption: 'Throw gets past the catcher… nobody is there!',
        },
        { kind: 'RUNNERS', runners: [run('BATTER', 'THIRD')], withPrevious: true, delay: 0.3 },
        { kind: 'MOVE', moves: { C: 'BALL' }, withPrevious: true, delay: 0.3 },
      ],
      lesson: 'Nobody backed up the catcher — the batter ran all the way to third!',
    },
  },

  // ───────────────────────── HOLD THE BALL ─────────────────────────
  {
    id: 'hold-no-play',
    title: 'No Play — Hold the Ball',
    situation: ['BASES EMPTY', 'BASE HIT TO LEFT FIELD'],
    category: 'DECISION',
    difficulty: 1,
    gameState: { runners: [], outs: 0 },
    event: 'SINGLE_LF',
    phases: [
      PITCH,
      hit('Base hit to left!'),
      REACT,
      { kind: 'THROW', to: 'SS', caption: 'Hit the cutoff!' },
      { kind: 'DECISION' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Runner stays at first. Great job!' },
    ],
    decision: holdDecision({
      position: 'SS',
      wrongPhases: [
        { kind: 'WILD_THROW', toward: 'WILD_PAST_FIRST', caption: 'Throw to first… it gets away!' },
        { kind: 'RUNNERS', runners: [run('BATTER', 'SECOND')], withPrevious: true, delay: 0.4 },
        { kind: 'MOVE', moves: { RF: 'BALL' }, withPrevious: true },
      ],
    }),
    teachingPoints: [
      { text: 'No play? HOLD THE BALL. ✋', big: true },
      { text: PRINCIPLES.dontThrow },
    ],
    relevantPositions: ['SS', 'LF', 'LCF'],
  },
  {
    id: 'hold-after-mistake',
    title: 'Bobbled Ball — Hold It',
    situation: ['BASES EMPTY', 'GROUNDER TO SHORT — BOBBLED!'],
    category: 'DECISION',
    difficulty: 2,
    gameState: { runners: [], outs: 0 },
    event: 'GROUND_BALL_SS',
    phases: [
      PITCH,
      hit('Ground ball to short!'),
      { kind: 'BOBBLE', to: 'GROUNDER_SS_BOBBLE', caption: 'Oops — bobbled it!' },
      REACT,
      { kind: 'DECISION' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Runner stays at first. Mistake over!' },
    ],
    decision: holdDecision({
      position: 'SS',
      explanation: 'The runner is already safe. A rushed throw could let him go to second.',
      wrongPhases: [
        { kind: 'WILD_THROW', toward: 'WILD_PAST_FIRST', caption: 'Late throw to first… it gets away!' },
        { kind: 'RUNNERS', runners: [run('BATTER', 'SECOND')], withPrevious: true, delay: 0.4 },
        { kind: 'MOVE', moves: { RF: 'BALL' }, withPrevious: true },
      ],
      wrongLesson: 'One mistake turned into two! After a mistake — HOLD IT.',
    }),
    teachingPoints: [
      { text: "Made a mistake? Don't make two. HOLD IT. ✋", big: true },
      { text: PRINCIPLES.dontThrow },
    ],
    relevantPositions: ['SS'],
  },
  {
    id: 'hold-cutoff',
    title: 'Cutoff Has It — Hold It',
    situation: ['RUNNER ON FIRST', 'BASE HIT TO RIGHT FIELD'],
    category: 'DECISION',
    difficulty: 2,
    gameState: { runners: ['FIRST'], outs: 0 },
    event: 'SINGLE_RF',
    phases: [
      PITCH,
      hit('Base hit to right!', [run('BATTER', 'FIRST'), run('R1', 'SECOND')]),
      REACT,
      { kind: 'THROW', to: '2B', caption: 'Hit the cutoff!' },
      { kind: 'DECISION' },
      { kind: 'WAIT', seconds: 1.5, caption: 'Runners stay put. Great job!' },
    ],
    decision: holdDecision({
      position: '2B',
      explanation: 'Both runners stopped. There is no play — hold it and keep them there.',
      // Overthrows away from 1st are a live ball in our league: everyone keeps running.
      wrongPhases: [
        { kind: 'WILD_THROW', toward: 'LOOSE_PAST_SECOND', caption: 'Throw to second… it gets away!' },
        {
          kind: 'RUNNERS',
          runners: [run('R1', 'THIRD'), run('BATTER', 'SECOND')],
          withPrevious: true,
          delay: 0.4,
        },
        { kind: 'MOVE', moves: { LCF: 'BALL' }, withPrevious: true },
      ],
      wrongLesson: 'Two runners moved up for free! No play — HOLD IT.',
    }),
    teachingPoints: [
      { text: 'Runners stopped? HOLD THE BALL. ✋', big: true },
      { text: 'Run it in to the infield — no throw needed.' },
    ],
    relevantPositions: ['2B', 'RF', 'RCF'],
  },

  // ───────────────────────── FORCE / TAG ─────────────────────────
  {
    id: 'force-second',
    title: 'Force at Second',
    situation: ['RUNNER ON FIRST', 'GROUND BALL TO SHORTSTOP'],
    category: 'FORCE_TAG',
    difficulty: 1,
    gameState: { runners: ['FIRST'], outs: 0 },
    event: 'GROUND_BALL_SS',
    phases: [
      PITCH,
      hit('Ground ball to short!', [run('BATTER', 'FIRST'), run('R1', 'SECOND')]),
      { kind: 'HIGHLIGHT', location: 'SECOND_BASE', tone: 'force', ...PLAY_TYPE_TEXT.FORCE },
      REACT,
      { kind: 'THROW', to: '2B', outs: ['R1'], caption: 'Touch the base — OUT!' },
    ],
    forceTag: { runner: 'R1', base: 'SECOND' },
    teachingPoints: [
      { text: 'Runner HAS to go? FORCE. Touch the base!', big: true },
    ],
    relevantPositions: ['2B', 'SS'],
  },
  {
    id: 'tag-third',
    title: 'Tag Play at Third',
    situation: ['RUNNER ON SECOND ONLY', 'GROUND BALL TO SHORTSTOP'],
    category: 'FORCE_TAG',
    difficulty: 2,
    gameState: { runners: ['SECOND'], outs: 0 },
    event: 'GROUND_BALL_SS',
    phases: [
      PITCH,
      hit('Ground ball — runner goes for third!', [run('BATTER', 'FIRST'), run('R2', 'THIRD')]),
      { kind: 'HIGHLIGHT', location: 'THIRD_BASE', tone: 'tag', ...PLAY_TYPE_TEXT.TAG },
      REACT,
      { kind: 'THROW', to: '3B', outs: ['R2'], caption: 'Tag him — OUT!' },
    ],
    forceTag: { runner: 'R2', base: 'THIRD' },
    teachingPoints: [
      { text: "Runner doesn't HAVE to go? TAG him!", big: true },
      { text: 'Nobody on first = the runner on second is not forced.' },
    ],
    relevantPositions: ['3B', 'SS'],
  },
  {
    id: 'force-first',
    title: 'Force at First',
    situation: ['BASES EMPTY', 'GROUND BALL TO THIRD BASE'],
    category: 'FORCE_TAG',
    difficulty: 1,
    gameState: { runners: [], outs: 0 },
    event: 'GROUND_BALL_3B',
    phases: [
      PITCH,
      hit('Ground ball to third!'),
      {
        kind: 'HIGHLIGHT',
        location: 'FIRST_BASE',
        tone: 'force',
        title: 'FORCE PLAY',
        text: 'The batter ALWAYS has to run to first. Just touch the base!',
      },
      REACT,
      { kind: 'THROW', to: '1B', outs: ['BATTER'], caption: 'Foot on the bag — OUT!' },
    ],
    forceTag: { runner: 'BATTER', base: 'FIRST' },
    teachingPoints: [{ text: 'The batter is ALWAYS forced to first.', big: true }],
    relevantPositions: ['1B', '3B'],
  },
  {
    id: 'force-third',
    title: 'Force at Third',
    situation: ['RUNNERS ON FIRST & SECOND', 'GROUND BALL TO SHORTSTOP'],
    category: 'FORCE_TAG',
    difficulty: 3,
    gameState: { runners: ['FIRST', 'SECOND'], outs: 0 },
    event: 'GROUND_BALL_SS',
    phases: [
      PITCH,
      hit('Ground ball to short!', [run('BATTER', 'FIRST'), run('R1', 'SECOND'), run('R2', 'THIRD')]),
      {
        kind: 'HIGHLIGHT',
        location: 'THIRD_BASE',
        tone: 'force',
        title: 'FORCE PLAY',
        text: 'Runners on first AND second — the runner from second HAS to go. Touch third!',
      },
      REACT,
      { kind: 'THROW', to: '3B', outs: ['R2'], caption: 'Touch third — FORCE OUT!' },
    ],
    forceTag: { runner: 'R2', base: 'THIRD' },
    teachingPoints: [
      { text: 'Every base behind the runner is full? FORCE!', big: true },
    ],
    relevantPositions: ['3B', 'SS'],
  },

  // ───────────────────────── DON'T CHASE ─────────────────────────
  {
    id: 'no-chase-ss',
    title: "Don't Chase — Ball to Short",
    situation: ['BASES EMPTY', 'GROUND BALL TO SHORTSTOP'],
    category: 'COVERAGE',
    difficulty: 1,
    gameState: { runners: [], outs: 0 },
    event: 'GROUND_BALL_SS',
    phases: [
      PITCH,
      hit('Ground ball to short!'),
      { kind: 'FREEZE', title: 'THE BALL ONLY NEEDS ONE KID.', text: 'The play needs EVERYBODY.' },
      REACT,
      { kind: 'THROW', to: '1B', outs: ['BATTER'], caption: 'Everybody did their job — OUT!' },
    ],
    choiceQuestions: [
      {
        id: 'chase-2b',
        position: '2B',
        prompt: 'The shortstop is getting the ball. Should {name} run toward the shortstop?',
        choices: YES_NO,
        correctId: 'NO',
        correctTitle: 'RIGHT! COVER SECOND!',
        explanation: 'Shortstop has the ball. You cover second!',
        concept: 'DONT_CHASE',
      },
    ],
    teachingPoints: [
      { text: PRINCIPLES.oneKid, big: true },
      { text: 'Everybody running to the ball leaves the bases empty.' },
    ],
    relevantPositions: ['2B', 'P', '3B', '1B'],
    alternate: {
      label: 'What if everybody chases the ball?',
      overrides: { '2B': chase(), '3B': chase(), P: chase(), '1B': chase() },
      phases: [
        PITCH,
        hit('Ground ball to short!'),
        { kind: 'REACT', caption: 'Uh oh… everybody runs to the ball!' },
        { kind: 'WAIT', seconds: 1, caption: 'Nobody is covering first!' },
        { kind: 'RUNNERS', runners: [run('BATTER', 'SECOND')] },
      ],
      lesson: 'Everyone ran to the ball. Nobody covered a base!',
    },
  },
  {
    id: 'no-chase-lf',
    title: "Don't Chase — Ball to Left",
    situation: ['BASES EMPTY', 'BASE HIT TO LEFT FIELD'],
    category: 'OUTFIELD',
    difficulty: 1,
    gameState: { runners: [], outs: 0 },
    event: 'SINGLE_LF',
    phases: [
      PITCH,
      hit('Base hit to left!'),
      { kind: 'FREEZE', title: 'THE BALL ONLY NEEDS ONE KID.', text: 'The play needs EVERYBODY.' },
      REACT,
      { kind: 'THROW', to: 'SS', caption: 'Hit the cutoff!' },
      { kind: 'WAIT', seconds: 1.2, caption: 'Everybody did their job!' },
    ],
    choiceQuestions: [
      {
        id: 'chase-rcf',
        position: 'RCF',
        prompt: 'The ball is in left field. Should {name} run all the way across the field to chase it?',
        choices: YES_NO,
        correctId: 'NO',
        correctTitle: 'RIGHT! GO TO YOUR BACKUP SPOT!',
        explanation: 'Left fielder has the ball. Move toward your backup job instead.',
        concept: 'DONT_CHASE',
      },
    ],
    teachingPoints: [
      { text: PRINCIPLES.oneKid, big: true },
      { text: 'Ball in left? Right side moves to backup spots — no chasing!' },
    ],
    relevantPositions: ['RCF', 'RF', 'LCF', 'SS'],
    alternate: {
      label: 'What if everybody chases the ball?',
      overrides: { RCF: chase(), RF: chase(), SS: chase(), '2B': chase() },
      phases: [
        PITCH,
        hit('Base hit to left!'),
        { kind: 'REACT', caption: 'Uh oh… everybody runs to the ball!' },
        { kind: 'WAIT', seconds: 1, caption: 'No cutoff and nobody at second!' },
        { kind: 'RUNNERS', runners: [run('BATTER', 'SECOND')] },
      ],
      lesson: 'Everyone chased the ball. The runner got a free base!',
    },
  },
];

export const scenarioById = (id: string): Scenario => {
  const s = SCENARIOS.find((sc) => sc.id === id);
  if (!s) throw new Error(`Unknown scenario: ${id}`);
  return s;
};
