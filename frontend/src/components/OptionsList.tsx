import type { ScenarioOption } from '../types';
import { OPTION_CARD } from '../styles/interactive';

interface OptionsListProps {
  heading?: string;
  options: ScenarioOption[];
  onSelect?: (optionId: string) => void;
}

export default function OptionsList({ heading, options, onSelect }: OptionsListProps) {
  return (
    <div className="mt-7">
      {heading && <h2 className="text-[15px] xl:text-[20px] font-bold text-ink mb-3 xl:mb-5">{heading}</h2>}
      <div className="flex flex-col gap-2.5 xl:gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect?.(option.id)}
            className={`group w-full flex items-center gap-3 bg-white rounded-[5px] px-4 py-3.5 xl:py-4 text-left ${OPTION_CARD}`}
          >
            <span className="text-muted text-sm xl:text-[18px] font-medium w-6 xl:w-11 xl:pr-3 xl:border-r xl:border-line shrink-0">{option.id}</span>
            <span className="flex-1 text-[15px] xl:text-[20px] leading-snug text-ink">{option.label}</span>
            <svg
              width="16"
              height="16"
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
  );
}
