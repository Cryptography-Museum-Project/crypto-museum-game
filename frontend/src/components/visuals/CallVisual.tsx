export default function CallVisual({ duration }: { duration: string }) {
  const bars = [6, 14, 9, 18, 11, 20, 8, 15, 10, 17, 7];
  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-canvas flex items-center justify-center text-lg shrink-0">
        +
      </div>
      <div className="flex items-end gap-[3px] flex-1 h-6">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-brand/70"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span className="text-sm text-muted tabular-nums shrink-0">{duration}</span>
      <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 5c0 8 7 15 15 15l2-4-5-2-2 2c-2.5-1-4-2.5-5-5l2-2-2-5-4 1z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}
