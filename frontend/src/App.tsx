import { useState } from 'react';
import LandingScreen from './screens/LandingScreen';
import ScenarioScreen from './screens/ScenarioScreen';
import AnswerScreen from './screens/AnswerScreen';
import ResultScreen from './screens/ResultScreen';
import MemoScreen from './screens/MemoScreen';
import { scenarios, TOTAL_SCENARIOS } from './data/scenarios';

type Stage = 'landing' | 'scenario' | 'answer' | 'result' | 'memo';

function App() {
  const [stage, setStage] = useState<Stage>('landing');
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [lastOptionId, setLastOptionId] = useState<string | null>(null);

  const resetToLanding = () => {
    setStage('landing');
    setIndex(0);
    setScores([]);
    setLastOptionId(null);
  };

  const handleStart = () => {
    setIndex(0);
    setScores([]);
    setStage('scenario');
  };

  const handleSelectOption = (optionId: string) => {
    setLastOptionId(optionId);
    setStage('answer');
  };

  const handleContinue = () => {
    const scenario = scenarios[index];
    const chosen = scenario.options.find((option) => option.id === lastOptionId);
    const nextScores = [...scores, chosen?.points ?? 0];
    setScores(nextScores);

    if (index + 1 < scenarios.length) {
      setIndex(index + 1);
      setStage('scenario');
    } else {
      setStage('result');
    }
  };

  if (stage === 'landing') {
    return <LandingScreen onStart={handleStart} />;
  }

  if (stage === 'scenario') {
    return (
      <ScenarioScreen
        scenario={scenarios[index]}
        onSelectOption={handleSelectOption}
        onHome={resetToLanding}
      />
    );
  }

  if (stage === 'answer') {
    const scenario = scenarios[index];
    const chosen = scenario.options.find((option) => option.id === lastOptionId);
    const best = scenario.options.find((option) => option.points === 10);

    return (
      <AnswerScreen
        current={index + 1}
        total={TOTAL_SCENARIOS}
        points={chosen?.points ?? 0}
        explanation={chosen?.explanation ?? ''}
        correctOptionId={best?.id ?? ''}
        correctLabel={best?.label ?? ''}
        onHome={resetToLanding}
        onContinue={handleContinue}
      />
    );
  }

  if (stage === 'memo') {
    return <MemoScreen onHome={resetToLanding} onBack={() => setStage('result')} />;
  }

  const total = scores.reduce((sum, points) => sum + points, 0);
  return (
    <ResultScreen
      score={total}
      total={TOTAL_SCENARIOS}
      onHome={resetToLanding}
      onReplay={resetToLanding}
      onOpenMemo={() => setStage('memo')}
    />
  );
}

export default App;
