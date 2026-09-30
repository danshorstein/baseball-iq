import type { ChoiceQuestion } from './questions';
import { ruleNotes, type TrainingSettings } from './settings';

/** Knowledge checks for the coach-selected rule profile, separate from tactics. */
export function buildRuleQuestions(s: TrainingSettings): ChoiceQuestion[] {
  const notes = ruleNotes(s);
  const binary = (id: string, prompt: string, yes: boolean, explanation: string, situation: [string, string] = ['YOUR LEAGUE SETTINGS', 'RULES CHECK']): ChoiceQuestion => ({
    kind: 'CHOICE', id: `rules:${id}`, scenarioId: 'gb-ss-r1', situation,
    prompt, choices: [{ id: 'YES', label: 'YES' }, { id: 'NO', label: 'NO' }],
    correctId: yes ? 'YES' : 'NO', correctTitle: 'THAT’S RIGHT!', explanation,
    concept: 'LEAGUE_RULES', pauseAt: 'START', hint: 'Use the rules selected in Setup.', beforePitch: true,
  });
  return [
    binary('lead', 'CAN THE RUNNER LEAD OFF BEFORE THE PITCH?', s.leadingOff, notes[0]),
    {
      kind: 'CHOICE', id: 'rules:steal', scenarioId: 'gb-ss-r1', situation: ['RUNNER ON FIRST', 'WHEN MAY THE RUNNER STEAL?'],
      prompt: 'WHEN CAN THE RUNNER START STEALING?',
      choices: [{ id: 'none', label: 'STEALING IS NOT ALLOWED' }, { id: 'plate', label: 'AFTER THE PITCH REACHES HOME' }, { id: 'release', label: 'WHEN THE PITCHER RELEASES IT' }],
      correctId: s.stealing, correctTitle: 'THAT’S THE RELEASE POINT!', explanation: notes[1],
      concept: 'LEAGUE_RULES', pauseAt: 'START', hint: 'Check the stealing setting for your league.', beforePitch: true,
    },
    binary('overthrow', 'DOES A LIVE OVERTHROW AT FIRST HAVE A ONE-EXTRA-BASE LIMIT?', s.overthrowFirst === 'one-extra', notes[2]),
    binary('time', 'DOES HOLDING THE BALL AUTOMATICALLY MAKE IT DEAD?', false, notes[3]),
    binary('third-strike', 'FIRST IS EMPTY, ONE OUT. CAN THE BATTER RUN ON AN UNCAUGHT THIRD STRIKE?', s.droppedThirdStrike, notes[4], ['FIRST BASE EMPTY • ONE OUT', 'UNCAUGHT THIRD STRIKE']),
    binary('infield-fly', 'FIRST AND SECOND OCCUPIED, ONE OUT. CAN THE UMPIRE CALL INFIELD FLY ON AN EASY FAIR POP-UP?', s.infieldFly, notes[5], ['FIRST & SECOND • ONE OUT', 'FAIR POP-UP • ORDINARY EFFORT']),
  ];
}
