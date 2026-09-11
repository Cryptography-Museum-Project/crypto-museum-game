import { useState } from 'react';
import homeIcon from '../assets/house-icon.svg';
import replayIcon from '../assets/replay-icon.svg';
import manImage from '../assets/man.png';
import desktopFigure from '../assets/desktop-figure.png';
import bastionLogo from '../assets/bastion-logo.svg';
import Footer from '../components/Footer';
import PhoneScreen from '../components/PhoneScreen';
import { EXHIBITION_URL, TICKET_URL } from '../constants';
import { PRIMARY_BUTTON, ICON_BUTTON, TEXT_LINK, FOCUS_RING } from '../styles/interactive';

const PROMO_CODE = '59FG-SDFG-DGK9';

interface MemoScreenProps {
  onHome?: () => void;
  onBack?: () => void;
}

interface Category {
  title: string;
  items: string[];
}

const CATEGORIES: Category[] = [
  {
    title: 'Пароли',
    items: [
      'Используйте разные пароли для разных сервисов — если один утечёт, остальные останутся в безопасности.',
      'Пароль длиннее 12 символов надёжнее, чем сложный, но короткий.',
      'Включите двухфакторную аутентификацию (2FA) везде, где это возможно — это как второй замок на двери.',
      'Не храните пароли в заметках телефона или на бумажке рядом с компьютером.',
    ],
  },
  {
    title: 'Фишинг',
    items: [
      'Проверяйте адрес отправителя письма, а не только имя — мошенники маскируются под банки и знакомых.',
      'Не переходите по ссылкам из подозрительных сообщений — лучше зайти на сайт напрямую, через поиск.',
      'Настоящий банк или служба поддержки никогда не попросит пароль или код из SMS.',
      'Если сообщение создаёт панику и торопит ("срочно!", "аккаунт заблокирован") — это признак мошенничества.',
    ],
  },
  {
    title: 'Wi-Fi',
    items: [
      'Не совершайте платежи и не вводите пароли через публичный Wi-Fi в кафе или транспорте.',
      'Отключайте автоподключение к открытым сетям в настройках телефона.',
      'Для важных операций используйте мобильный интернет или VPN, а не открытую сеть.',
      'Проверяйте название сети у персонала — мошенники создают поддельные точки с похожими именами.',
    ],
  },
  {
    title: 'Приватность',
    items: [
      'Разрешения приложениям (доступ к контактам, камере, геолокации) давайте только те, что реально нужны для работы приложения.',
      'Периодически проверяйте настройки приватности в соцсетях — кто видит ваши посты и данные.',
      'Не выкладывайте в открытый доступ билеты, документы, геолокацию в реальном времени.',
      'Читайте, какие данные собирает приложение, перед тем как его установить.',
    ],
  },
  {
    title: 'Устройства',
    items: [
      'Обновляйте операционную систему и приложения — обновления часто закрывают уязвимости.',
      'Ставьте пароль/биометрию на блокировку экрана смартфона и компьютера.',
      'Не подключайте неизвестные флешки и не заряжайте телефон через чужие подозрительные USB-порты.',
      'Устанавливайте приложения только из официальных магазинов (App Store, Google Play).',
    ],
  },
  {
    title: 'Финансы',
    items: [
      'Подключите SMS- или push-уведомления обо всех операциях по карте.',
      'Никому не сообщайте CVC-код с обратной стороны карты и коды из SMS — даже "сотруднику банка".',
      'Используйте отдельную карту с небольшим лимитом для онлайн-покупок.',
      'Проверяйте адрес сайта перед оплатой: должен быть значок замка и правильное написание домена.',
    ],
  },
];

