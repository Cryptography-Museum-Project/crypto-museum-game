interface LineChartProps {
  points: number[];
  labels: string[];
  maxValue?: number;
}

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

  const gridValues = Array.from(new Set([0, Math.round(max / 2), Math.round(max)]));

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

