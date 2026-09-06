import homeIcon from '../assets/house-icon.svg';
import manImage from '../assets/man.png';
import Footer from '../components/Footer';
import PhoneScreen from '../components/PhoneScreen';
import { EXHIBITION_URL, TICKET_URL } from '../constants';

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
  return (
    <PhoneScreen>
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={onHome} aria-label="На главную">
          <img src={homeIcon} alt="" className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-ink text-[13px] font-semibold"
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

      <div className="flex-1 overflow-y-auto -mx-5 px-5">
        <h1 className="font-halvar font-light text-brand text-[34px] uppercase leading-none">
          Памятка
        </h1>

        <h2 className="font-bold text-[17px] text-ink mt-4 leading-snug">
          Цифровая безопасность
          <br />
          на каждый день
        </h2>

        <div className="mt-5 space-y-5">
          {CATEGORIES.map((category) => (
            <div key={category.title}>
              <h3 className="text-brand font-bold text-[15px] mb-1.5">{category.title}</h3>
              <ul className="space-y-1">
                {category.items.map((item) => (
                  <li key={item} className="text-ink text-[13px] leading-snug flex gap-1.5">
                    <span className="text-muted shrink-0">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="font-bold text-[15px] text-ink mt-6 leading-snug">
          Хотите узнать больше и на практике потренироваться распознавать угрозы?
        </p>
        <p className="text-[13px] text-ink leading-snug mt-3">
          Приходите на выставку Музея криптографии{' '}
          <a
            href={EXHIBITION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline"
          >
            «Ключ к доверию. Безопасность в эпоху высоких технологий»
          </a>{' '}
          — организована при экспертной поддержке компании «Бастион».
        </p>

        <div className="flex items-center justify-center my-6">
          <img src={manImage} alt="" className="w-40 h-auto" />
        </div>

        <a
          href={TICKET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center w-full bg-dark text-white text-[15px] font-bold py-4"
        >
          КУПИТЬ БИЛЕТ
        </a>

        <Footer />
      </div>
    </PhoneScreen>
  );
}
