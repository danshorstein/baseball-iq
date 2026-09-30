import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ageDefaults, activePositions, validateSettings, startingPositions, ruleNotes, type AgeGroup } from '../src/baseball/settings';
import { configureScenario } from '../src/baseball/configureScenario';
import { SCENARIOS } from '../src/data/scenarios';
import { LESSONS } from '../src/data/lessons';
import { buildScenario, sampleTimeline } from '../src/animation/animationEngine';
import { destinationQuestion, lessonQuestions, prePitchQuestion } from '../src/baseball/questions';
import { buildPositionSession } from '../src/baseball/practice';
import { buildRuleQuestions } from '../src/baseball/ruleQuestions';
import { isForced } from '../src/baseball/teachingRules';
import { persistSettings, loadSettings, SETTINGS_KEY } from '../src/storage/settingsRepository';
import { TEAM_PALETTES, DEFAULT_TEAM_COLORS, validateTeamColors, themeVariables, contrastRatio } from '../src/theme/teamColors';

test('team colors validate old exports and keep text readable for presets and extreme custom colors', () => {
  assert.deepEqual(validateSettings({ ageGroup: '10U' }).teamColors, DEFAULT_TEAM_COLORS);
  assert.deepEqual(validateTeamColors({ primary: '#ABCDEF', accent: 'url(https://example.com)' }), { primary: '#abcdef', accent: DEFAULT_TEAM_COLORS.accent });
  assert.deepEqual(validateSettings({ teamColors: { primary: '#123456', accent: '#ffffff' } }).teamColors, { primary: '#123456', accent: '#ffffff' });
  assert.equal(new Set(TEAM_PALETTES.map((p) => p.id)).size, TEAM_PALETTES.length);
  const shades = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#777777'];
  for (const colors of [...TEAM_PALETTES, ...shades.flatMap((primary) => shades.map((accent) => ({ primary, accent })))]) {
    const vars = themeVariables(colors);
    assert.equal(vars['--primary'], colors.primary);
    assert.equal(vars['--accent'], colors.accent);
    for (const key of ['primary', 'accent'] as const) {
      assert.ok(contrastRatio(vars[`--${key}`], vars[`--${key}-contrast`]) >= 4.5);
      for (const surface of ['#ffffff', '#f6f4ee']) assert.ok(contrastRatio(vars[`--${key}-ink`], surface) >= 4.5);
    }
    assert.ok(contrastRatio(vars['--primary-ink'], vars['--primary-soft']) >= 4.5);
    assert.ok(contrastRatio(vars['--primary-hover'], vars['--primary-hover-contrast']) >= 4.5);
  }
});

test('untrusted saved settings are validated and impossible release combinations normalized', () => {
  assert.deepEqual(validateSettings(null), ageDefaults('10U'));
  const s = validateSettings({ ageGroup: '8U', fielders: 11, competition: 'pro', basePath: -1, leadingOff: true, stealing: 'plate', teamName: '  Sharks  ', droppedThirdStrike: 'yes', batter: '<script>' });
  assert.equal(s.fielders, 10); assert.equal(s.basePath, 60); assert.equal(s.competition, 'rec');
  assert.equal(s.teamName, '  Sharks  '); assert.equal(s.stealing, 'release'); assert.equal(s.droppedThirdStrike, false); assert.equal(s.batter, 'balanced');
});

test('nine and ten players activate the correct center-field positions', () => {
  assert.deepEqual(activePositions(ageDefaults('10U')), ['C','P','1B','2B','SS','3B','LF','CF','RF']);
  assert.deepEqual(activePositions(ageDefaults('8U')), ['C','P','1B','2B','SS','3B','LF','LCF','RCF','RF']);
});

