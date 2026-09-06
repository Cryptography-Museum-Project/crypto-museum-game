import PhoneScreen from '../components/PhoneScreen';
import Footer from '../components/Footer';
import manImage from '../assets/man.png';
import circlesBg from '../assets/circles.png';
import dotsBg from '../assets/dots.png';

interface LandingScreenProps {
  onStart?: () => void;
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <PhoneScreen>
      <img
        src={circlesBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 -top-5 w-87.5 max-w-none opacity-60"
      />
      <img
        src={dotsBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-1 w-35"
      />

      <div className="relative flex flex-col h-full">
        <h2 className="font-halvar font-light text-brand text-[20px] uppercase underline decoration-2 underline-offset-4">
          Ключ к доверию
        </h2>
        <p className="text-ink text-[14px] leading-snug mt-2">
          Выставка, которая поможет найти баланс между доверием к цифровому миру и защитой
          собственных данных
        </p>

        <h1 className="font-halvar font-light text-brand text-[34px] uppercase leading-[1.05] mt-5 underline decoration-2 underline-offset-4">
          Маршрут
          <br />
          цифрового дня
        </h1>

        <p className="text-ink text-[15px] leading-snug mt-4 max-w-55">
          пройди весь день и собери максимальное количество баллов
        </p>

        <div className="flex-1 min-h-45 my-6 flex items-center justify-center overflow-hidden">
          <img src={manImage} alt="" className="max-w-full max-h-full object-contain" />
        </div>

        <p className="text-center text-[12px] text-ink">
          10 ситуаций • 5-7 минут • без регистрации
        </p>

        <button
          type="button"
          onClick={onStart}
          className="mt-4 w-full bg-dark text-white text-[15px] font-bold py-4"
        >
          ПРОЙТИ И ПОЛУЧИТЬ СКИДКУ
        </button>

        <Footer />
      </div>
    </PhoneScreen>
  );
}
