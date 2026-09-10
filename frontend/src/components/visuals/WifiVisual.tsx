function WifiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand shrink-0">
      <path
        d="M2 8.5a15 15 0 0120 0M5.5 12a10 10 0 0113 0M9 15.5a5 5 0 016 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function WifiVisual({ networkName }: { networkName: string }) {
  return (
    <div className="bg-white rounded-[5px] px-4 py-4 flex items-center justify-between gap-3">
      <WifiIcon />
      <span className="text-[15px] font-semibold text-ink tracking-wide">{networkName}</span>
      <WifiIcon />
    </div>
  );
}
