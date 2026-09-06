import { useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import circlesBg from '../../assets/circles.png';

interface LoginScreenProps {
  onLogin: () => void;
}

function EyeToggleIcon({ visible }: { visible: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="#9A9AA3"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="#9A9AA3" strokeWidth="1.6" />
      {!visible && <line x1="3" y1="21" x2="21" y2="3" stroke="#9A9AA3" strokeWidth="1.6" />}
    </svg>
  );
}

// Пока без реального бэкенда — форма ничего не проверяет, "Войти" просто
// пускает внутрь админки. Подключить настоящую авторизацию, когда будет API.
export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <PhoneScreen>
      <img
        src={circlesBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 -top-5 w-90 max-w-none opacity-60"
      />

      <div className="relative flex flex-col h-full justify-center">
        <p className="text-[13px] tracking-wide text-ink">КЛЮЧ К ДОВЕРИЮ</p>

        <h1 className="font-halvar font-light text-brand text-[34px] uppercase leading-[1.05] mt-4 underline decoration-2 underline-offset-4">
          Маршрут
          <br />
          цифрового дня
        </h1>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onLogin();
          }}
          className="mt-8 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder="почта или телефон"
            className="w-full bg-white rounded-none px-4 py-3.5 text-[15px] text-ink placeholder:text-muted outline-none border border-line"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="пароль"
              className="w-full bg-white rounded-none px-4 py-3.5 text-[15px] text-ink placeholder:text-muted outline-none border border-line pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Показать/скрыть пароль"
            >
              <EyeToggleIcon visible={showPassword} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-1 text-[13px]">
            <label className="flex items-center gap-2 text-ink">
              <input type="checkbox" className="w-4 h-4 accent-brand" />
              Запомнить меня
            </label>
            <button type="button" className="text-ink underline">
              Забыли пароль?
            </button>
          </div>

          <button
            type="submit"
            className="mt-3 w-full bg-dark text-white text-[15px] font-bold py-4 flex items-center justify-center gap-2"
          >
            ВОЙТИ
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3L11 8L6 13"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </PhoneScreen>
  );
}
