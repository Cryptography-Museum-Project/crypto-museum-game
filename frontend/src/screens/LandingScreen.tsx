import PhoneScreen from '../components/PhoneScreen';
import manImage from '../assets/man.png';
import circlesBg from '../assets/circles.png';
import dotsBg from '../assets/dots.png';

interface LandingScreenProps {
  onStart?: () => void;
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <PhoneScreen>
      {/* Декоративный фон — не мешает кликам, поэтому pointer-events-none */}
      <img
  src={circlesBg}
  alt=""
  aria-hidden="true"
  className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 -top-5 w-[350px] max-w-none opacity-60"
/>
      <img
        src={dotsBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-1 w-[140px]"
      />

      <div className="relative flex flex-col h-full">
        <p className="text-[13px] tracking-wide text-ink">КЛЮЧ К ДОВЕРИЮ</p>

        <h1 className="text-brand text-[34px] font-extrabold uppercase leading-[1.05] mt-4 underline decoration-2 underline-offset-4">
          Маршрут
          <br />
          цифрового дня
        </h1>

        <p className="text-ink text-[15px] leading-snug mt-4 max-w-[220px]">
          пройди весь день и собери максимальное количество баллов
        </p>

        <div className="flex-1 min-h-[220px] my-6 flex items-center justify-center overflow-hidden">
          <img
            src={manImage}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <p className="text-center text-[13px] text-ink">
          10 ситуаций • 5-7 минут • без регистрации
        </p>

        <button
          type="button"
          onClick={onStart}
          className="mt-4 w-full rounded-2xl bg-brand text-white text-[15px] font-bold py-4 flex items-center justify-center gap-2"
        >
          НАЧАТЬ
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3L11 8L6 13"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </PhoneScreen>
  );
}