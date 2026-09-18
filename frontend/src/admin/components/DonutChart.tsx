interface DonutSegment {
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
}

export default function DonutChart({ segments, size = 96 }: DonutChartProps) {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const offsets = segments.reduce<number[]>((acc, _segment, index) => {
    const previous =
      index === 0 ? 0 : acc[index - 1] + (segments[index - 1].value / total) * circumference;
    acc.push(previous);
    return acc;
  }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((segment, index) => {
        const fraction = segment.value / total;
        const dash = fraction * circumference;
        const dashArray = `${dash} ${circumference - dash}`;
        const dashOffset = -offsets[index];
        return (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </svg>
  );
}
