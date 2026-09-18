import { useEffect, useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import TopNav, { type AdminTab } from '../components/TopNav';
import { getStoredToken, fetchTiers, updateTier, type AdminTier } from '../api';
import { PRIMARY_BUTTON, FIELD } from '../../styles/interactive';

interface ProfilesScreenProps {
  onChangeTab: (tab: AdminTab) => void;
}

type SaveState = 'idle' | 'saving' | 'saved';

interface TierDraft {
  title: string;
  body: string;
  cta: string;
  adminDescription: string;
}

function draftFrom(tier: AdminTier): TierDraft {
  return {
    title: tier.title,
    body: tier.body,
    cta: tier.cta,
    adminDescription: tier.adminDescription,
  };
}

export default function ProfilesScreen({ onChangeTab }: ProfilesScreenProps) {
  const token = getStoredToken();
  const [tiers, setTiers] = useState<AdminTier[]>([]);
  const [drafts, setDrafts] = useState<Record<string, TierDraft>>({});
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchTiers(token)
      .then((data) => {
        setTiers(data);
        setDrafts(Object.fromEntries(data.map((t) => [t.key, draftFrom(t)])));
      })
      .catch(() => setError(true));
  }, [token]);

  const updateDraft = (tierKey: string, patch: Partial<TierDraft>) => {
    setDrafts((prev) => ({ ...prev, [tierKey]: { ...prev[tierKey], ...patch } }));
    setSaveState((prev) => ({ ...prev, [tierKey]: 'idle' }));
  };

  const handleSave = async (tierKey: string) => {
    if (!token) return;
    const draft = drafts[tierKey];
    if (!draft) return;
    setSaveState((prev) => ({ ...prev, [tierKey]: 'saving' }));
    try {
      await updateTier(token, tierKey, draft);
      setSaveState((prev) => ({ ...prev, [tierKey]: 'saved' }));
    } catch {
      setSaveState((prev) => ({ ...prev, [tierKey]: 'idle' }));
      window.alert('Не удалось сохранить изменения. Попробуйте ещё раз.');
    }
  };

  if (error) {
    return (
      <PhoneScreen>
        <TopNav active="profiles" onChange={onChangeTab} />
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-ink text-[14px]">Не удалось загрузить уровни результата.</p>
        </div>
      </PhoneScreen>
    );
  }

  return (
    <PhoneScreen>
      <TopNav active="profiles" onChange={onChangeTab} />
      <div className="flex-1 overflow-y-auto -mx-5 px-5 space-y-4">
        {tiers.map((tier) => {
          const state = saveState[tier.key] ?? 'idle';
          const draft = drafts[tier.key];
          if (!draft) return null;
          return (
            <div key={tier.key} className="bg-white rounded-[5px] p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-bold text-ink text-[16px] capitalize">{tier.level}</p>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted">индекс</p>
                  <p className="font-halvar font-bold text-ink text-[14px]">
                    {tier.minPercent}-{tier.maxPercent}
                  </p>
                </div>
              </div>

              {/* то, что реально увидит игрок на экране результата */}
              <label className="block text-[10px] text-muted mb-1">
                заголовок (необязательно)
              </label>
              <input
                value={draft.title}
                onChange={(e) => updateDraft(tier.key, { title: e.target.value })}
                placeholder="например, «Отличный результат!»"
                className={`w-full text-[13px] text-ink px-3 py-2 mb-2 ${FIELD}`}
              />

              <label className="block text-[10px] text-muted mb-1">текст</label>
              <textarea
                value={draft.body}
                onChange={(e) => updateDraft(tier.key, { body: e.target.value })}
                rows={4}
                className={`w-full text-[13px] text-ink leading-snug resize-none px-3 py-2 mb-2 ${FIELD}`}
              />

              <label className="block text-[10px] text-muted mb-1">
                призыв (приглашение на выставку)
              </label>
              <textarea
                value={draft.cta}
                onChange={(e) => updateDraft(tier.key, { cta: e.target.value })}
                rows={2}
                className={`w-full text-[13px] text-ink leading-snug resize-none px-3 py-2 mb-3 ${FIELD}`}
              />

              {/* заметка */}
              <label className="block text-[10px] text-muted mb-1">
                заметка для команды (игрок её не видит)
              </label>
              <textarea
                value={draft.adminDescription}
                onChange={(e) => updateDraft(tier.key, { adminDescription: e.target.value })}
                rows={2}
                className={`w-full text-[13px] text-ink leading-snug resize-none px-3 py-2 mb-2 ${FIELD}`}
              />

              <button
                type="button"
                onClick={() => handleSave(tier.key)}
                disabled={state === 'saving'}
                className={`w-full rounded-[5px] text-white text-[13px] font-bold py-2.5 disabled:opacity-60 ${PRIMARY_BUTTON}`}
              >
                {state === 'saving' ? 'Сохранение…' : state === 'saved' ? 'Сохранено ✓' : 'Сохранить'}
              </button>
            </div>
          );
        })}
      </div>
    </PhoneScreen>
  );
}
