interface ProgressBarProps {
  current: number; // текущий сценарий, 1..total
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-end mb-2">
        <span className="text-xs text-muted tabular-nums">
          {String(current).padStart(2, '0')} / {total}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < current ? 'bg-brand' : 'bg-[#D3D3DB]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
