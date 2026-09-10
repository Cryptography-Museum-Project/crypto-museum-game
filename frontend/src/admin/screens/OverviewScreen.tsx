import { useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import BottomNav, { type AdminTab } from '../components/BottomNav';
import LineChart from '../components/LineChart';
import DonutChart from '../components/DonutChart';
import { scenarios } from '../../data/scenarios';
import {
  PERIOD_STATS,
  ERROR_RATE_BY_SCENARIO,
  COMMON_MISTAKES,
  PROFILE_DISTRIBUTION,
  type Period,
} from '../data/mockStats';

interface OverviewScreenProps {
  onChangeTab: (tab: AdminTab) => void;
  onOpenScenarioStats: (scenarioId: number) => void;
}

function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="bg-white rounded-[5px] p-4">
      <p className="text-[11px] text-muted mb-1">{label}</p>
      <p className="flex items-baseline gap-2">
        <span className="font-halvar font-bold text-brand text-[22px]">{value}</span>
        <span className="text-emerald-600 text-[12px] font-semibold">{delta}</span>
      </p>
    </div>
  );
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Сегодня' },
  { key: '7d', label: '7 дней' },
  { key: '30d', label: '30 дней' },
  { key: 'all', label: 'За всё время' },
];

function PeriodFilter({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLabel = PERIODS.find((p) => p.key === period)?.label;

  return (
    <div className="relative mb-4">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 bg-white border border-line px-4 py-2.5 text-[13px] font-semibold text-ink"
      >
        Период: {currentLabel}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-line min-w-[160px]">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                onChange(p.key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[13px] ${
                p.key === period ? 'bg-brand text-white font-semibold' : 'text-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OverviewScreen({ onChangeTab, onOpenScenarioStats }: OverviewScreenProps) {
  const [period, setPeriod] = useState<Period>('today');
  const stats = PERIOD_STATS[period];

  return (
    <PhoneScreen>
      <div className="flex-1 overflow-y-auto -mx-5 px-5">
        <PeriodFilter period={period} onChange={setPeriod} />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="прохождения"
            value={stats.playthroughs.value.toLocaleString('ru-RU')}
            delta={`+${stats.playthroughs.deltaPct}%`}
          />
          <StatCard
            label="средний индекс"
            value={`${stats.averageIndex.value}/${stats.averageIndex.outOf}`}
            delta={`+${stats.averageIndex.delta}`}
          />
          <StatCard
            label="завершили игру"
            value={`${stats.completionRate.value}%`}
            delta={`+${stats.completionRate.deltaPct}%`}
          />
          <StatCard
            label="среднее время"
            value={`${stats.averageTimeMin.value} мин.`}
            delta={`+${stats.averageTimeMin.delta}`}
          />
        </div>

        <div className="bg-white rounded-[5px] p-4 mt-3">
          <p className="text-[12px] font-bold text-ink mb-2">динамика — прохождения по периодам</p>
          <LineChart points={stats.timeline.values} labels={stats.timeline.labels} />
        </div>

        <div className="bg-white rounded-[5px] p-4 mt-3">
          <p className="text-[12px] font-bold text-ink mb-1">ошибки по сценариям</p>
          <p className="text-[11px] text-muted mb-3">
            нажмите на сценарий, чтобы увидеть разбивку по ответам
          </p>
          <div className="space-y-2.5">
            {scenarios.map((scenario) => {
              const pct = ERROR_RATE_BY_SCENARIO[scenario.id] ?? 0;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => onOpenScenarioStats(scenario.id)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <span className="text-[11px] text-muted w-7 shrink-0 tabular-nums">{pct}%</span>
                  <span className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
                    <span
                      className="block h-full bg-brand rounded-full"
                      style={{ width: `${Math.min(pct * 4, 100)}%` }}
                    />
                  </span>
                  <span className="text-[12px] text-ink shrink-0">
                    {scenario.id} | {scenario.code.toLowerCase()}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 text-muted"
                  >
                    <path
                      d="M6 3L11 8L6 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[5px] p-4 mt-3">
          <p className="text-[12px] font-bold text-ink mb-3">частые ошибки</p>
          {COMMON_MISTAKES.map((mistake) => (
            <div key={mistake.title} className="flex gap-3">
              <span className="font-halvar font-bold text-brand text-[26px] shrink-0">
                {mistake.pct}%
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">{mistake.title}</p>
                <p className="text-[12px] text-muted leading-snug">{mistake.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[5px] p-4 mt-3 mb-2">
          <p className="text-[12px] font-bold text-ink mb-3">
            профили — {stats.playthroughs.value.toLocaleString('ru-RU')} чел.
          </p>
          <div className="flex items-center gap-5">
            <DonutChart
              segments={PROFILE_DISTRIBUTION.map((p) => ({ value: p.pct, color: p.color }))}
            />
            <div className="flex flex-col gap-1.5">
              {PROFILE_DISTRIBUTION.map((p) => (
                <div key={p.key} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[13px] font-bold" style={{ color: p.color }}>
                    {p.pct}%
                  </span>
                  <span className="text-[12px] text-muted">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="overview" onChange={onChangeTab} />
    </PhoneScreen>
  );
}
