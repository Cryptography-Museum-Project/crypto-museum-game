// Один вариант ответа в сценарии
export interface ScenarioOption {
  id: string;      // короткий id, напр. "01"
  label: string;   // текст, который видит пользователь
}

// Какую "карточку-визуал" показывать в середине экрана.
// Каждому типу соответствует свой компонент в src/components/visuals/
export type VisualType =
  | 'notification'
  | 'permissions'
  | 'wifi'
  | 'call'
  | 'email'
  | 'payment'
  | 'photoPermission';

export interface Scenario {
  id: number;             // порядковый номер сценария, 1..10
  code: string;           // короткий код-название, напр. "СМАРТФОН"
  description: string;    // текст ситуации под заголовком
  visual: VisualType;     // какой компонент-визуал рендерить
  optionsHeading: string; // заголовок над списком вариантов, напр. "Что будете делать?"
  options: ScenarioOption[];
}
