import PhoneScreen from '../components/PhoneScreen';
import Footer from '../components/Footer';
import manImage from '../assets/man.png';
import circlesBg from '../assets/circles.png';
import dotsBg from '../assets/dots.png';
import desktopPattern from '../assets/desktop-pattern.png';
import desktopFigure from '../assets/desktop-figure.png';
import { PRIMARY_BUTTON } from '../styles/interactive';

interface LandingScreenProps {
  onStart?: () => void;
}

const LETTER_STEP_SECONDS = 0.045;

function renderAnimatedWord(word: string, startIndex: number) {
  const letters = word.split('').map((char, i) => (
    <span
      key={i}
      className="letter-reveal"
      style={{ animationDelay: `${(startIndex + i) * LETTER_STEP_SECONDS}s` }}
    >
      {char}
    </span>
  ));
  // Слово оборачиваем в один inline-block с white-space: nowrap — иначе
  // браузер видит точку переноса МЕЖДУ ЛЮБЫМИ двумя буквами (каждая буква —
  // отдельный <span>) и может перенести строку посередине слова (как было:
  // "цифрового ДНЯ" → "цифрового Д" / "НЯ" на экране 360px).
  // Подчёркивание вешаем на КАЖДОЕ слово отдельно (эта обёртка уже
  // inline-block), а не на родительский <h1> — там оно рисуется одной
  // сплошной линией через всю строку, и text-decoration:none на дочернем
  // пробеле её не прерывает (так работает text-decoration в CSS: снять
  // его может только atomic inline-level элемент вроде inline-block).
  return (
    <span className="inline-block whitespace-nowrap underline decoration-2 underline-offset-4">
      {letters}
    </span>
  );
}

function AnimatedTitle({ lines }: { lines: string[] }) {
  let cursor = 0;
  return (
    <span aria-label={lines.join(' ')}>
      {lines.map((line, lineIndex) => {
        const words = line.split(' ');
        const rendered = words.map((word, wordIndex) => {
          const el = renderAnimatedWord(word, cursor);
          cursor += word.length;
          const isLastWord = wordIndex === words.length - 1;
          if (!isLastWord) cursor += 1; // сам пробел тоже занимает позицию в тайминге

          // Пробел между словами — просто пробел, никакой обёртки не
          // нужно: подчёркивание теперь висит на словах, а не на <h1>,
          // так что через пробел ему рисоваться уже неоткуда.
          return (
            <span key={wordIndex}>
              {el}
              {!isLastWord && ' '}
            </span>
          );
        });
        return (
          <span key={lineIndex} aria-hidden="true">
            {rendered}
            {lineIndex < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <PhoneScreen>
      {/* Мобильный декоративный фон */}
      <img
        src={circlesBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 -top-5 w-87.5 max-w-none opacity-60 xl:hidden"
      />
      <img
        src={dotsBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-1 w-35 xl:hidden"
      />

      {/* Десктопный фон-узор — растянут на всю ширину средней колонки,
          сидит позади всего контента (текста и картинки-фигуры) */}
      <img
        src={desktopPattern}
        alt=""
        aria-hidden="true"
        className="hidden xl:block pointer-events-none select-none absolute top-0 left-0 w-full h-auto opacity-70"
      />
      {/* Картинка-фигура — начинается на уровне заголовка "МАРШРУТ" (не после
          кнопки!), сидит справа от текста и тянется вниз почти до низа экрана.
          Высота бокса задаётся через top+bottom (а не фиксированной высотой),
          поэтому картинка всегда умещается по высоте экрана на любом дисплее
          без скролла и без обрезания — она просто пропорционально ужимается. */}
      <div
        aria-hidden="true"
        className="hidden xl:block pointer-events-none select-none absolute right-0 top-[390px] bottom-10 w-125"
      >
        <img
          src={desktopFigure}
          alt=""
          className="h-full w-full object-contain object-right-bottom"
        />
      </div>

      <div className="relative flex flex-col h-full xl:h-full">
        <h2 className="font-halvar font-light text-brand text-[20px] xl:text-[32px] uppercase underline decoration-2 underline-offset-4">
          Ключ к доверию
        </h2>
        <p className="text-ink text-[14px] xl:text-[22px] leading-snug mt-2 xl:max-w-[730px]">
          Выставка, которая поможет найти баланс между доверием к цифровому миру и защитой
          собственных данных
        </p>

        <h1 className="font-halvar font-light text-brand text-[34px] xl:text-[44px] uppercase leading-[1.05] mt-5">
          <AnimatedTitle lines={['Маршрут', 'цифрового дня']} />
        </h1>

        <p className="text-ink text-[15px] xl:text-[18px] leading-snug mt-4 max-w-55 xl:max-w-none">
          пройди весь день и собери максимальное количество баллов
        </p>

        <div className="flex-1 min-h-45 my-6 flex items-center justify-center overflow-hidden xl:hidden">
          <img src={manImage} alt="" className="max-w-full max-h-full object-contain" />
        </div>

        <p className="text-center text-[12px] xl:text-[14px] text-ink xl:text-left xl:mt-8">
          10 ситуаций • 5-7 минут • без регистрации
        </p>

        <button
          type="button"
          onClick={onStart}
          className={`relative mt-4 w-full rounded-[5px] text-white text-[15px] font-bold py-4 text-center xl:w-auto xl:self-start xl:text-left xl:leading-snug xl:px-8 xl:py-3 xl:mt-6 ${PRIMARY_BUTTON}`}
        >
          <span className="xl:hidden">ПРОЙТИ И ПОЛУЧИТЬ СКИДКУ</span>
          <span className="hidden xl:block">ПРОЙТИ</span>
          <span className="hidden xl:block">И ПОЛУЧИТЬ СКИДКУ</span>
        </button>
      </div>

      <Footer />
    </PhoneScreen>
  );
}