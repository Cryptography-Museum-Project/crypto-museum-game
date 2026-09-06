import PhoneScreen from '../components/PhoneScreen';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import bestChoiceIcon from '../assets/best-choice-icon.svg';
import dangerIcon from '../assets/danger-icon.svg';
import safetyIcon from '../assets/safety-icon.svg';

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
      <TopBar current={current} total={total} onHome={onHome} />

      <div className="flex flex-col items-center mt-8">
        <span className="font-halvar font-bold text-brand text-[48px] leading-none underline decoration-2 underline-offset-4">
          +{points}
        </span>
        <span className="text-brand text-[13px] font-semibold mt-1">к индексу</span>
      </div>

      <div className="mt-6 bg-white rounded-2xl p-5">
        <p className={`flex items-center gap-2 font-bold text-[13px] mb-3 ${tierColorClass}`}>
          <img src={isBest ? bestChoiceIcon : dangerIcon} alt="" className="w-4 h-4" />
          {tierLabel}
        </p>
        <p className="text-[14px] leading-snug text-ink">{explanation}</p>
      </div>

      <div className="mt-3 bg-white border border-line rounded-2xl p-4">
        <p className="flex items-center gap-2 text-[12px] font-bold text-ink mb-1">
          <img src={safetyIcon} alt="" className="w-4 h-4" /> БЕЗОПАСНАЯ МОДЕЛЬ ПОВЕДЕНИЯ
        </p>
        <p className="text-[14px] text-ink">
          {correctOptionId} | {correctLabel}
        </p>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onContinue}
        className="w-full bg-dark text-white text-[15px] font-bold py-4 mt-6"
      >
        ПРОДОЛЖИТЬ
      </button>

      <Footer />
    </PhoneScreen>
  );
}
