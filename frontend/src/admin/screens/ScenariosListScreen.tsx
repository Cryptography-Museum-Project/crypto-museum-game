import { useEffect, useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import BottomNav, { type AdminTab } from '../components/BottomNav';
import { getStoredToken, fetchAdminScenarios, type AdminScenario } from '../api';
import { SECONDARY_BUTTON, FOCUS_RING } from '../../styles/interactive';

interface ScenariosListScreenProps {
  onChangeTab: (tab: AdminTab) => void;
  onOpenScenario: (scenarioId: number) => void;
  onAddScenario: () => void;
}

export default function ScenariosListScreen({
  onChangeTab,
  onOpenScenario,
  onAddScenario,
}: ScenariosListScreenProps) {
  const [scenarios, setScenarios] = useState<AdminScenario[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    fetchAdminScenarios(token)
      .then(setScenarios)
      .catch(() => setError(true));
  }, []);

  return (
    <PhoneScreen>
      <button
        type="button"
        onClick={onAddScenario}
        className={`ml-auto flex items-center gap-1.5 bg-white px-4 py-2.5 text-[13px] font-semibold text-ink mb-4 ${SECONDARY_BUTTON}`}
      >
        добавить
        <span className="text-brand text-base leading-none">+</span>
      </button>

      {error && <p className="text-[13px] text-ink px-1">Не удалось загрузить сценарии.</p>}

      <div className="flex-1 overflow-y-auto -mx-5 px-5 space-y-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onOpenScenario(scenario.id)}
            className={`w-full flex gap-3 bg-white rounded-[5px] p-4 text-left border-2 border-transparent hover:border-brand active:bg-canvas transition-colors ${FOCUS_RING} ${
              scenario.isActive ? '' : 'opacity-50'
            }`}
          >
            <span className="font-bold text-ink shrink-0">{scenario.id}</span>
            <span className="text-[13px] text-ink leading-snug flex-1">{scenario.description}</span>
            {!scenario.isActive && (
              <span className="text-[10px] text-muted shrink-0 self-start">резерв</span>
            )}
          </button>
        ))}
      </div>

      <BottomNav active="scenarios" onChange={onChangeTab} />
    </PhoneScreen>
  );
}
