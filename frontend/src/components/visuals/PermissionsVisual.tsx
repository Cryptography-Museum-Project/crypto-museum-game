function Icon({ path }: { path: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-brand">
      <path d={path} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  pin: 'M12 21s-7-6.1-7-11.5A7 7 0 0119 9.5C19 14.9 12 21 12 21z M12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  person: 'M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9z M4 21c1.2-4 4.2-6 8-6s6.8 2 8 6',
  photo: 'M4 5h16v14H4zM4 15l4.5-4.5L12 14l3-3 5 5M9 9.5a1 1 0 100-2 1 1 0 000 2z',
  mic: 'M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z M6 11a6 6 0 0012 0 M12 19v2',
};

export default function PermissionsVisual() {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-2xl">
        🚕
      </div>
      <p className="text-[15px] leading-snug text-ink">
        Разрешить доступ к геолокации,
        <br />
        контактам фото и микрофону?
      </p>
      <div className="flex gap-5">
        <Icon path={ICONS.pin} />
        <Icon path={ICONS.person} />
        <Icon path={ICONS.photo} />
        <Icon path={ICONS.mic} />
      </div>
    </div>
  );
}
