// ЗАГЛУШКА: реальную статистику будет отдавать бэкенд (GET /api/stats и т.д.).
// Здесь — фиктивные числа для проверки интерфейса до готовности бэкенда.
//
// Дата/время прохождения используется бэкендом для агрегации ПО ПЕРИОДАМ
// (см. PERIOD_STATS ниже) — а не для показа отдельных сессий: конкретное
// анонимное прохождение само по себе не несёт статистической ценности,
// ценность появляется только в агрегате (за день/неделю/месяц).

export type Period = 'today' | '7d' | '30d' | 'all';

interface PeriodStats {
  playthroughs: { value: number; deltaPct: number };
  averageIndex: { value: number; outOf: number; delta: number };
  completionRate: { value: number; deltaPct: number };
  averageTimeMin: { value: number; delta: number };
  timeline: { labels: string[]; values: number[] };
}

export const PERIOD_STATS: Record<Period, PeriodStats> = {
  today: {
    playthroughs: { value: 96, deltaPct: 12 },
    averageIndex: { value: 7, outOf: 10, delta: 1 },
    completionRate: { value: 88, deltaPct: 2 },
    averageTimeMin: { value: 5.3, delta: 0.1 },
    timeline: {
      labels: ['9:00', '12:00', '15:00', '18:00'],
      values: [8, 24, 41, 96],
    },
  },
  '7d': {
    playthroughs: { value: 612, deltaPct: 15 },
    averageIndex: { value: 7, outOf: 10, delta: 2 },
    completionRate: { value: 87, deltaPct: 4 },
    averageTimeMin: { value: 5.4, delta: 0.2 },
    timeline: {
      labels: ['пн', 'ср', 'пт', 'вс'],
      values: [70, 95, 130, 180],
    },
  },
  '30d': {
    playthroughs: { value: 2847, deltaPct: 18 },
    averageIndex: { value: 7, outOf: 10, delta: 4 },
    completionRate: { value: 86, deltaPct: 6 },
    averageTimeMin: { value: 5.42, delta: 0.4 },
    timeline: {
      labels: ['1 авг.', '15 авг.', '30 авг.', '1 сен.'],
      values: [50, 60, 78, 102],
    },
  },
  all: {
    playthroughs: { value: 14210, deltaPct: 31 },
    averageIndex: { value: 6, outOf: 10, delta: 2 },
    completionRate: { value: 80, deltaPct: 3 },
    averageTimeMin: { value: 5.8, delta: 0.1 },
    timeline: {
      labels: ['апр.', 'июнь', 'авг.', 'сен.'],
      values: [1500, 2400, 3600, 6710],
    },
  },
};

// % ошибочных (не лучших) ответов по каждому из 10 сценариев.
export const ERROR_RATE_BY_SCENARIO: Record<number, number> = {
  1: 7,
  2: 6,
  3: 9,
  4: 5,
  5: 12,
  6: 4,
  7: 2,
  8: 15,
  9: 3,
  10: 18,
};

export const COMMON_MISTAKES = [
  {
    title: 'открытый Wi-Fi',
    pct: 37,
    description:
      'Пользователи подключаются к сети с похожим названием и продолжают пользоваться ею.',
  },
];

export const PROFILE_DISTRIBUTION = [
  { key: 'novice', label: 'новичок', pct: 20, color: '#EF4444' },
  { key: 'expert', label: 'эксперт', pct: 40, color: '#0B4AF9' },
  { key: 'connoisseur', label: 'знаток', pct: 40, color: '#10B981' },
];

// Проценты выбора каждого варианта ответа — по сценарию (мок-данные).
export const ANSWER_STATS_BY_SCENARIO: Record<number, number[]> = {
  1: [14, 50, 36],
  2: [14, 60, 26],
  3: [22, 31, 47],
  4: [58, 20, 22],
  5: [25, 20, 55],
  6: [15, 60, 25],
  7: [70, 10, 20],
  8: [20, 25, 55],
  9: [15, 75, 10],
  10: [60, 20, 20],
};
