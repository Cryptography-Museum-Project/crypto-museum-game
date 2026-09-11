import { useState } from 'react';
import PhoneScreen from '../../components/PhoneScreen';
import BottomNav, { type AdminTab } from '../components/BottomNav';
import { TIERS } from '../../data/tiers';
import { FIELD } from '../../styles/interactive';

interface ProfilesScreenProps {
  onChangeTab: (tab: AdminTab) => void;
}

// Как и в редакторе сценариев — правки пока живут только локально,
// реального сохранения на сервер ещё нет.
export default function ProfilesScreen({ onChangeTab }: ProfilesScreenProps) {
  const [descriptions, setDescriptions] = useState(
    Object.fromEntries(TIERS.map((t) => [t.key, t.adminDescription])),
  );

  return (
    <PhoneScreen>
      <div className="flex-1 overflow-y-auto -mx-5 px-5 space-y-4">
        {TIERS.map((tier) => (
          <div key={tier.key} className="bg-white rounded-[5px] p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-bold text-ink text-[16px] capitalize">{tier.level}</p>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted">индекс</p>
                <p className="font-halvar font-bold text-ink text-[14px]">
                  {tier.min}-{tier.max}
                </p>
              </div>
            </div>
            <textarea
              value={descriptions[tier.key]}
              onChange={(e) => setDescriptions((prev) => ({ ...prev, [tier.key]: e.target.value }))}
              rows={4}
              className={`w-full text-[13px] text-ink leading-snug resize-none px-3 py-2 ${FIELD}`}
            />
          </div>
        ))}
      </div>

      <BottomNav active="profiles" onChange={onChangeTab} />
    </PhoneScreen>
  );
}
