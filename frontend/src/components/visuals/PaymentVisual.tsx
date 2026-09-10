interface PaymentVisualProps {
  status: string;
  message: string;
  buttonLabel: string;
  fakeUrl: string;
}

export default function PaymentVisual({
  status,
  message,
  buttonLabel,
  fakeUrl,
}: PaymentVisualProps) {
  return (
    <div className="bg-white rounded-[5px] p-6 flex flex-col items-center text-center gap-3">
      <p className="text-sm text-ink">{status}</p>
      <p className="text-[15px] font-bold text-ink leading-snug">{message}</p>
      <button
        type="button"
        className="w-full rounded-[5px] bg-brand text-white text-xs font-semibold py-2.5"
      >
        {buttonLabel}
      </button>
      <p className="text-[11px] text-muted">{fakeUrl}</p>
    </div>
  );
}
