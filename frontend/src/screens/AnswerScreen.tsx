import PhoneScreen from '../components/PhoneScreen';
import TopBar from '../components/TopBar';
import GameMasthead from '../components/GameMasthead';
import Footer from '../components/Footer';
import bestChoiceIcon from '../assets/best-choice-icon.svg';
import dangerIcon from '../assets/danger-icon.svg';
import safetyIcon from '../assets/safety-icon.svg';
import { PRIMARY_BUTTON } from '../styles/interactive';

interface AnswerScreenProps {
  current: number;
  total: number;
  points: 0 | 5 | 10;
  explanation: string;
  correctOptionId: string;
  correctLabel: string;
  onHome?: () => void;
  onContinue: () => void;
}

export default function AnswerScreen({
  current,
  total,
  points,
  explanation,
  correctOptionId,
  correctLabel,
  onHome,
  onContinue,
}: AnswerScreenProps) {
  const isBest = points === 10;
  const tierLabel = isBest ? 'ЛУЧШИЙ ВАРИАНТ' : points === 5 ? 'РИСК' : 'ВЫСОКИЙ РИСК';
  const tierColorClass = isBest ? 'text-emerald-600' : 'text-red-600';

  return (
    <PhoneScreen>
      <GameMasthead onHome={onHome} />
      <TopBar current={current} total={total} onHome={onHome} />

      <div className="flex flex-col flex-1 xl:grid xl:grid-cols-[1fr_220px] xl:gap-x-16 xl:items-start xl:mt-6">
        {/* Балл — узкая правая колонка на десктопе, сверху по центру на мобильном */}
        <div className="flex flex-col items-center mt-8 xl:items-end xl:mt-0 xl:col-start-2 xl:row-start-1">
          <span className="font-halvar font-bold text-brand text-[48px] xl:text-[56px] leading-none underline decoration-2 underline-offset-4">
            +{points}
          </span>
          <span className="text-brand text-[13px] font-semibold mt-1">к индексу</span>
        </div>

        {/* Карточка с объяснением — тот же белый фон, что и на мобильном,
            на десктопе только крупнее текст и шире колонка */}
        <div className="mt-6 bg-white rounded-[5px] p-5 xl:mt-0 xl:p-6 xl:col-start-1 xl:row-start-1">
          <p
            className={`flex items-center gap-2 font-bold text-[13px] xl:text-[22px] mb-3 ${tierColorClass}`}
          >
            <img
              src={isBest ? bestChoiceIcon : dangerIcon}
              alt=""
              className="w-4 h-4 xl:w-6 xl:h-6"
            />
            {tierLabel}
          </p>
          <p className="text-[14px] xl:text-[17px] leading-snug text-ink">{explanation}</p>
        </div>

        {/* Безопасная модель поведения — градиентная рамка через фон + отступ
            (не border-image: у него углы не скругляются, а нам нужно 5px) */}
        <div
          className="mt-3 rounded-[5px] p-[3px] xl:mt-8 xl:col-span-2 xl:row-start-2"
          style={{
            background:
              'linear-gradient(145.98deg, #FFFFFF 15.51%, #F2F2F3 58.76%, #FFFFFF 100.37%)',
          }}
        >
          <div className="bg-canvas rounded-[3px] p-4 xl:p-6">
            <p className="flex items-center gap-2 text-[12px] xl:text-[16px] font-bold text-ink mb-1 xl:mb-2">
              <img src={safetyIcon} alt="" className="w-4 h-4 xl:w-5 xl:h-5" /> БЕЗОПАСНАЯ МОДЕЛЬ
              ПОВЕДЕНИЯ
            </p>
            <p className="text-[14px] xl:text-[16px] text-ink">
              {correctOptionId} | {correctLabel}
            </p>
          </div>
        </div>

        <div className="flex-1 xl:hidden" />

        <button
          type="button"
          onClick={onContinue}
          className={`w-full rounded-[5px] text-white text-[15px] font-bold py-4 mt-6 xl:w-auto xl:justify-self-start xl:px-12 xl:mt-8 xl:col-start-1 xl:row-start-3 ${PRIMARY_BUTTON}`}
        >
          ПРОДОЛЖИТЬ
        </button>

        <Footer />
      </div>
    </PhoneScreen>
  );
}
