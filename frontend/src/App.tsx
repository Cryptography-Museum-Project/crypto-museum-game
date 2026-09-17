import { useEffect, useState } from 'react';
import LandingScreen from './screens/LandingScreen';
import ScenarioScreen from './screens/ScenarioScreen';
import AnswerScreen from './screens/AnswerScreen';
import ResultScreen from './screens/ResultScreen';
import MemoScreen from './screens/MemoScreen';
import PhoneScreen from './components/PhoneScreen';
import { fetchScenarios, startSession, submitAnswer, finishSession } from './api/game';
import type { PlayableScenario, FinishResponse } from './api/game';

type Stage = 'landing' | 'scenario' | 'answer' | 'finishing' | 'result' | 'memo';
type LoadState = 'loading' | 'ready' | 'error';

// Показывается только если POST /finish не смог ответить (нет сети,
// backend прилёг именно в этот момент) — обычный посетитель этого
// никогда не увидит. Без него игра осталась бы на экране "завершаем…"
// навсегда. Уровень и проценты в этом случае — только приблизительные
// (посчитаны из уже отправленных на backend баллов на клиенте), а не
// то, что реально сохранилось на сервере.
const FALLBACK_TIER: FinishResponse['tier'] = {
  key: 'unknown',
  level: 'участник',
  title: '',
  body: 'Спасибо, что прошли игру! Не удалось связаться с сервером, чтобы показать полный разбор результата — но чек-лист по цифровой безопасности всё равно доступен ниже.',
  cta: 'Хотите разобраться подробнее? Ждём вас на выставке «Ключ к доверию» в Музее криптографии.',
};

function App() {
  // Сценарии и id игровой сессии приходят с backend при загрузке страницы.
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [scenarios, setScenarios] = useState<PlayableScenario[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>('landing');
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [lastOptionId, setLastOptionId] = useState<string | null>(null);
  const [finishResult, setFinishResult] = useState<FinishResponse | null>(null);

  const loadGame = () => {
    setLoadState('loading');
    // Сессию и список сценариев запрашиваем параллельно — они не зависят
    // друг от друга.
    Promise.all([fetchScenarios(), startSession()])
      .then(([loadedScenarios, newSessionId]) => {
        setScenarios(loadedScenarios);
        setSessionId(newSessionId);
        setLoadState('ready');
      })
      .catch((error) => {
        console.error('Не удалось загрузить игру с backend:', error);
        setLoadState('error');
      });
  };

  useEffect(loadGame, []);

  const resetToLanding = () => {
    setStage('landing');
    setIndex(0);
    setScores([]);
    setLastOptionId(null);
    setFinishResult(null);
    // Каждое прохождение — это новая сессия на backend, поэтому при
    // возврате на старт начинаем сессию заново.
    loadGame();
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

  const buildFallbackResult = (finalScores: number[]): FinishResponse => {
    const approximateScore = finalScores.reduce((sum, points) => sum + points, 0);
    return {
      id: sessionId ?? '',
      totalScore: approximateScore,
      maxScore: 100,
      tier: FALLBACK_TIER,
    };
  };

  const handleContinue = async () => {
    const scenario = scenarios[index];
    const chosen = scenario.options.find((option) => option.id === lastOptionId);
    const nextScores = [...scores, chosen?.points ?? 0];
    setScores(nextScores);

    // Отправляем ответ на backend в фоне: если он по какой-то причине не
    // ответит (нет сети, сервер прилёг) — игра всё равно должна работать,
    // поэтому не ждём ответа и не блокируем интерфейс.
    if (sessionId && chosen) {
      submitAnswer(sessionId, scenario.id, chosen.dbOptionId).catch((error) => {
        console.error('Не удалось сохранить ответ на backend:', error);
      });
    }

    if (index + 1 < scenarios.length) {
      setIndex(index + 1);
      setStage('scenario');
      return;
    }

    // Последний сценарий пройден — а вот здесь, в отличие от ответа на
    // сценарий, ответ backend нам действительно нужен: только там
    // считается настоящий итоговый балл и лежит текст уровня, который
    // куратор может редактировать в админке ("Профили"). Показывать
    // результат, не дожидаясь этого ответа, значит показывать текст,
    // зашитый в сборку фронтенда, а не тот, что реально сохранён на
    // сервере — поэтому здесь мы ждём, пусть игра на секунду и покажет
    // экран "подводим итоги" вместо мгновенного перехода.
    setStage('finishing');
    if (!sessionId) {
      setFinishResult(buildFallbackResult(nextScores));
      setStage('result');
      return;
    }
    try {
      const result = await finishSession(sessionId);
      setFinishResult(result);
    } catch (error) {
      console.error('Не удалось завершить сессию на backend:', error);
      setFinishResult(buildFallbackResult(nextScores));
    }
    setStage('result');
  };

  if (loadState === 'loading') {
    return (
      <PhoneScreen>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-ink text-[14px]">Загрузка игры…</p>
        </div>
      </PhoneScreen>
    );
  }

  if (loadState === 'error') {
    return (
      <PhoneScreen>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-ink text-[14px]">
            Не удалось связаться с сервером. Проверьте подключение к интернету и попробуйте ещё
            раз.
          </p>
          <button
            type="button"
            onClick={loadGame}
            className="rounded-[5px] bg-brand text-white text-[14px] font-bold px-6 py-3"
          >
            Повторить
          </button>
        </div>
      </PhoneScreen>
    );
  }

  if (stage === 'landing') {
    return <LandingScreen onStart={handleStart} />;
  }

  if (stage === 'scenario') {
    return (
      <ScenarioScreen
        scenario={scenarios[index]}
        total={scenarios.length}
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
        total={scenarios.length}
        points={chosen?.points ?? 0}
        explanation={chosen?.explanation ?? ''}
        correctOptionId={best?.id ?? ''}
        correctLabel={best?.label ?? ''}
        onHome={resetToLanding}
        onContinue={handleContinue}
      />
    );
  }

  if (stage === 'finishing') {
    return (
      <PhoneScreen>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-ink text-[14px]">Подводим итоги…</p>
        </div>
      </PhoneScreen>
    );
  }

  if (stage === 'memo') {
    return <MemoScreen onHome={resetToLanding} onBack={() => setStage('result')} />;
  }

  // finishResult к этому моменту почти всегда уже установлен (см.
  // handleContinue — стадия 'result' выставляется только после того, как
  // setFinishResult отработал, в том числе в ветке с ошибкой). Проверка
  // ниже — просто подстраховка для TypeScript и на случай непредвиденного
  // порядка обновлений состояния, не рабочий сценарий сам по себе.
  const result = finishResult ?? buildFallbackResult(scores);
  return (
    <ResultScreen
      score={result.totalScore}
      tier={result.tier}
      onHome={resetToLanding}
      onReplay={resetToLanding}
      onOpenMemo={() => setStage('memo')}
    />
  );
}

export default App;
