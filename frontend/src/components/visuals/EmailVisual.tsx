interface EmailVisualProps {
  from: string;
  subject: string;
  buttonLabel: string;
}

export default function EmailVisual({ from, subject, buttonLabel }: EmailVisualProps) {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-4">
      <div className="relative w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand">
          <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
          !
        </span>
      </div>
      <div className="text-sm leading-snug">
        <p className="text-muted">От: {from}</p>
        <p className="text-ink mt-1">
          <span className="font-semibold">Тема:</span> {subject}
        </p>
      </div>
      <button
        type="button"
        className="w-full rounded-xl bg-brand text-white text-xs font-semibold py-2.5"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
