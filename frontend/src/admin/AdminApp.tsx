import { useEffect, useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import OverviewScreen from './screens/OverviewScreen';
import AnswerStatsScreen from './screens/AnswerStatsScreen';
import ScenariosListScreen from './screens/ScenariosListScreen';
import ScenarioEditScreen from './screens/ScenarioEditScreen';
import ProfilesScreen from './screens/ProfilesScreen';
import type { AdminTab } from './components/TopNav';
import { clearStoredToken, getStoredToken, whoAmI } from './api';

type Stage =
  | { name: 'checking-session' }
  | { name: 'login' }
  | { name: 'overview' }
  | { name: 'answer-stats'; scenarioId?: number }
  | { name: 'scenarios' }
  | { name: 'scenario-edit'; scenarioId: number }
  | { name: 'profiles' };

export default function AdminApp() {
  const [stage, setStage] = useState<Stage>({ name: 'checking-session' });

  // Если в браузере уже сохранён токен (вошли раньше) — проверяем, что он
  // ещё действует, и сразу открываем админку, не заставляя логиниться снова.
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
          onChangeTab={goToTab}
          onOpenScenarioStats={(scenarioId) => setStage({ name: 'answer-stats', scenarioId })}
        />
      );

    case 'answer-stats':
      return <AnswerStatsScreen focusScenarioId={stage.scenarioId} onChangeTab={goToTab} />;

    case 'scenarios':
      return (
        <ScenariosListScreen
          onChangeTab={goToTab}
          onOpenScenario={(scenarioId) => setStage({ name: 'scenario-edit', scenarioId })}
          onAddScenario={() =>
            window.alert('Добавление нового сценария подключим вместе с бэкендом.')
          }
        />
      );

    case 'scenario-edit':
      return (
        <ScenarioEditScreen
          scenarioId={stage.scenarioId}
          onBack={() => setStage({ name: 'scenarios' })}
        />
      );

    case 'profiles':
      return <ProfilesScreen onChangeTab={goToTab} />;

    default:
      return null;
  }
}