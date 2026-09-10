type PlaceholderIcon = 'lock' | 'device' | 'cart';

const ICONS: Record<PlaceholderIcon, string[]> = {
  lock: ['M5 11h14v9H5z', 'M8 11V7a4 4 0 018 0v4'],
  device: ['M7 2h10v20H7z', 'M7 18h10'],
  cart: ['M3 4h2l2.5 12.5a2 2 0 002 1.5h7a2 2 0 002-1.9L20 8H6'],
};

interface PlaceholderVisualProps {
  icon: PlaceholderIcon;
}

// Общая "иконка-заглушка" для сценариев без собственного мини-экрана
// приложения (Пароль, Авито, Покупка) — по размеру и отступам совпадает
// с карточками EmailVisual / PhotoPermissionVisual (56px квадрат, p-6),
// чтобы все карточки-сценарии выглядели одной семьёй.
export default function PlaceholderVisual({ icon }: PlaceholderVisualProps) {
  return (
    <div className="bg-white rounded-[5px] p-6 flex items-center justify-center">
      <div className="w-14 h-14 rounded-[5px] bg-brand/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand">
          {ICONS[icon].map((d) => (
            <path
              key={d}
              d={d}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {icon === 'lock' && <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />}
          {icon === 'cart' && (
            <>
              <circle cx="9.5" cy="20" r="1.3" fill="currentColor" />
              <circle cx="17.5" cy="20" r="1.3" fill="currentColor" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
