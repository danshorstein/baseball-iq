import type { Scenario, ScenarioPhase } from './scenarioTypes';
import { resolveScenario } from './scenarioResolver';
import { PRINCIPLES } from './teachingRules';
import { ruleNotes, type TrainingSettings } from './settings';
import type { DefensivePosition } from './types';

/** Adapt the authored demos without mutating their source or changing quiz IDs. */
export function configureScenario(source: Scenario, settings: TrainingSettings): Scenario {
  const s = structuredClone(source);
  s.configuration = settings;
  const map = (p: DefensivePosition): DefensivePosition =>
    settings.fielders === 9 && (p === 'LCF' || p === 'RCF') ? 'CF' : p;
  const text = (t: string) => settings.fielders === 9 ? t.replace(/\b(?:left center|right center|LCF|RCF)\b/gi, 'CF') : t;
  const mapOverrides = (overrides: Scenario['overrides']) => overrides && Object.fromEntries(
    Object.entries(overrides).map(([p, a]) => [map(p as DefensivePosition), { ...a, explanation: text(a.explanation) }]),
  );
  const phases = (list: ScenarioPhase[]) => list.map((phase) => {
    if (phase.caption) phase.caption = text(phase.caption);
    if (phase.kind === 'THROW' || phase.kind === 'OVERTHROW') phase.to = map(phase.to);
    if (phase.kind === 'OVERTHROW' && phase.stopper) phase.stopper = map(phase.stopper);
    if (phase.kind === 'MOVE') phase.moves = Object.fromEntries(Object.entries(phase.moves).map(([p, to]) => [map(p as DefensivePosition), to]));
    return phase;
  });
  s.phases = phases(s.phases);
  s.overrides = mapOverrides(s.overrides);
  s.relevantPositions = [...new Set(s.relevantPositions.map(map))];
  if (s.gameState.ballHolder) s.gameState.ballHolder = map(s.gameState.ballHolder);
  if (s.prompts) s.prompts = Object.fromEntries(Object.entries(s.prompts).map(([p, t]) => [map(p as DefensivePosition), text(t)]));
  if (s.choiceQuestions) s.choiceQuestions = s.choiceQuestions.map((q) => ({ ...q, position: q.position ? map(q.position) : undefined, prompt: text(q.prompt), explanation: text(q.explanation) }));
  if (s.decision) {
    s.decision.position = map(s.decision.position);
    s.decision.wrongPhases = phases(s.decision.wrongPhases);
  }
  if (s.alternate) {
    s.alternate.phases = phases(s.alternate.phases);
    s.alternate.overrides = mapOverrides(s.alternate.overrides);
  }
  const notes = ruleNotes(settings);
  s.teachingPoints = s.teachingPoints.map((point) => ({ ...point, text:
    point.text === PRINCIPLES.overthrowFirst ? notes[2] :
    point.text === PRINCIPLES.overthrowOther ? notes[3] : text(point.text),
  }));
  if (s.category === 'DECISION') s.teachingPoints.push({ text: notes[3] });
  if (s.id === 'backup-first' && settings.overthrowFirst === 'live' && s.alternate) {
    for (const p of s.alternate.phases) if (p.kind === 'RUNNERS') p.runners = [{ runner: 'BATTER', to: 'THIRD' }];
    s.alternate.lesson = 'The ball stayed in play. Without a backup, the runner was able to take more bases in this example. There is no automatic one-base limit.';
  }
  if (s.id === 'r3-gb-3b') {
    s.title = 'Slow Grounder to Third — Batter Already Safe';
    s.situation = ['RUNNER ON THIRD', 'SLOW GROUNDER • NO SURE OUT AT FIRST'];
    s.overrides = { ...s.overrides, '3B': { action: 'FIELD_BALL', explanation: 'In this slow-play example the batter is already safe at first. Look the runner back; avoid an unnecessary throw.' } };
    if (s.decision) {
      s.decision.explanation = 'The batter has already reached first by this decision. There is no out there. Hold the ball and watch the runner; this does not make a live ball dead.';
      s.decision.wrongLesson = 'The late throw got no out and let the runner score. On a quickly fielded grounder, looking the runner back and taking the out at first may be the better play.';
    }
    s.teachingPoints = [{ text: 'No realistic out? Hold the ball and watch the runner.', big: true }, { text: 'A runner on third is not a reason to give up every out at first. Read the runner, outs, and time available.' }, { text: notes[3] }];
  }
  // Who calls a gap ball can change when the outfield depth changes.
  if (s.event === 'GAP_LEFT' || s.event === 'GAP_RIGHT') {
    const resolved = resolveScenario({ event: s.event, ...s.gameState, overrides: s.overrides, configuration: settings });
    const winner = resolved.primaryFielder!;
    const other = s.event === 'GAP_LEFT' ? (winner === 'LF' ? map('LCF') : 'LF') : (winner === 'RF' ? map('RCF') : 'RF');
    s.choiceQuestions = [{ id: 'call-gap', position: winner, prompt: 'YOU ARE CLOSEST. WHAT SHOULD YOU DO?', choices: [{ id: 'CALL', label: 'CALL IT AND GET THE BALL' }, { id: 'WAIT', label: 'WAIT FOR SOMEONE ELSE' }, { id: 'WATCH', label: 'STAND AND WATCH' }], correctId: 'CALL', correctTitle: 'CALL IT!', explanation: 'Communicate clearly. The other outfielder backs you up.', concept: 'CALL_IT' }];
    s.prompts = { [winner]: 'WHERE SHOULD {NAME} GO?', [other]: 'YOUR TEAMMATE CALLED IT. WHERE DO YOU GO?' };
    s.teachingPoints = [{ text: `${winner} is closest in this example: call it! ${other} backs up.`, big: true }, { text: 'Use your coach’s fly-ball priority system if more than one player can reach it.' }];
  }
  return s;
}
