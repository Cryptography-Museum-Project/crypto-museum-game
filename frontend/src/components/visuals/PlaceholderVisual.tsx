type PlaceholderIcon = 'cart';

interface PlaceholderVisualProps {
  icon: PlaceholderIcon;
}

// Иконка-заглушка для сценария ПОКУПКА — единственного, для которого дизайнер
// пока не передал финальную иллюстрацию (см. ScenarioScreen.tsx). Как только
// ассет будет готов, этот компонент можно убрать вместе с этим кейсом.
export default function PlaceholderVisual({ icon: _icon }: PlaceholderVisualProps) {
  return (
    <div className="bg-white rounded-[5px] p-6 flex items-center justify-center">
      <div className="w-14 h-14 rounded-[5px] bg-brand/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand">
          <path
            d="M3 4h2l2.5 12.5a2 2 0 002 1.5h7a2 2 0 002-1.9L20 8H6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="20" r="1.3" fill="currentColor" />
          <circle cx="17.5" cy="20" r="1.3" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
