import { useEffect, useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import OverviewScreen from './screens/OverviewScreen';
import AnswerStatsScreen from './screens/AnswerStatsScreen';
import ScenariosListScreen from './screens/ScenariosListScreen';
import ScenarioEditScreen from './screens/ScenarioEditScreen';
import ProfilesScreen from './screens/ProfilesScreen';
import type { AdminTab } from './components/TopNav';
import { clearStoredToken, getStoredToken, whoAmI, type Period } from './api';

type Stage =
  | { name: 'checking-session' }
  | { name: 'login' }
  | { name: 'overview' }
  | { name: 'answer-stats'; scenarioId?: number }
  | { name: 'scenarios' }
  | { name: 'scenario-edit'; scenarioId: number }
  | { name: 'scenario-new' }
  | { name: 'profiles' };

export default function AdminApp() {
  const [stage, setStage] = useState<Stage>({ name: 'checking-session' });
  // Период статистики живёт здесь, а не внутри «Обзора»: так он не
  // сбрасывается, когда админ открывает разбивку по сценарию и возвращается.
  const [statsPeriod, setStatsPeriod] = useState<Period>('today');

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setStage({ name: 'login' });
      return;
    }
    whoAmI(token)
      .then(() => setStage({ name: 'overview' }))
      .catch(() => {
        clearStoredToken();
        setStage({ name: 'login' });
      });
  }, []);

  const goToTab = (tab: AdminTab) => setStage({ name: tab } as Stage);

  if (stage.name === 'checking-session') {
    return null;
  }

  switch (stage.name) {
    case 'login':
      return <LoginScreen onLogin={() => setStage({ name: 'overview' })} />;

    case 'overview':
      return (
        <OverviewScreen
          period={statsPeriod}
          onChangePeriod={setStatsPeriod}
          onChangeTab={goToTab}
          onOpenScenarioStats={(scenarioId) => setStage({ name: 'answer-stats', scenarioId })}
        />
      );

    case 'answer-stats':
      return (
        <AnswerStatsScreen
          period={statsPeriod}
          focusScenarioId={stage.scenarioId}
          onChangeTab={goToTab}
        />
      );

    case 'scenarios':
      return (
        <ScenariosListScreen
          onChangeTab={goToTab}
          onOpenScenario={(scenarioId) => setStage({ name: 'scenario-edit', scenarioId })}
          // Сценарий не создаётся в базе по клику — только открывается
          // пустой редактор. Запись появится после «Сохранить».
          onAddScenario={() => setStage({ name: 'scenario-new' })}
        />
      );

    case 'scenario-edit':
      return (
        <ScenarioEditScreen
          scenarioId={stage.scenarioId}
          onBack={() => setStage({ name: 'scenarios' })}
        />
      );

    case 'scenario-new':
      return (
        <ScenarioEditScreen
          scenarioId={null}
          onBack={() => setStage({ name: 'scenarios' })}
          onCreated={(scenarioId) => setStage({ name: 'scenario-edit', scenarioId })}
        />
      );

    case 'profiles':
      return <ProfilesScreen onChangeTab={goToTab} />;

    default:
      return null;
  }
}