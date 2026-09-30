// Единый набор классов для focus/hover/active состояний интерактивных
// элементов проекта. Собрано в одном месте, чтобы у всех кнопок, ссылок
// и полей ввода в игре и в админке состояния были одинаковыми.
// Цвета — из брендбука (--color-brand/canvas/ink).

// Фокус с клавиатуры — везде одно и то же брендовое синее кольцо.
// :focus-visible, а не :focus — кольцо показывается только при навигации
// Tab'ом, а не при обычном клике мышью (так делает большинство
// современных дизайн-систем, чтобы не "мигать" рамкой на каждый клик).
export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

// Тёмная основная кнопка (bg-dark): "Пройти", "Продолжить", "Купить билет",
// "Войти", "Сохранить". На hover заливка становится брендовой синей — явный
// сигнал "нажми меня"; на active чуть темнее (brightness) и с лёгким сжатием
// для тактильной отдачи от нажатия.
export const PRIMARY_BUTTON = `bg-dark hover:bg-brand active:brightness-90 active:scale-[0.98] transition-[background-color,transform,filter] duration-150 ${FOCUS_RING}`;

// Белая кнопка с рамкой: "добавить +", "фото +", фильтр периода в админке.
// На hover рамка становится брендовой, на active — лёгкая заливка canvas.
export const SECONDARY_BUTTON = `bg-white border border-line hover:border-brand active:bg-canvas transition-colors ${FOCUS_RING}`;

// Карточка-вариант ответа (OptionsList) — тот же принцип, что у
// SECONDARY_BUTTON, но с чуть более заметной подсветкой фона на hover,
// т.к. это самый частый клик во всей игре.
export const OPTION_CARD = `border border-line hover:border-brand hover:bg-brand/5 active:bg-canvas transition-colors ${FOCUS_RING}`;

// Иконка-кнопка без подписи (домой, заново, глазок пароля, копировать
// промокод, стрелка назад). Сами иконки — это в основном <img src=".svg">,
// перекрасить их через CSS нельзя, поэтому вместо смены цвета добавляем
// круглую подложку: проявляется на hover, темнеет на active. rounded-full —
// чтобы и кольцо фокуса было круглым, а не квадратным вокруг иконки.
export const ICON_BUTTON = `rounded-full hover:bg-ink/5 active:bg-ink/10 transition-colors ${FOCUS_RING}`;

// Текстовая ссылка / кликабельный текст: "памятка", "К результату",
// "пройти ещё раз", ссылка на выставку, лого в футере, заголовок-кнопка
// GameMasthead. Приглушаем на hover и чуть сильнее на active — работает
// вне зависимости от того, каким цветом уже покрашен сам текст.
export const TEXT_LINK = `hover:opacity-70 active:opacity-60 transition-opacity ${FOCUS_RING}`;

// Поля ввода (input/textarea): рамка светлеет на hover, становится
// брендовой на фокусе.
export const FIELD =
  'border border-line hover:border-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand transition-colors';

export const CHOICE_INPUT =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1';