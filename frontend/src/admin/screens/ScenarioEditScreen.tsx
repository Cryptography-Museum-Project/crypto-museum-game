import { useEffect, useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import {
  getStoredToken,
  fetchAdminScenario,
  updateScenario,
  type AdminScenario,
  type AdminOption,
} from '../api';
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  TEXT_LINK,
  FIELD,
  CHOICE_INPUT,
} from '../../styles/interactive';

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

const POINT_OPTIONS: AdminOption['points'][] = [0, 5, 10];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function ScenarioEditScreen({ scenarioId, onBack }: ScenarioEditScreenProps) {
  const token = getStoredToken();
  const [original, setOriginal] = useState<AdminScenario | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<AdminOption[]>([]);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    if (!token) return;
    fetchAdminScenario(token, scenarioId)
      .then((scenario) => {
        setOriginal(scenario);
        setCode(scenario.code);
        setDescription(scenario.description);
        setOptions(scenario.options);
      })
      .catch(() => setLoadError(true));
  }, [token, scenarioId]);

  if (loadError) {
    return (
      <PhoneScreen>
        <p className="text-ink">Не удалось загрузить сценарий.</p>
      </PhoneScreen>
    );
  }

  if (!original) {
    return (
      <PhoneScreen>
        <p className="text-ink">Загрузка…</p>
      </PhoneScreen>
    );
  }

  const updateOption = (id: number, patch: Partial<AdminOption>) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    setSaveState('idle');
  };

  const handleSave = async () => {
    if (!token) return;
    setSaveState('saving');
    try {
      await updateScenario(token, scenarioId, {
        code,
        category: original.category,
        description,
        visual: original.visual,
        optionsHeading: original.optionsHeading,
        isActive: original.isActive,
        options: options.map((o, index) => ({
          id: o.id,
          code: o.code,
          label: o.label,
          points: o.points,
          explanation: o.explanation,
          orderIndex: index,
        })),
      });
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  return (
    <PhoneScreen>
      <button
        type="button"
        onClick={onBack}
        className={`flex items-center gap-1.5 text-ink mb-4 rounded-sm ${TEXT_LINK}`}
      >
        {' '}
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
              setSaveState('idle');
            }}
            placeholder="название"
            className={`flex-1 min-w-0 bg-white px-3 py-3 text-[14px] text-ink ${FIELD}`}
          />
          <button
            type="button"
            className={`shrink-0 flex items-center gap-1.5 bg-white px-4 py-3 text-[13px] text-ink ${SECONDARY_BUTTON}`}
          >
            фото
            <span className="text-brand text-base leading-none">+</span>
          </button>
        </div>

        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setSaveState('idle');
          }}
          placeholder="напишите вопрос"
          rows={3}
          className={`w-full bg-white px-3 py-3 text-[14px] text-ink mb-4 resize-none ${FIELD}`}
        />

        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id}>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-ink shrink-0">{option.code}</span>
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
                        className={`w-4 h-4 accent-brand ${CHOICE_INPUT}`}
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
                className={`w-full bg-white px-3 py-3 text-[14px] text-ink mb-2 ${FIELD}`}
              />
              <textarea
                value={option.explanation}
                onChange={(e) => updateOption(option.id, { explanation: e.target.value })}
                placeholder="комментарий"
                rows={2}
                className={`w-full bg-white px-3 py-3 text-[13px] text-ink resize-none ${FIELD}`}
              />
            </div>
          ))}
        </div>

        {saveState === 'error' && (
          <p className="text-[13px] text-red-600 mt-4">
            Не удалось сохранить изменения. Попробуйте ещё раз.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className={`w-full rounded-[5px] text-white text-[15px] font-bold py-4 mt-6 mb-4 disabled:opacity-60 ${PRIMARY_BUTTON}`}
        >
          {saveState === 'saving' ? 'Сохранение…' : saveState === 'saved' ? 'Сохранено ✓' : 'Сохранить'}
        </button>
      </div>
    </PhoneScreen>
  );
}
