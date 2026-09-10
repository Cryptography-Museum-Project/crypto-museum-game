export default function PhotoPermissionVisual() {
  return (
    <div className="bg-white rounded-[5px] p-6 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-[5px] bg-brand/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="9" cy="10" r="1.3" fill="currentColor" />
          <path
            d="M4 16l5-4.5 3.5 3L16 11l4 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-[15px] leading-snug text-ink">
        Разрешить доступ
        <br />
        ко всем фотографиям?
      </p>
      <div className="flex gap-3 w-full">
        <button
          type="button"
          className="flex-1 rounded-[5px] bg-brand text-white text-xs font-bold py-3"
        >
          РАЗРЕШИТЬ
        </button>
        <button
          type="button"
          className="flex-1 rounded-[5px] border border-line text-muted text-xs font-bold py-3"
        >
          ЗАПРЕТИТЬ
        </button>
      </div>
    </div>
  );
}
