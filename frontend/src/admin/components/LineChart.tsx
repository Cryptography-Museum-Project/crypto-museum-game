interface LineChartProps {
  points: number[];
  labels: string[];
  maxValue?: number;
}

// Простой линейный график без сторонних библиотек — достаточно для
// визуализации одной метрики во времени (см. OverviewScreen).
export default function LineChart({ points, labels, maxValue }: LineChartProps) {
  const width = 320;
  const height = 120;
  const paddingLeft = 28;
  const paddingBottom = 18;
  const max = maxValue ?? Math.max(...points) * 1.2;

  const plotWidth = width - paddingLeft;
  const plotHeight = height - paddingBottom;

  const coords = points.map((value, index) => {
    const x = paddingLeft + (index / (points.length - 1)) * plotWidth;
    const y = plotHeight - (value / max) * plotHeight;
    return `${x},${y}`;
  });

  // Math.round(max/2) и Math.round(max) иногда совпадают (например, при
  // max=1.2 оба дают 1) — без de-dup получили бы две линии/подписи с
  // одинаковым значением и одинаковым key, из-за чего React путается
  // при перерисовке (визуально — "наезжающие" числа на оси).
  const gridValues = Array.from(new Set([0, Math.round(max / 2), Math.round(max)]));

  // Если подписей дат много (5-7, как у периодов "30 дней"/"за всё время"),
  // они физически не помещаются по ширине и накладываются друг на друга.
  // Поэтому показываем не каждую подпись, а через равный шаг (0, step,
  // 2*step, ...) — благодаря этому расстояние по времени между любыми
  // двумя соседними показанными подписями всегда одинаковое.
  //
  // ВАЖНО: специально не форсируем показ последней точки, если она не
  // попадает точно на шаг — раньше так делали, и из-за этого последний
  // промежуток получался короче остальных (например, для 6 точек с шагом
  // 2 получали подписи с индексами 0,2,4,5 — гэп 2,2,1 вместо 2,2,2).
  const targetLabelCount = 4;
  const labelStep = Math.max(
    1,
    Math.round((labels.length - 1) / Math.max(1, targetLabelCount - 1)),
  );

  return (
    <svg viewBox={`0 0 ${width} ${height + 14}`} className="w-full">
      {gridValues.map((value) => {
        const y = plotHeight - (value / max) * plotHeight;
        return (
          <g key={value}>
            <line x1={paddingLeft} x2={width} y1={y} y2={y} stroke="#E4E4EA" strokeWidth="1" />
            <text x={0} y={y + 3} fontSize="9" fill="#9A9AA3">
              {value}
            </text>
          </g>
        );
      })}
      <polyline points={coords.join(' ')} fill="none" stroke="#0B4AF9" strokeWidth="2" />
      {coords.map((point, index) => {
        const [x, y] = point.split(',');
        return <circle key={index} cx={x} cy={y} r="2.5" fill="#0B4AF9" />;
      })}
      {labels.map((label, index) => {
        if (index % labelStep !== 0) return null;

        const x = paddingLeft + (index / (points.length - 1)) * plotWidth;
        const isFirst = index === 0;
        // "Последней" для целей выравнивания текста считаем последнюю ПОКАЗАННУЮ
        // подпись, а не последнюю точку данных (она может остаться без подписи).
        const isLastShown = index + labelStep > labels.length - 1;
        return (
          <text
            key={index}
            x={x}
            y={height + 10}
            fontSize="9"
            fill="#9A9AA3"
            textAnchor={isFirst ? 'start' : isLastShown ? 'end' : 'middle'}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

