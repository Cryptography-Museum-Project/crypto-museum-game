import { FOCUS_RING } from '../../styles/interactive';

export type AdminTab = 'overview' | 'scenarios' | 'profiles';

interface BottomNavProps {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
}

// Иконки — на currentColor: цвет задаётся снаружи через text-* классы на
// кнопке (а не пропом active, как было раньше), это и позволяет управлять
// им через hover/active/группу, а не только через "активная вкладка или нет".
function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 2h9l5 5v15H6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M15 2v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M15.5 13.2c2.6.4 4.5 2.6 4.5 5.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TABS: { key: AdminTab; label: string; Icon: typeof EyeIcon }[] = [
  { key: 'overview', label: 'обзор', Icon: EyeIcon },
  { key: 'scenarios', label: 'сценарии', Icon: DocIcon },
  { key: 'profiles', label: 'профили', Icon: PeopleIcon },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="flex items-stretch justify-around border-t border-line pt-3 -mx-5 px-5 mt-4">
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 px-3 pt-1 pb-1 rounded-[5px] transition-colors active:bg-ink/5 ${FOCUS_RING} ${
              isActive ? 'text-brand' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon />
            <span className={`text-[11px] ${isActive ? 'font-semibold' : ''}`}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
