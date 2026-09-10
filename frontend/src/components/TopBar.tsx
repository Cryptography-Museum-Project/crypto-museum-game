import homeIcon from '../assets/house-icon.svg';
import replayIcon from '../assets/replay-icon.svg';

interface TopBarProps {
  current: number;
  total: number;
  onHome?: () => void;
  showReplay?: boolean;
  onReplay?: () => void;
}

export default function TopBar({ current, total, onHome, showReplay, onReplay }: TopBarProps) {
  return (
    <div>
      <div className="flex items-center mb-2 xl:justify-end">
        <button type="button" onClick={onHome} aria-label="На главную" className="xl:hidden">
          <img src={homeIcon} alt="" className="w-5 h-5" />
        </button>
        <div className="flex-1 xl:hidden" />
        <span className="font-halvar font-bold text-xs text-muted tabular-nums">
          {String(current).padStart(2, '0')} / {total}
        </span>
        {showReplay && (
          <button
            type="button"
            onClick={onReplay}
            aria-label="Начать заново"
            className="xl:hidden ml-3"
          >
            <img src={replayIcon} alt="Начать заново" className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${index < current ? 'bg-brand' : 'bg-[#D3D3DB]'}`}
          />
        ))}
      </div>
    </div>
  );
}
