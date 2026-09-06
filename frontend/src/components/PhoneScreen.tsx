import type { ReactNode } from 'react';

interface PhoneScreenProps {
  children: ReactNode;
}

export default function PhoneScreen({ children }: PhoneScreenProps) {
  return (
    <div className="min-h-dvh w-full flex justify-center bg-[#C9C9D2]">
      <div className="relative overflow-hidden w-full max-w-90 min-h-dvh bg-canvas flex flex-col px-5 pt-7 pb-8">
        {children}
      </div>
    </div>
  );
}
