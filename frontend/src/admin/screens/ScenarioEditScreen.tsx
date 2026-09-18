import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import {
  getStoredToken,
  fetchAdminScenario,
  updateScenario,
  uploadScenarioImage,
  deleteScenarioImage,
  type AdminScenario,
  type AdminOption,
} from '../api';
import { API_BASE_URL, ApiError } from '../../api/client';
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  TEXT_LINK,
  FIELD,
  CHOICE_INPUT,
  FOCUS_RING,
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

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const POINT_OPTIONS: AdminOption['points'][] = [0, 5, 10];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type ImageState = 'idle' | 'uploading' | 'removing';

export default function ScenarioEditScreen({ scenarioId, onBack }: ScenarioEditScreenProps) {
  const token = getStoredToken();
  const [original, setOriginal] = useState<AdminScenario | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<AdminOption[]>([]);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageState, setImageState] = useState<ImageState>('idle');
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetchAdminScenario(token, scenarioId)
      .then((scenario) => {
        setOriginal(scenario);
        setCode(scenario.code);
        setDescription(scenario.description);
        setOptions(scenario.options);
        setImageUrl(scenario.imageUrl);
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

  const handlePickFile = () => {
    setImageError(null);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Сбрасываем value сразу — иначе повторный выбор ТОГО ЖЕ файла (например,
    // после ошибки) не вызовет onChange, потому что значение input'а не меняется.
    e.target.value = '';
    if (!file || !token) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Поддерживаются только PNG, JPEG или WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError('Файл слишком большой (максимум 5 МБ).');
      return;
    }

    setImageError(null);
    setImageState('uploading');
    try {
      const updated = await uploadScenarioImage(token, scenarioId, file);
      setImageUrl(updated.imageUrl);
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : 'Не удалось загрузить фото.');
    } finally {
      setImageState('idle');
    }
  };

  const handleRemoveImage = async () => {
    if (!token) return;
    setImageError(null);
    setImageState('removing');
    try {
      const updated = await deleteScenarioImage(token, scenarioId);
      setImageUrl(updated.imageUrl);
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : 'Не удалось убрать фото.');
    } finally {
      setImageState('idle');
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

        <div className="flex gap-2 mb-1">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setSaveState('idle');
            }}
            placeholder="название"
            className={`flex-1 min-w-0 bg-white px-3 py-3 text-[14px] text-ink ${FIELD}`}
          />

          {/* Настоящий file input скрыт — кликаем по нему программно через
              fileInputRef, чтобы можно было показать свою кнопку/превью
              вместо стандартного вида браузерного input[type=file]. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelected}
            className="hidden"
          />

          {imageUrl ? (
            <div className="shrink-0 relative w-[46px] h-[46px]">
              <button
                type="button"
                onClick={handlePickFile}
                disabled={imageState !== 'idle'}
                aria-label="Заменить фото"
                className={`w-full h-full overflow-hidden rounded-[5px] border border-line disabled:opacity-60 ${FOCUS_RING}`}
              >
                <img
                  src={`${API_BASE_URL}${imageUrl}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={imageState !== 'idle'}
                aria-label="Убрать фото"
                className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-dark text-white flex items-center justify-center disabled:opacity-60 ${FOCUS_RING}`}
              >
                <CloseIcon />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePickFile}
              disabled={imageState !== 'idle'}
              className={`shrink-0 flex items-center gap-1.5 bg-white px-4 py-3 text-[13px] text-ink disabled:opacity-60 ${SECONDARY_BUTTON}`}
            >
              {imageState === 'uploading' ? 'загрузка…' : 'фото'}
              <span className="text-brand text-base leading-none">+</span>
            </button>
          )}
        </div>

        {imageError && <p className="text-[12px] text-red-600 mb-3">{imageError}</p>}

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
