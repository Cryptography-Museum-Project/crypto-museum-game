import type { Scenario } from '../types';
import PhoneScreen from '../components/PhoneScreen';
import TopBar from '../components/TopBar';
import GameMasthead from '../components/GameMasthead';
import Footer from '../components/Footer';
import OptionsList from '../components/OptionsList';
import NotificationVisual from '../components/visuals/NotificationVisual';
import PermissionsVisual from '../components/visuals/PermissionsVisual';
import WifiVisual from '../components/visuals/WifiVisual';
import CallVisual from '../components/visuals/CallVisual';
import EmailVisual from '../components/visuals/EmailVisual';
import PaymentVisual from '../components/visuals/PaymentVisual';
import PhotoPermissionVisual from '../components/visuals/PhotoPermissionVisual';
import PlaceholderVisual from '../components/visuals/PlaceholderVisual';
import { TOTAL_SCENARIOS } from '../data/scenarios';

interface ScenarioScreenProps {
  scenario: Scenario;
  onSelectOption?: (optionId: string) => void;
  onHome?: () => void;
}

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
    case 'placeholder': {
      const iconByCode: Record<string, 'lock' | 'device' | 'cart'> = {
        ПАРОЛЬ: 'lock',
        АВИТО: 'device',
        ПОКУПКА: 'cart',
      };
      return <PlaceholderVisual icon={iconByCode[scenario.code] ?? 'lock'} />;
    }
    default:
      return null;
  }
}

export default function ScenarioScreen({ scenario, onSelectOption, onHome }: ScenarioScreenProps) {
  return (
    <PhoneScreen>
      <GameMasthead onHome={onHome} />
      <TopBar current={scenario.id} total={TOTAL_SCENARIOS} onHome={onHome} />

      <div className="flex flex-col flex-1 xl:grid xl:grid-cols-[1fr_260px] xl:gap-x-16 xl:items-start xl:mt-4">
        <h1 className="font-halvar font-light text-brand text-[34px] xl:text-[29px] uppercase leading-none mt-5 xl:mt-0 xl:col-start-1 xl:row-start-1">
          {scenario.code}
        </h1>
        <p className="text-ink text-[15px] xl:text-[17px] leading-snug mt-3 min-h-21 xl:min-h-0 xl:col-start-1 xl:row-start-2">
          {scenario.description}
        </p>

        <div className="mt-6 min-h-55 flex items-center justify-center xl:mt-0 xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:h-auto xl:self-start">
          {renderVisual(scenario)}
        </div>

        <div className="xl:col-span-2 xl:row-start-3 xl:mt-10">
          <OptionsList
            heading={scenario.optionsHeading}
            options={scenario.options}
            onSelect={onSelectOption}
          />
        </div>

        <div className="flex-1 xl:hidden" />

        <Footer />
      </div>
    </PhoneScreen>
  );
}
