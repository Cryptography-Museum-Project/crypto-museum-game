import type { ReactNode } from 'react';

interface PhoneScreenProps {
  children: ReactNode;
}

export default function PhoneScreen({ children }: PhoneScreenProps) {
  return (
    <div className="min-h-screen w-full flex justify-center bg-[#C9C9D2] py-6">
      <div className="relative overflow-hidden w-[360px] min-h-[740px] bg-canvas flex flex-col px-5 pt-7 pb-8">
        {children}
      </div>
    </div>
  );
}