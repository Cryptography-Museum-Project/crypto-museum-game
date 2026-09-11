import { useState } from 'react';
import PhoneScreen from '../components/PhoneScreen';
import GameMasthead from '../components/GameMasthead';
import Footer from '../components/Footer';
import homeIcon from '../assets/house-icon.svg';
import replayIcon from '../assets/replay-icon.svg';
import bastionLogo from '../assets/bastion-logo.svg';
import { TICKET_URL } from '../constants';
import { getTier } from '../data/tiers';

interface ResultScreenProps {
  score: number;
  onHome?: () => void;
  onReplay?: () => void;
  onOpenMemo?: () => void;
}

const PROMO_CODE = '59FG-SDFG-DGK9';
const MAX_INDEX = 100;

// Делает слово "памятку/памятка/Памятка" внутри текста кликабельной ссылкой
// на экран MemoScreen, не трогая остальной текст.
function renderWithMemoLink(text: string, onOpenMemo?: () => void) {
  const match = text.match(/памятк[а-я]*/i);
  if (!match) return text;
  const word = match[0];
  const index = text.indexOf(word);
  return (
    <>
      {text.slice(0, index)}
      <button type="button" onClick={onOpenMemo} className="text-brand underline font-semibold">
        {word}
      </button>
      {text.slice(index + word.length)}
    </>
  );
}

// Здесь, в отличие от TopBar на других экранах, шкала не сегментирована —
// это одна сплошная полоса, залитая на % от итогового балла (0-100),
// а не отсчёт "сценарий N из 10".
function ScoreBar({ score, onHome }: { score: number; onHome?: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 xl:justify-end">
        <button type="button" onClick={onHome} aria-label="На главную" className="xl:hidden">
          <img src={homeIcon} alt="" className="w-5 h-5" />
        </button>
        <span className="font-halvar font-bold text-xs text-muted tabular-nums">
          {score} / {MAX_INDEX}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#D3D3DB] overflow-hidden">
        <div
          className="h-full bg-brand rounded-full"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultScreen({ score, onHome, onReplay, onOpenMemo }: ResultScreenProps) {
  const [copied, setCopied] = useState(false);
  const tier = getTier(score);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard может быть недоступен — просто игнорируем
    }
  };

  return (
    <PhoneScreen>
      <GameMasthead onHome={onHome} />
      <ScoreBar score={score} onHome={onHome} />

      <div className="flex flex-col flex-1 xl:grid xl:grid-cols-[1fr_220px] xl:gap-x-16 xl:items-start xl:mt-6">
        <div className="flex flex-col items-center mt-8 xl:items-end xl:mt-0 xl:col-start-2 xl:row-start-1">
          <span className="font-halvar font-bold text-brand text-[56px] xl:text-[72px] leading-none underline decoration-2 underline-offset-4">
            {score}
          </span>
          <span className="text-brand text-[13px] font-semibold mt-1">твой индекс</span>
          <span className="text-ink text-[13px] mt-1">
            уровень: <span className="font-bold">{tier.level}</span>
          </span>
        </div>

        <div className="mt-6 space-y-3 xl:space-y-6 text-[14px] xl:text-[17px] leading-snug text-ink xl:mt-0 xl:col-start-1 xl:row-start-1">
          {tier.title && <p className="font-bold">{tier.title}</p>}
          <p>{renderWithMemoLink(tier.body, onOpenMemo)}</p>
          <p>{tier.cta}</p>

          <div className="flex items-center justify-center gap-2 xl:justify-start">
            <img src={bastionLogo} alt="Бастион" className="h-5" />
          </div>
        </div>

        <div className="flex-1 xl:hidden" />

        {/* Кнопка и промокод — на десктопе в одну строку; на мобильном
            промокод остаётся в белой карточке, как раньше */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:gap-6 xl:col-span-2 xl:row-start-3 xl:mt-16">
          <a
            href={TICKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full rounded-[5px] bg-dark text-white text-[15px] font-bold py-4 mt-4 xl:w-auto xl:mt-0 xl:px-12"
          >
            КУПИТЬ БИЛЕТ
          </a>

          <div className="mt-4 bg-white rounded-[5px] p-4 flex items-center justify-between gap-3 xl:mt-0 xl:bg-transparent xl:p-0 xl:gap-2">
            <div>
              <p className="text-[11px] xl:text-[15px] text-ink leading-snug">
                Для получения скидки используйте промокод:
              </p>
              <p className="text-[14px] xl:text-[15px] font-bold text-ink tracking-wide">
                {PROMO_CODE}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 w-8 h-8 rounded-[5px] border border-line xl:border-0 flex items-center justify-center text-brand text-xs"
              aria-label="Скопировать промокод"
            >
              {copied ? '✓' : '⧉'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onReplay}
          className="hidden xl:flex items-center gap-1.5 text-ink text-[18px] mt-4 xl:mt-6 xl:col-start-1 xl:row-start-4"
        >
          пройти ещё раз
          <img src={replayIcon} alt="" className="w-4 h-4" />
        </button>

        <Footer />
      </div>
    </PhoneScreen>
  );
}