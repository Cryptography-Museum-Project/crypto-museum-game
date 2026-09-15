import { useEffect, useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import BottomNav, { type AdminTab } from '../components/BottomNav';
import { getStoredToken, fetchTiers, updateTierDescription, type AdminTier } from '../api';
import { PRIMARY_BUTTON, FIELD } from '../../styles/interactive';

interface ProfilesScreenProps {
  onChangeTab: (tab: AdminTab) => void;
}

type SaveState = 'idle' | 'saving' | 'saved';

export default function ProfilesScreen({ onChangeTab }: ProfilesScreenProps) {
  const token = getStoredToken();
  const [tiers, setTiers] = useState<AdminTier[]>([]);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchTiers(token)
      .then((data) => {
        setTiers(data);
        setDescriptions(Object.fromEntries(data.map((t) => [t.key, t.adminDescription])));
      })
      .catch(() => setError(true));
  }, [token]);

  const handleSave = async (tierKey: string) => {
    if (!token) return;
    setSaveState((prev) => ({ ...prev, [tierKey]: 'saving' }));
    try {
      await updateTierDescription(token, tierKey, descriptions[tierKey] ?? '');
      setSaveState((prev) => ({ ...prev, [tierKey]: 'saved' }));
    } catch {
      setSaveState((prev) => ({ ...prev, [tierKey]: 'idle' }));
      window.alert('Не удалось сохранить изменения. Попробуйте ещё раз.');
    }
  };

  if (error) {
    return (
      <PhoneScreen>
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-ink text-[14px]">Не удалось загрузить уровни результата.</p>
        </div>
        <BottomNav active="profiles" onChange={onChangeTab} />
      </PhoneScreen>
    );
  }

  return (
    <PhoneScreen>
      <div className="flex-1 overflow-y-auto -mx-5 px-5 space-y-4">
        {tiers.map((tier) => {
          const state = saveState[tier.key] ?? 'idle';
          return (
            <div key={tier.key} className="bg-white rounded-[5px] p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-bold text-ink text-[16px] capitalize">{tier.level}</p>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted">индекс</p>
                  <p className="font-halvar font-bold text-ink text-[14px]">
                    {tier.minPercent}-{tier.maxPercent}
                  </p>
                </div>
              </div>
              <textarea
                value={descriptions[tier.key] ?? ''}
                onChange={(e) => {
                  setDescriptions((prev) => ({ ...prev, [tier.key]: e.target.value }));
                  setSaveState((prev) => ({ ...prev, [tier.key]: 'idle' }));
                }}
                rows={4}
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

      <BottomNav active="profiles" onChange={onChangeTab} />
    </PhoneScreen>
  );
}
