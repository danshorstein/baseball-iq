import { useMemo, useState } from 'react';
import { buildRuleQuestions } from '../baseball/ruleQuestions';
import { TopBar } from '../components/Layout/TopBar';
import { QuizRunner } from '../components/QuizRunner/QuizRunner';
import { ScorePanel, type QuestionResult } from '../components/ScorePanel/ScorePanel';
import { useApp } from '../state/AppContext';
import { go } from '../router';

export function Rules() {
  const { settings, names } = useApp();
  const [results, setResults] = useState<QuestionResult[] | null>(null);
  const items = useMemo(() => buildRuleQuestions(settings).map((question) => ({ question, names })), [settings, names]);
  return <div className="page">
    <TopBar back="/" title="Practice Your Rules" />
    <p className="setup-note">These answers use your selected settings. Confirm them with your league or tournament rulebook.</p>
    {results ? <ScorePanel results={results} title="RULES CHECK COMPLETE!">
      <button className="btn btn-primary" onClick={() => setResults(null)}>Try again</button>
      <button className="btn btn-ghost" onClick={() => go('/coach')}>Review setup</button>
    </ScorePanel> : <QuizRunner items={items} onFinish={setResults} />}
  </div>;
}
