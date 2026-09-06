import type { ScenarioOption } from '../types';

interface OptionsListProps {
  heading?: string;
  options: ScenarioOption[];
  onSelect?: (optionId: string) => void;
}

export default function OptionsList({ heading, options, onSelect }: OptionsListProps) {
  return (
    <div className="mt-7">
      {heading && <h2 className="text-[15px] font-bold text-ink mb-3">{heading}</h2>}
      <div className="flex flex-col gap-2.5">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect?.(option.id)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl border border-line px-4 py-3.5 text-left active:bg-canvas transition-colors"
          >
            <span className="text-muted text-sm font-medium w-6 shrink-0">{option.id}</span>
            <span className="flex-1 text-[15px] leading-snug text-ink">{option.label}</span>
            <svg
              width="16"
              height="16"
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
        ))}
      </div>
    </div>
  );
}
