import { useState } from 'react';
import PhoneScreen from '../components/PhoneScreen';
import GameMasthead from '../components/GameMasthead';
import RouteProgress from '../components/RouteProgress';
import Footer from '../components/Footer';
import homeIcon from '../assets/house-icon.svg';
import replayIcon from '../assets/replay-icon.svg';
import bastionLogo from '../assets/bastion-logo.svg';
import { TICKET_URL, EXHIBITION_URL } from '../constants';
import type { FinishResponse } from '../api/game';
import type { VisualType } from '../types';
import { PRIMARY_BUTTON, ICON_BUTTON, TEXT_LINK, FOCUS_RING } from '../styles/interactive';

type ResultTier = FinishResponse['tier'];

interface ResultScreenProps {
  score: number;
  tier: ResultTier;
  // визуалы сценариев по порядку — на десктопе показываем всю цепочку
  // маршрута цветной, включая щит: визуальное завершение пути
  route: VisualType[];
  onHome?: () => void;
  onReplay?: () => void;
  onOpenMemo?: () => void;
}

const PROMO_CODE = '59FG-SDFG-DGK9';
const MAX_INDEX = 100;

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="5.5" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="18.5" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M8.2 10.7L15.8 6.8M8.2 13.3L15.8 17.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function buildShareText(score: number, tierLevel: string): string {
  return (
    `Мой индекс цифровой безопасности: ${score}/${MAX_INDEX} (уровень: ${tierLevel}). ` +
    `Пройди игру и проверь свой на выставке «Ключ к доверию. Безопасность в эпоху высоких технологий» ` +
    `в Музее криптографии!`
  );
}

function renderWithMemoLink(text: string, onOpenMemo?: () => void) {
  const match = text.match(/памятк[а-я]*/i);
  if (!match) return text;
  const word = match[0];
  const index = text.indexOf(word);
  return (
    <>
      {text.slice(0, index)}
      <button
        type="button"
        onClick={onOpenMemo}
        className={`text-brand underline font-semibold rounded-sm ${TEXT_LINK}`}
      >
        {word}
      </button>
      {text.slice(index + word.length)}
    </>
  );
}

function ScoreBar({
  score,
  onHome,
  onShare,
  shared,
}: {
  score: number;
  onHome?: () => void;
  onShare: () => void;
  shared: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 xl:justify-end xl:gap-3">
        <button
          type="button"
          onClick={onHome}
          aria-label="На главную"
          className={`p-1.5 -m-1.5 xl:hidden ${ICON_BUTTON}`}
        >
          <img src={homeIcon} alt="" className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-halvar font-bold text-xs text-muted tabular-nums">
            {score} / {MAX_INDEX}
          </span>
          <button
            type="button"
            onClick={onShare}
            aria-label="Поделиться результатом"
            className={`flex items-center gap-1 p-1.5 -m-1.5 text-muted hover:text-brand ${ICON_BUTTON}`}
          >
            {shared ? (
              <span className="text-[11px] font-semibold text-brand">скопировано ✓</span>
            ) : (
              <ShareIcon />
            )}
          </button>
        </div>
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

export default function ResultScreen({
  score,
  tier,
  route,
  onHome,
  onReplay,
  onOpenMemo,
}: ResultScreenProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard может быть недоступен — просто игнорируем
    }
  };


  const handleShare = async () => {
    const shareText = buildShareText(score, tier.level);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ключ к доверию — мой результат',
          text: shareText,
          url: EXHIBITION_URL,
        });
      } catch {
        // Пользователь закрыл системное меню или шаринг не удался —
        // ничего дополнительно не делаем, это не ошибка.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${EXHIBITION_URL}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // clipboard может быть недоступен — просто игнорируем
    }
  };

  return (
    <PhoneScreen>
      <GameMasthead onHome={onHome} />
      {/* Мобильный: полоса индекса. Десктоп: пройденный маршрут целиком —
          счёт уже крупно справа, «поделиться» есть внизу */}
      <div className="xl:hidden">
        <ScoreBar score={score} onHome={onHome} onShare={handleShare} shared={shared} />
      </div>
      <RouteProgress route={route} completed={route.length} className="hidden xl:flex" />

      <div className="flex flex-col flex-1 xl:grid xl:grid-cols-[1fr_220px] xl:gap-x-16 xl:items-start xl:mt-12">
        <div className="flex flex-col items-center mt-8 xl:items-end xl:mt-0 xl:col-start-2 xl:row-start-1">
          <span className="font-halvar font-bold text-brand text-[56px] xl:text-[72px] leading-none underline decoration-2 underline-offset-4">
            {score}
          </span>
          <span className="text-brand text-[13px] font-semibold mt-1">твой индекс</span>
          <span className="text-ink text-[17px] mt-1">
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
            className={`block text-center w-full rounded-[5px] text-white text-[15px] font-bold py-4 mt-4 xl:w-auto xl:mt-0 xl:px-12 ${PRIMARY_BUTTON}`}
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
              className={`shrink-0 w-8 h-8 rounded-[5px] border border-line xl:border-0 flex items-center justify-center text-brand text-xs hover:bg-canvas hover:border-brand active:brightness-95 transition-colors ${FOCUS_RING}`}
              aria-label="Скопировать промокод"
            >
              {copied ? '✓' : '⧉'}
            </button>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-6 mt-4 xl:mt-6 xl:col-start-1 xl:row-start-4">
          <button
            type="button"
            onClick={onReplay}
            className={`flex items-center gap-1.5 text-ink text-[18px] rounded-sm ${TEXT_LINK}`}
          >
            пройти ещё раз
            <img src={replayIcon} alt="" className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`flex items-center gap-1.5 text-ink text-[18px] rounded-sm ${TEXT_LINK}`}
          >
            {shared ? 'скопировано ✓' : 'поделиться результатом'}
            <ShareIcon />
          </button>
        </div>

        <Footer />
      </div>
    </PhoneScreen>
  );
}
