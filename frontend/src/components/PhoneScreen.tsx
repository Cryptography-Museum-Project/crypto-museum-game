import type { ReactNode } from 'react';
import museumLogo from '../assets/museum-logo.svg';
import { EXHIBITION_URL } from '../constants';

interface PhoneScreenProps {
  children: ReactNode;
}

export default function PhoneScreen({ children }: PhoneScreenProps) {
  return (
    <div className="min-h-dvh w-full flex justify-center bg-canvas px-[clamp(0px,calc(50.06vw_-_320.4px),255.3px)] tablet:px-0">
      <div className="w-full min-h-dvh flex flex-col tablet:min-h-screen tablet:grid tablet:grid-cols-[clamp(24px,22.2vw,320px)_1fr_clamp(24px,22.2vw,320px)]">
        <div className="hidden tablet:block tablet:pl-10 tablet:pt-12">
          <a href={EXHIBITION_URL} target="_blank" rel="noopener noreferrer">
            <img src={museumLogo} alt="Музей криптографии" className="h-10" />
          </a>
        </div>
        <div className="relative overflow-hidden bg-canvas flex-1 flex flex-col px-5 pt-7 pb-8 tablet:px-0 tablet:pt-12 tablet:pb-16">
          {children}
        </div>
        {/* Правая крайняя колонка — по макету пустая, ничего сюда не добавляем */}
      </div>
    </div>
  );
}