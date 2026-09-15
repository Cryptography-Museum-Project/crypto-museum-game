import { useEffect, useRef, useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import BottomNav, { type AdminTab } from '../components/BottomNav';
import { getStoredToken, fetchScenarioStats, type ScenarioStat } from '../api';

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
  const [scenarioStats, setScenarioStats] = useState<ScenarioStat[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    fetchScenarioStats(token)
      .then(setScenarioStats)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!focusScenarioId) return;
    cardRefs.current.get(focusScenarioId)?.scrollIntoView({ block: 'start' });
  }, [focusScenarioId, scenarioStats]);

  if (error) {
    return (
      <PhoneScreen>
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-ink text-[14px]">Не удалось загрузить статистику по сценариям.</p>
        </div>
        <BottomNav active="scenarios" onChange={onChangeTab} />
      </PhoneScreen>
    );
  }

  return (
    <PhoneScreen>
      <div className="flex-1 overflow-y-auto -mx-5 px-5 space-y-4">
        {scenarioStats.map((scenario) => (
          <div
            key={scenario.scenarioId}
            ref={(node) => {
              if (node) {
                cardRefs.current.set(scenario.scenarioId, node);
              } else {
                cardRefs.current.delete(scenario.scenarioId);
              }
            }}
            className={`bg-white rounded-[5px] p-4 border-2 ${
              scenario.scenarioId === focusScenarioId ? 'border-brand' : 'border-transparent'
            }`}
          >
            <p className="flex gap-2 text-[13px] text-ink leading-snug mb-3">
              <span className="font-bold shrink-0">{scenario.scenarioId}</span>
              {scenario.description}
            </p>
            <div className="space-y-1.5">
              {scenario.options.map((option) => {
                const isCorrect = option.points === 10;
                return (
                  <div
                    key={option.id}
                    className={`flex items-start justify-between gap-2 rounded-[5px] px-3 py-2 text-[12px] ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-canvas text-ink'
                    }`}
                  >
                    <span className="text-[11px] leading-snug">
                      {option.code} {option.label.toLowerCase()}
                    </span>
                    <span className="font-bold shrink-0 pt-px">{option.pickedPercent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="scenarios" onChange={onChangeTab} />
    </PhoneScreen>
  );
}
