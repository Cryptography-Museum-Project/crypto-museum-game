// Один вариант ответа в сценарии
export interface ScenarioOption {
  id: string; // короткий id, напр. "01"
  label: string; // текст, который видит пользователь на карточке выбора
  points: 0 | 5 | 10; // баллы к индексу: 10 = лучший вариант, 5 = риск, 0 = высокий риск
  explanation: string; // текст, который показывается на экране "Ответ" после выбора
}

// Какую "карточку-визуал" показывать в середине экрана сценария.
// Каждому типу соответствует свой компонент в src/components/visuals/
export type VisualType =
  | 'notification'
  | 'permissions'
  | 'wifi'
  | 'bankCall'
  | 'email'
  | 'scamCall'
  | 'payment'
  | 'smartHome'
  | 'password'
  | 'device'
  | 'purchase';

export interface Scenario {
  id: number; // порядковый номер сценария, 1..10
  code: string; // короткий код-название, напр. "СМАРТФОН"
  category: 'Пароли' | 'Фишинг' | 'Wi-Fi' | 'Приватность' | 'Устройства' | 'Финансы';
  description: string; // текст ситуации под заголовком
  visual: VisualType; // какой компонент-визуал рендерить
  optionsHeading?: string; // заголовок над списком вариантов
  options: ScenarioOption[];
}
