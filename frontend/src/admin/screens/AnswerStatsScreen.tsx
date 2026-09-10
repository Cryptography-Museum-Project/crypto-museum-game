import PhoneScreen from '../../components/PhoneScreen';
import { scenarios } from '../../data/scenarios';
import { ANSWER_STATS_BY_SCENARIO } from '../data/mockStats';

interface AnswerStatsScreenProps {
  focusScenarioId?: number;
  onBack: () => void;
}

function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Показывает распределение ответов (% по каждому варианту) по всем
// сценариям. Открывается кликом по строке в "ошибки по сценариям" на
// Обзоре — тот сценарий, по которому кликнули, будет виден первым.
export default function AnswerStatsScreen({ focusScenarioId, onBack }: AnswerStatsScreenProps) {
  const ordered = focusScenarioId
    ? [
        scenarios.find((s) => s.id === focusScenarioId)!,
        ...scenarios.filter((s) => s.id !== focusScenarioId),
      ]
    : scenarios;

  return (
    <PhoneScreen>
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-ink mb-4">
        <BackArrow />
        <span className="text-[13px] font-semibold">Обзор</span>
      </button>

      <div className="flex-1 overflow-y-auto -mx-5 px-5 space-y-4">
        {ordered.map((scenario) => {
          const pcts = ANSWER_STATS_BY_SCENARIO[scenario.id] ?? [];
          return (
            <div
              key={scenario.id}
              className={`bg-white rounded-[5px] p-4 ${
                scenario.id === focusScenarioId ? 'ring-2 ring-brand' : ''
              }`}
            >
              <p className="flex gap-2 text-[13px] text-ink leading-snug mb-3">
                <span className="font-bold shrink-0">{scenario.id}</span>
                {scenario.description}
              </p>
              <div className="space-y-1.5">
                {scenario.options.map((option, index) => {
                  const isCorrect = option.points === 10;
                  return (
                    <div
                      key={option.id}
                      className={`flex items-center justify-between rounded-[5px] px-3 py-2 text-[12px] ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-canvas text-ink'
                      }`}
                    >
                      <span className="truncate pr-2">
                        {option.id} {option.label.toLowerCase()}
                      </span>
                      <span className="font-bold shrink-0">{pcts[index] ?? 0}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </PhoneScreen>
  );
}
