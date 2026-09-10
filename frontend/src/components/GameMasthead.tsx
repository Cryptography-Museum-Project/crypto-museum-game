interface GameMastheadProps {
  onHome?: () => void;
}

// Показывается только на десктопе (xl и выше) — на мобильном эта роль
// уже выполняется иконкой "домой" в TopBar, повторять незачем.
// Клик по заголовку — это и есть десктопный аналог иконки "домой".
export default function GameMasthead({ onHome }: GameMastheadProps) {
  return (
    <button type="button" onClick={onHome} className="hidden xl:block text-left mb-10">
      <h2 className="font-halvar font-light text-brand text-[38px] uppercase underline decoration-2 underline-offset-4">
        Маршрут цифрового дня
      </h2>
      <p className="text-ink text-[15px] mt-2">
        пройди весь день и собери максимальное количество баллов
      </p>
    </button>
  );
}
