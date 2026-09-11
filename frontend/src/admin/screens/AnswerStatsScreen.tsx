import { useEffect, useRef } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import BottomNav, { type AdminTab } from '../components/BottomNav';
import { scenarios } from '../../data/scenarios';
import { ANSWER_STATS_BY_SCENARIO } from '../data/mockStats';

interface AnswerStatsScreenProps {
  focusScenarioId?: number;
  onChangeTab: (tab: AdminTab) => void;
}

// Показывает распределение ответов (% по каждому варианту) по всем
// сценариям. Открывается кликом по строке в "ошибки по сценариям" на
// Обзоре — список остаётся в исходном порядке (01-10), но экран сразу
// прокручивается к тому сценарию, по которому кликнули, и подсвечивает его.
// Навигация — тот же нижний таббар, что на Обзоре и Профилях, без отдельной
// ссылки "Обзор" наверху.
export default function AnswerStatsScreen({
  focusScenarioId,
  onChangeTab,
}: AnswerStatsScreenProps) {
  const cardRefs = useRef(new Map<number, HTMLDivElement>());

  useEffect(() => {
    if (!focusScenarioId) return;
    cardRefs.current.get(focusScenarioId)?.scrollIntoView({ block: 'start' });
  }, [focusScenarioId]);

  return (
    <PhoneScreen>
      <div className="flex-1 overflow-y-auto -mx-5 px-5 space-y-4">
        {scenarios.map((scenario) => {
          const pcts = ANSWER_STATS_BY_SCENARIO[scenario.id] ?? [];
          return (
            <div
              key={scenario.id}
              ref={(node) => {
                if (node) {
                  cardRefs.current.set(scenario.id, node);
                } else {
                  cardRefs.current.delete(scenario.id);
                }
              }}
              className={`bg-white rounded-[5px] p-4 border-2 ${
                scenario.id === focusScenarioId ? 'border-brand' : 'border-transparent'
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
                      className={`flex items-start justify-between gap-2 rounded-[5px] px-3 py-2 text-[12px] ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-canvas text-ink'
                      }`}
                    >
                      <span className="text-[11px] leading-snug">
                        {option.id} {option.label.toLowerCase()}
                      </span>
                      <span className="font-bold shrink-0 pt-px">{pcts[index] ?? 0}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav active="scenarios" onChange={onChangeTab} />
    </PhoneScreen>
  );
}