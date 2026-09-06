export default function NotificationVisual() {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
      <div className="w-full max-w-[220px] rounded-[28px] bg-[#0E0E16] p-5 flex flex-col items-center text-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-brand/20 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6.5L12 13L21 6.5"
              stroke="#0B4AF9"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#0B4AF9" strokeWidth="1.8" />
          </svg>
        </div>
        <p className="text-white text-sm leading-snug">Ваш аккаунт требует подтверждения</p>
        <button
          type="button"
          className="w-full rounded-xl bg-[#1D1D29] text-white text-xs font-semibold py-2.5"
        >
          ПОДТВЕРДИТЬ АККАУНТ
        </button>
        <p className="text-[#8A8A96] text-xs leading-snug">
          Нажмите <span className="text-white font-medium">здесь</span>, чтобы защитить свой
          профиль.
        </p>
      </div>
    </div>
  );
}
