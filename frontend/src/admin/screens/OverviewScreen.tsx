import { useEffect, useRef, useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import TopNav, { type AdminTab } from '../components/TopNav';
import LineChart from '../components/LineChart';
import DonutChart from '../components/DonutChart';
import {
  getStoredToken,
  fetchOverview,
  fetchScenarioStats,
  fetchProfileDistribution,
  fetchMistakes,
  type Period,
  type OverviewStats,
  type ScenarioStat,
  type ProfileDistributionItem,
  type CommonMistake,
} from '../api';
import { SECONDARY_BUTTON, FOCUS_RING } from '../../styles/interactive';

interface OverviewScreenProps {
  onChangeTab: (tab: AdminTab) => void;
  onOpenScenarioStats: (scenarioId: number) => void;
}

const TIER_COLORS: Record<string, string> = {
  novice: '#EF4444',
  connoisseur: '#10B981',
  expert: '#0B4AF9',
};

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
        className={`flex items-center gap-2 bg-white border border-line px-4 py-2.5 text-[13px] font-semibold text-ink ${SECONDARY_BUTTON}`}
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
              className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${FOCUS_RING} ${
                p.key === period
                  ? 'bg-brand text-white font-semibold'
                  : 'text-ink hover:bg-canvas active:bg-line'
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

function fmtDelta(value: number, suffix = ''): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}${suffix}`;
}

export default function OverviewScreen({ onChangeTab, onOpenScenarioStats }: OverviewScreenProps) {
  const token = getStoredToken();
  const [period, setPeriod] = useState<Period>('today');
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [scenarioStats, setScenarioStats] = useState<ScenarioStat[]>([]);
  const [mistakes, setMistakes] = useState<CommonMistake[]>([]);
  const [profiles, setProfiles] = useState<ProfileDistributionItem[]>([]);
  const [error, setError] = useState(false);

  const requestIdRef = useRef(0);
  useEffect(() => {
    if (!token) return;
    const requestId = ++requestIdRef.current;
    fetchOverview(token, period)
      .then((data) => {
        if (requestIdRef.current === requestId) setOverview(data);
      })
      .catch(() => setError(true));
  }, [token, period]);

  useEffect(() => {
    if (!token) return;
    Promise.all([fetchScenarioStats(token), fetchMistakes(token, 3), fetchProfileDistribution(token)])
      .then(([scenarioData, mistakeData, profileData]) => {
        setScenarioStats(scenarioData);
        setMistakes(mistakeData);
        setProfiles(profileData);
      })
      .catch(() => setError(true));
  }, [token]);

  if (error) {
    return (
      <PhoneScreen>
        <TopNav active="overview" onChange={onChangeTab} />
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-ink text-[14px]">
            Не удалось загрузить статистику. Проверьте, что backend запущен, и обновите страницу.
          </p>
        </div>
      </PhoneScreen>
    );
  }

  if (!overview) {
    return (
      <PhoneScreen>
        <TopNav active="overview" onChange={onChangeTab} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-ink text-[14px]">Загрузка статистики…</p>
        </div>
      </PhoneScreen>
    );
  }

  return (
    <PhoneScreen>
      <TopNav active="overview" onChange={onChangeTab} />
      <div className="flex-1 overflow-y-auto -mx-5 px-5">
        <PeriodFilter period={period} onChange={setPeriod} />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Прохождения"
            value={overview.playthroughs.value.toLocaleString('ru-RU')}
            delta={fmtDelta(overview.playthroughs.deltaPct, '%')}
          />
          <StatCard
            label="Средний индекс"
            value={`${overview.averageIndex.value}/${overview.averageIndex.outOf}`}
            delta={fmtDelta(overview.averageIndex.delta)}
          />
          <StatCard
            label="Завершили игру"
            value={`${overview.completionRate.value}%`}
            delta={fmtDelta(overview.completionRate.deltaPct, '%')}
          />
          <StatCard
            label="Среднее время"
            value={`${overview.averageTimeMin.value} мин.`}
            delta={fmtDelta(overview.averageTimeMin.delta)}
          />
        </div>

        <div className="bg-white rounded-[5px] p-4 mt-3">
          <p className="text-[12px] font-bold text-ink mb-2">Динамика — прохождения по периодам</p>
          {overview.timeline.labels.length > 0 ? (
            <LineChart points={overview.timeline.values} labels={overview.timeline.labels} />
          ) : (
            <p className="text-[12px] text-muted">Пока недостаточно данных.</p>
          )}
        </div>

        <div className="bg-white rounded-[5px] p-4 mt-3">
          <p className="text-[12px] font-bold text-ink mb-1">Ошибки по сценариям</p>
          <p className="text-[11px] text-muted mb-3">
            нажмите на сценарий, чтобы увидеть разбивку по ответам
          </p>
          <div className="space-y-2.5">
            {scenarioStats.map((scenario) => (
              <button
                key={scenario.scenarioId}
                type="button"
                onClick={() => onOpenScenarioStats(scenario.scenarioId)}
                className={`group w-full flex items-center gap-3 text-left rounded-[5px] px-2 -mx-2 py-1 hover:bg-canvas active:bg-line transition-colors ${FOCUS_RING}`}
              >
                <span className="text-[11px] text-muted w-7 shrink-0 tabular-nums">
                  {scenario.errorRate}%
                </span>
                {/* Номер сценария и его код — сразу после процента */}
                <span className="text-[12px] text-ink shrink-0 flex items-baseline gap-1">
                  <span className="tabular-nums text-right inline-block w-[1.1em]">
                    {String(scenario.scenarioId).padStart(2, '\u00A0')}
                  </span>
                  <span>| {scenario.code.toLowerCase()}</span>
                </span>
                <span className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
                  <span
                    className="block h-full bg-brand rounded-full"
                    style={{ width: `${Math.min(scenario.errorRate * 4, 100)}%` }}
                  />
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0 text-muted group-hover:text-brand transition-colors"
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
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[5px] p-4 mt-3">
          <p className="text-[12px] font-bold text-ink mb-3">Частые ошибки</p>
          {mistakes.length === 0 && <p className="text-[12px] text-muted">Пока нет данных.</p>}
          {mistakes.map((mistake) => (
            <div key={`${mistake.scenarioId}-${mistake.optionLabel}`} className="flex gap-4 mb-3 last:mb-0">
              {/* Фиксированная ширина у процента */}
              <span className="font-halvar font-bold text-brand text-[26px] shrink-0 w-24 tabular-nums whitespace-nowrap">
                {mistake.pickedPercent}%
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">
                  {mistake.category}: {mistake.scenarioCode.toLowerCase()}
                </p>
                <p className="text-[12px] text-muted leading-snug">{mistake.optionLabel}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[5px] p-4 mt-3 mb-2">
          <p className="text-[12px] font-bold text-ink mb-3">
            Профили — {overview.playthroughs.value.toLocaleString('ru-RU')} чел.
          </p>
          <div className="flex items-center gap-5">
            <DonutChart
              segments={profiles.map((p) => ({
                value: p.percent,
                color: TIER_COLORS[p.key] ?? '#9A9AA3',
              }))}
            />
            <div className="flex flex-col gap-1.5">
              {profiles.map((p) => (
                <div key={p.key} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: TIER_COLORS[p.key] ?? '#9A9AA3' }}
                  />
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: TIER_COLORS[p.key] ?? '#9A9AA3' }}
                  >
                    {p.percent}%
                  </span>
                  <span className="text-[12px] text-muted">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PhoneScreen>
  );
}
