# Frontend — «Маршрут цифрового дня»

Стек: React + TypeScript + Vite + Tailwind CSS (v4).

## Запуск локально

```bash или powershell
cd frontend
npm install
npm run dev
```

Откроется адрес `http://localhost:5173`.

## Структура

```
src/
  data/scenarios.ts        — тексты сценариев 1-7 (отдельно от UI)
  types.ts                 — типы данных сценария
  components/
    PhoneScreen.tsx         — обёртка экрана, ширина 360px
    ProgressBar.tsx         — полоска прогресса 10 сегментов
    OptionsList.tsx         — список вариантов ответа
    visuals/                — карточки-визуалы под каждый тип ситуации
  screens/
    LandingScreen.tsx        — стартовый экран
    ScenarioScreen.tsx       — общий шаблон экрана сценария
  App.tsx                    — черновой переключатель экранов (без роутинга)
```

## Что дальше

- Сценарии 8-10 добавить в `data/scenarios.ts`, когда их пришлёт кибербез.
- Финальный экран с индексом — отдельный компонент `screens/ResultScreen.tsx` (ещё не сделан).
- Шрифт Halvar Breitschrift сейчас заменён на Manrope (см. комментарий в `src/index.css`) — подключить, когда решится вопрос с лицензией.
- Когда бэкенд будет готов, `data/scenarios.ts` заменится на запрос к `GET /api/scenarios`.
