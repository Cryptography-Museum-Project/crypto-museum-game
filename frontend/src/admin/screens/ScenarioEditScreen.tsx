import { useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import { scenarios } from '../../data/scenarios';
import type { ScenarioOption } from '../../types';

interface ScenarioEditScreenProps {
  scenarioId: number;
  onBack: () => void;
}

function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const POINT_OPTIONS: ScenarioOption['points'][] = [0, 5, 10];

// ВАЖНО: правки здесь пока хранятся только в состоянии компонента и
// пропадают при обновлении страницы — реального сохранения на сервер
// ещё нет (нужен эндпоинт вроде PATCH /api/scenarios/:id). Кнопка
// "Сохранить" сейчас просто эмулирует успех, чтобы было видно, где
// подключать реальный запрос.
export default function ScenarioEditScreen({ scenarioId, onBack }: ScenarioEditScreenProps) {
  const original = scenarios.find((s) => s.id === scenarioId);
  const [code, setCode] = useState(original?.code ?? '');
  const [description, setDescription] = useState(original?.description ?? '');
  const [options, setOptions] = useState<ScenarioOption[]>(original?.options ?? []);
  const [saved, setSaved] = useState(false);

  if (!original) {
    return (
      <PhoneScreen>
        <p className="text-ink">Сценарий не найден.</p>
      </PhoneScreen>
    );
  }

  const updateOption = (id: string, patch: Partial<ScenarioOption>) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    setSaved(false);
  };

  return (
    <PhoneScreen>
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-ink mb-4">
        <BackArrow />
        <span className="text-[13px] font-semibold">Сценарии</span>
      </button>

      <div className="flex-1 overflow-y-auto -mx-5 px-5">
        <p className="font-halvar font-bold text-brand text-[22px] mb-3">{scenarioId}</p>

        <div className="flex gap-2 mb-3">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setSaved(false);
            }}
            placeholder="название"
            className="flex-1 min-w-0 bg-white border border-line px-3 py-3 text-[14px] text-ink outline-none"
          />
          <button
            type="button"
            className="shrink-0 flex items-center gap-1.5 bg-white border border-line px-4 py-3 text-[13px] text-ink"
          >
            фото
            <span className="text-brand text-base leading-none">+</span>
          </button>
        </div>

        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setSaved(false);
          }}
          placeholder="напишите вопрос"
          rows={3}
          className="w-full bg-white border border-line px-3 py-3 text-[14px] text-ink outline-none mb-4 resize-none"
        />

        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id}>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-ink shrink-0">{option.id}</span>
                <div className="flex items-center gap-3">
                  {POINT_OPTIONS.map((pointValue) => (
                    <label
                      key={pointValue}
                      className="flex items-center gap-1.5 text-[12px] text-ink"
                    >
                      <input
                        type="radio"
                        name={`points-${option.id}`}
                        checked={option.points === pointValue}
                        onChange={() => updateOption(option.id, { points: pointValue })}
                        className="w-4 h-4 accent-brand"
                      />
                      {pointValue === 0 ? '0' : `+${pointValue}`}
                    </label>
                  ))}
                </div>
              </div>

              <input
                value={option.label}
                onChange={(e) => updateOption(option.id, { label: e.target.value })}
                placeholder="ответ"
                className="w-full bg-white border border-line px-3 py-3 text-[14px] text-ink outline-none mb-2"
              />
              <textarea
                value={option.explanation}
                onChange={(e) => updateOption(option.id, { explanation: e.target.value })}
                placeholder="комментарий"
                rows={2}
                className="w-full bg-white border border-line px-3 py-3 text-[13px] text-ink outline-none resize-none"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSaved(true)}
          className="w-full rounded-[5px] bg-dark text-white text-[15px] font-bold py-4 mt-6 mb-4"
        >
          {saved ? 'Сохранено ✓' : 'Сохранить'}
        </button>
      </div>
    </PhoneScreen>
  );
}
