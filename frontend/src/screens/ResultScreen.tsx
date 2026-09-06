import { useState } from 'react';
import PhoneScreen from '../components/PhoneScreen';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import bastionLogo from '../assets/bastion-logo.svg';
import { TICKET_URL } from '../constants';
import { getTier } from '../data/tiers';

interface ResultScreenProps {
  score: number;
  total: number;
  onHome?: () => void;
  onReplay?: () => void;
  onOpenMemo?: () => void;
}

const PROMO_CODE = '59FG-SDFG-DGK9';

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

export default function ResultScreen({
  score,
  total,
  onHome,
  onReplay,
  onOpenMemo,
}: ResultScreenProps) {
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
      <TopBar current={total} total={total} onHome={onHome} showReplay onReplay={onReplay} />

      <div className="flex flex-col items-center mt-8">
        <span className="font-halvar font-bold text-brand text-[56px] leading-none underline decoration-2 underline-offset-4">
          {score}
        </span>
        <span className="text-brand text-[13px] font-semibold mt-1">твой индекс</span>
        <span className="text-ink text-[13px] mt-1">
          уровень: <span className="font-bold">{tier.level}</span>
        </span>
      </div>

      <div className="mt-6 space-y-3 text-[14px] leading-snug text-ink">
        {tier.title && <p className="font-bold">{tier.title}</p>}
        <p>{renderWithMemoLink(tier.body, onOpenMemo)}</p>
        <p>{tier.cta}</p>
      </div>

      <div className="flex-1" />

      <div className="flex items-center justify-center gap-2 mt-6">
        <img src={bastionLogo} alt="" className="h-5" />
      </div>

      <div className="mt-4 bg-white rounded-2xl p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted leading-snug">
            Для получения скидки используйте промокод:
          </p>
          <p className="text-[14px] font-bold text-ink tracking-wide">{PROMO_CODE}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 w-8 h-8 rounded-lg border border-line flex items-center justify-center text-brand text-xs"
          aria-label="Скопировать промокод"
        >
          {copied ? '✓' : '⧉'}
        </button>
      </div>

      <a
        href={TICKET_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center w-full bg-dark text-white text-[15px] font-bold py-4 mt-4"
      >
        КУПИТЬ БИЛЕТ
      </a>

      <Footer />
    </PhoneScreen>
  );
}