export default function MemoScreen({ onHome, onBack }: MemoScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard может быть недоступен — просто игнорируем
    }
  };

  return (
    <PhoneScreen>
      <div className="flex items-center justify-between mb-4 xl:hidden">
        <button
          type="button"
          onClick={onHome}
          aria-label="На главную"
          className={`p-1.5 -m-1.5 ${ICON_BUTTON}`}
        >
          <img src={homeIcon} alt="" className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-1.5 text-ink text-[13px] font-semibold rounded-sm ${TEXT_LINK}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          К результату
        </button>
      </div>

      <div className="flex-1 overflow-y-auto -mx-5 px-5 xl:flex-none xl:overflow-visible xl:mx-0 xl:px-0 xl:max-w-3xl">
        <div className="hidden xl:flex xl:items-center xl:justify-between">
          <button type="button" onClick={onBack} className={`text-left rounded-sm ${TEXT_LINK}`}>
            <h1 className="font-halvar font-light text-brand text-[29px] uppercase leading-none">
              Памятка
            </h1>
          </button>
          <button
            type="button"
            onClick={onBack}
            className={`flex items-center gap-1.5 text-ink text-[13px] font-semibold rounded-sm ${TEXT_LINK}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            К результату
          </button>
        </div>
        <h1 className="font-halvar font-light text-brand text-[34px] uppercase leading-none xl:hidden">
          Памятка
        </h1>

        <h2 className="font-bold text-[17px] xl:text-[20px] text-ink mt-4 xl:mt-5 leading-snug">
          Цифровая безопасность
          <br />
          на каждый день
        </h2>

        <div className="mt-5 xl:mt-8 space-y-5 xl:space-y-8">
          {CATEGORIES.map((category) => (
            <div key={category.title}>
              <h3 className="text-brand font-bold text-[15px] xl:text-[19px] mb-1.5 xl:mb-2">
                {category.title}
              </h3>
              <ul className="space-y-1 xl:space-y-1.5">
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="text-ink text-[13px] xl:text-[16px] leading-snug flex gap-1.5"
                  >
                    <span className="text-muted shrink-0">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="font-bold text-[15px] xl:text-[19px] text-ink mt-6 xl:mt-10 leading-snug">
          Хотите узнать больше и на практике потренироваться распознавать угрозы?
        </p>
        <p className="text-[13px] xl:text-[16px] text-ink leading-snug mt-3 xl:mt-4">
          Приходите на выставку Музея криптографии{' '}
          <a
            href={EXHIBITION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-brand underline rounded-sm ${TEXT_LINK}`}
          >
            «Ключ к доверию. Безопасность в эпоху высоких технологий»
          </a>{' '}
          — организована при экспертной поддержке компании «Бастион».
        </p>

        <div className="flex items-center gap-2 mt-4">
          <img src={bastionLogo} alt="Бастион" className="h-5" />
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center xl:gap-6 mt-6 xl:mt-10">
          <a
            href={TICKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-center w-full rounded-[5px] text-white text-[15px] font-bold py-4 xl:w-auto xl:px-12 ${PRIMARY_BUTTON}`}
          >
            КУПИТЬ БИЛЕТ
          </a>

          <div className="mt-4 bg-white rounded-[5px] p-4 flex items-center justify-between gap-3 xl:mt-0 xl:bg-transparent xl:p-0 xl:gap-2">
            <div>
              <p className="text-[11px] xl:text-[15px] text-ink leading-snug">
                Для получения скидки используйте промокод:
              </p>
              <p className="text-[14px] xl:text-[15px] font-bold text-ink tracking-wide">
                {PROMO_CODE}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 w-8 h-8 rounded-[5px] border border-line xl:border-0 flex items-center justify-center text-brand text-xs hover:bg-canvas hover:border-brand active:brightness-95 transition-colors ${FOCUS_RING}`}
              aria-label="Скопировать промокод"
            >
              {copied ? '✓' : '⧉'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onHome}
          className={`hidden xl:flex items-center gap-1.5 text-ink text-[18px] mt-4 rounded-sm ${TEXT_LINK}`}
        >
          пройти ещё раз
          <img src={replayIcon} alt="" className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center my-6 xl:hidden">
          <img src={manImage} alt="" className="w-40 h-auto" />
        </div>
        <div className="hidden xl:flex xl:justify-end xl:-mt-16">
          <img src={desktopFigure} alt="" className="w-[450px] h-auto" />
        </div>

        <Footer />
      </div>
    </PhoneScreen>
  );
}
