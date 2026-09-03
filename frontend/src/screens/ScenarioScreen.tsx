import type { Scenario } from '../types';
import PhoneScreen from '../components/PhoneScreen';
import ProgressBar from '../components/ProgressBar';
import OptionsList from '../components/OptionsList';
import NotificationVisual from '../components/visuals/NotificationVisual';
import PermissionsVisual from '../components/visuals/PermissionsVisual';
import WifiVisual from '../components/visuals/WifiVisual';
import CallVisual from '../components/visuals/CallVisual';
import EmailVisual from '../components/visuals/EmailVisual';
import PaymentVisual from '../components/visuals/PaymentVisual';
import PhotoPermissionVisual from '../components/visuals/PhotoPermissionVisual';
import { TOTAL_SCENARIOS } from '../data/scenarios';

interface ScenarioScreenProps {
  scenario: Scenario;
  onSelectOption?: (optionId: string) => void;
}

// Здесь только "переключатель", какую карточку-визуал показать.
// Конкретные тексты (город, сумма, email и т.д.) для сценариев 1-7
// зашиты внутри визуала — при желании их тоже можно вынести в data/scenarios.ts,
// если кибербез захочет их менять без участия фронтенда.
function renderVisual(scenario: Scenario) {
  switch (scenario.visual) {
    case 'notification':
      return <NotificationVisual />;
    case 'permissions':
      return <PermissionsVisual />;
    case 'wifi':
      return <WifiVisual networkName="FREE_COFFEE_WIFI" />;
    case 'call':
      return <CallVisual duration="00:24" />;
    case 'email':
      return (
        <EmailVisual
          from="anna@company-support.ru"
          subject="Вы получили доступ к документу"
          buttonLabel="ПОСМОТРЕТЬ ДОКУМЕНТ"
        />
      );
    case 'payment':
      return (
        <PaymentVisual
          status="Ваша посылка задержана"
          message="Оплатите 89 ₽, чтобы избежать ареста доставки."
          buttonLabel="ОПЛАТИТЬ"
          fakeUrl="delivery-check-support/..."
        />
      );
    case 'photoPermission':
      return <PhotoPermissionVisual />;
    default:
      return null;
  }
}

export default function ScenarioScreen({ scenario, onSelectOption }: ScenarioScreenProps) {
  return (
    <PhoneScreen>
      <ProgressBar current={scenario.id} total={TOTAL_SCENARIOS} />

      <h1 className="text-brand text-[34px] font-extrabold uppercase leading-none mt-5">
        {scenario.code}
      </h1>
      <p className="text-ink text-[15px] leading-snug mt-3">{scenario.description}</p>

      <div className="mt-6">{renderVisual(scenario)}</div>

      <OptionsList
        heading={scenario.optionsHeading}
        options={scenario.options}
        onSelect={onSelectOption}
      />

      <button
        type="button"
        className="mt-8 mx-auto text-[11px] tracking-wide text-muted uppercase"
      >
        Вернуться к выставке
      </button>
    </PhoneScreen>
  );
}