test('all scenarios, demos, questions and positions work across ages and contact profiles', () => {
  const snapshot = JSON.stringify(SCENARIOS);
  for (const ageGroup of ['8U','10U','12U','14U'] as AgeGroup[]) {
    for (const fielders of [9,10] as const) for (const batter of ['balanced','power','developing'] as const) {
      const settings = { ...ageDefaults(ageGroup), fielders, batter };
      const scenarios = SCENARIOS.map((s) => configureScenario(s, settings));
      const active = activePositions(settings);
      for (const s of scenarios) {
        for (const pos of s.relevantPositions) assert.ok(active.includes(pos), `${s.id}: inactive relevant position ${pos}`);
        for (const variant of ['main', ...(s.alternate ? ['alternate'] : []), ...(s.decision ? ['wrong'] : [])] as ('main'|'alternate'|'wrong')[]) {
          const { timeline, resolved } = buildScenario(s, variant);
          assert.equal(timeline.positions.length, fielders);
          assert.ok(Number.isFinite(timeline.duration) && timeline.duration > 0);
          if (resolved.primaryFielder) assert.ok(active.includes(resolved.primaryFielder));
          if (variant === 'main' && resolved.primaryFielder) assert.equal(active.filter((p) => resolved.assignments[p].action === 'FIELD_BALL').length, 1, `${s.id}: exactly one fielder`);
          for (const [entity, track] of Object.entries({ ball: timeline.ball, ...timeline.players, ...timeline.runners })) {
            track.keys.forEach((k, i) => {
              assert.ok([k.t,k.x,k.y].every(Number.isFinite), `${s.id}/${entity}: finite keyframes`);
              if (i) assert.ok(k.t >= track.keys[i-1].t, `${s.id}/${entity}: ordered keyframes`);
            });
          }
          const frame = sampleTimeline(timeline, timeline.duration);
          assert.equal(frame.phase, 'DONE');
          for (const trail of frame.trails) assert.ok(active.includes(trail.position), `${s.id}: inactive trail`);
        }
        const questions = [...lessonQuestions(s), prePitchQuestion(s), ...s.relevantPositions.map((p) => destinationQuestion(s,p))].filter((q) => q !== null);
        for (const q of questions) {
          if (q.position) assert.ok(active.includes(q.position), `${q.id}: active question position`);
          const choices = q.kind === 'CHOICE' ? q.choices : q.targets;
          assert.equal(choices.filter((c) => c.id === q.correctId).length, 1, `${q.id}: one answer`);
        }
      }
      for (const p of active) for (const mode of ['practice','pitch'] as const) {
        const qs = buildPositionSession(p, scenarios, mode, 1234);
        assert.ok(qs.length > 0 && qs.length <= 8, `${p}/${mode}: playable session`);
        assert.equal(new Set(qs.map((q) => q.id)).size, qs.length);
        assert.ok(qs.every((q) => !q.position || q.position === p));
        assert.deepEqual(qs, buildPositionSession(p, scenarios, mode, 1234));
      }
    }
  }
  assert.equal(JSON.stringify(SCENARIOS), snapshot, 'source scenarios remain unchanged');
  for (const lesson of LESSONS) for (const id of lesson.scenarioIds) assert.ok(SCENARIOS.some((s) => s.id === id));
});

test('contact strength changes starting depth without changing the rules', () => {
  const s = ageDefaults('10U');
  assert.ok(startingPositions({ ...s,batter:'power' }).CF.y < startingPositions(s).CF.y);
  assert.ok(startingPositions({ ...s,batter:'developing' }).CF.y > startingPositions(s).CF.y);
  assert.deepEqual(ruleNotes(s),ruleNotes({ ...s,batter:'power' }));
});

test('overthrow profile changes explanation and example advancement', () => {
  const source = SCENARIOS.find((s) => s.id === 'backup-first')!;
  const limited = configureScenario(source, ageDefaults('8U'));
  const live = configureScenario(source, ageDefaults('10U'));
  assert.ok(limited.teachingPoints.some((p) => p.text.includes('one extra base')));
  assert.ok(live.teachingPoints.some((p) => p.text.includes('out of play')));
  assert.equal(limited.alternate!.phases.find((p) => p.kind === 'RUNNERS')!.runners![0].to,'SECOND');
  assert.equal(live.alternate!.phases.find((p) => p.kind === 'RUNNERS')!.runners![0].to,'THIRD');
});

test('a runner on third does not create a universal hold instruction', () => {
  const s = configureScenario(SCENARIOS.find((s) => s.id === 'r3-gb-3b')!,ageDefaults('10U'));
  assert.match(s.decision!.explanation,/already reached first/);
  assert.match(s.decision!.wrongLesson,/taking the out at first/);
});

test('force chains disappear when the batter or a trailing runner is retired', () => {
  assert.equal(isForced('R2',['FIRST','SECOND']),true);
  assert.equal(isForced('R2',['SECOND']),false);
  assert.equal(isForced('R2',['FIRST','SECOND'],['R1']),false);
  assert.equal(isForced('R1',['FIRST'],['BATTER']),false);
  assert.equal(isForced('R3',['FIRST','SECOND','THIRD'],['R2']),false);
});

test('rule quiz answers follow individual overrides rather than competition label', () => {
  const s = ageDefaults('10U');
  assert.deepEqual(buildRuleQuestions(s),buildRuleQuestions({ ...s,competition:'travel' }));
  const changed = buildRuleQuestions({ ...s,leadingOff:true,droppedThirdStrike:true,infieldFly:false,overthrowFirst:'one-extra',stealing:'release' });
  for (const [id,answer] of [['lead','YES'],['third-strike','YES'],['infield-fly','NO'],['overthrow','YES'],['steal','release'],['time','NO']]) assert.equal(changed.find((q) => q.id === `rules:${id}`)!.correctId,answer);
});

test('storage recovers from corrupt data and reports blocked writes', () => {
  const values = new Map<string,string>();
  const original = Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  try {
    Object.defineProperty(globalThis,'localStorage',{ configurable:true,value:{ getItem:(k:string) => values.get(k) ?? null,setItem:(k:string,v:string) => values.set(k,v) } });
    values.set(SETTINGS_KEY,'broken json'); assert.deepEqual(loadSettings(),ageDefaults('10U'));
    assert.equal(persistSettings(ageDefaults('8U')),true); assert.equal(loadSettings().ageGroup,'8U');
    Object.defineProperty(globalThis,'localStorage',{ configurable:true,value:{ getItem:() => { throw new Error('blocked'); },setItem:() => { throw new Error('blocked'); } } });
    assert.deepEqual(loadSettings(),ageDefaults('10U')); assert.equal(persistSettings(ageDefaults('8U')),false);
  } finally {
    if (original) Object.defineProperty(globalThis,'localStorage',original); else Reflect.deleteProperty(globalThis,'localStorage');
  }
});
