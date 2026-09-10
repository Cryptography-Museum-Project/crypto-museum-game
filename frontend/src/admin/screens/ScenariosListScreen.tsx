import PhoneScreen from '../../components/PhoneScreen';
import BottomNav, { type AdminTab } from '../components/BottomNav';
import { scenarios } from '../../data/scenarios';

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
  return (
    <PhoneScreen>
      <button
        type="button"
        onClick={onAddScenario}
        className="ml-auto flex items-center gap-1.5 bg-white border border-line px-4 py-2.5 text-[13px] font-semibold text-ink mb-4"
      >
        добавить
        <span className="text-brand text-base leading-none">+</span>
      </button>

      <div className="flex-1 overflow-y-auto -mx-5 px-5 space-y-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onOpenScenario(scenario.id)}
            className="w-full flex gap-3 bg-white rounded-[5px] p-4 text-left"
          >
            <span className="font-bold text-ink shrink-0">{scenario.id}</span>
            <span className="text-[13px] text-ink leading-snug">{scenario.description}</span>
          </button>
        ))}
      </div>

      <BottomNav active="scenarios" onChange={onChangeTab} />
    </PhoneScreen>
  );
}
