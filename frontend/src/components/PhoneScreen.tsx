import type { ReactNode } from 'react';
import museumLogo from '../assets/museum-logo.svg';
import { EXHIBITION_URL } from '../constants';

interface PhoneScreenProps {
  children: ReactNode;
}

export default function PhoneScreen({ children }: PhoneScreenProps) {
  return (
    <div className="min-h-dvh w-full flex justify-center bg-[#C9C9D2] xl:bg-canvas">
      <div className="w-full max-w-90 min-h-dvh flex flex-col xl:max-w-none xl:min-h-screen xl:grid xl:grid-cols-[320px_1fr_320px]">
        <div className="hidden xl:block xl:pl-10 xl:pt-12">
          <a href={EXHIBITION_URL} target="_blank" rel="noopener noreferrer">
            <img src={museumLogo} alt="Музей криптографии" className="h-10" />
          </a>
        </div>
        <div className="relative overflow-hidden bg-canvas flex-1 flex flex-col px-5 pt-7 pb-8 xl:px-0 xl:pt-12 xl:pb-16">
          {children}
        </div>
        {/* Правая крайняя колонка — по макету пустая, ничего сюда не добавляем */}
      </div>
    </div>
  );
}
