import { TEXT_LINK } from '../styles/interactive';

interface GameMastheadProps {
  onHome?: () => void;
}

export default function GameMasthead({ onHome }: GameMastheadProps) {
  return (
    <button
      type="button"
      onClick={onHome}
      className={`hidden xl:block text-left mb-10 rounded-sm ${TEXT_LINK}`}
    >
      <h2 className="font-halvar font-light text-brand text-[38px] uppercase underline decoration-2 underline-offset-4">
        Маршрут цифрового дня
      </h2>
      <p className="text-ink text-[15px] mt-2">
        пройди весь день и собери максимальное количество баллов
      </p>
    </button>
  );
}
