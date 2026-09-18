import type { Scenario } from '../types';
import PhoneScreen from '../components/PhoneScreen';
import TopBar from '../components/TopBar';
import GameMasthead from '../components/GameMasthead';
import Footer from '../components/Footer';
import OptionsList from '../components/OptionsList';
import ScenarioVisualImage from '../components/visuals/ScenarioVisualImage';
import { API_BASE_URL } from '../api/client';

import smartphoneNotification from '../assets/scenario-visuals/smartphone-notification.png';
import taxiPermissions from '../assets/scenario-visuals/taxi-permissions.png';
import cafeWifi from '../assets/scenario-visuals/cafe-wifi.png';
import bankCallCode from '../assets/scenario-visuals/bank-call-code.png';
import workEmail from '../assets/scenario-visuals/work-email.png';
import scamCall from '../assets/scenario-visuals/scam-call.png';
import smartHome from '../assets/scenario-visuals/smart-home.png';
import passwordMonitor from '../assets/scenario-visuals/password-monitor.png';
import avitoApps from '../assets/scenario-visuals/avito-apps.png';
import purchasePhone from '../assets/scenario-visuals/purchase-phone.png';

interface ScenarioScreenProps {
  scenario: Scenario;
  total: number;
  onSelectOption?: (optionId: string) => void;
  onHome?: () => void;
}

function renderVisual(scenario: Scenario) {
  if (scenario.imageUrl) {
    return <ScenarioVisualImage src={`${API_BASE_URL}${scenario.imageUrl}`} alt={scenario.code} />;
  }

  switch (scenario.visual) {
    case 'notification':
      return (
        <ScenarioVisualImage src={smartphoneNotification} alt="Ваш аккаунт требует подтверждения" />
      );
    case 'permissions':
      return (
        <ScenarioVisualImage
          src={taxiPermissions}
          alt="Приложение TAXI запрашивает доступ к контактам, геолокации, микрофону и фото"
        />
      );
    case 'wifi':
      return <ScenarioVisualImage src={cafeWifi} alt="Доступные сети Wi-Fi в кафе" />;
    case 'bankCall':
      return (
        <ScenarioVisualImage
          src={bankCallCode}
          alt="Входящий звонок с кодом подтверждения из СМС"
        />
      );
    case 'email':
      return <ScenarioVisualImage src={workEmail} alt="Письмо от anna@company-support.ru" />;
    case 'scamCall':
      return <ScenarioVisualImage src={scamCall} alt="Входящий звонок со скрытым номером" />;
    case 'smartHome':
      return (
        <ScenarioVisualImage src={smartHome} alt="Приложение умного дома запрашивает разрешения" />
      );
    case 'password':
      return (
        <ScenarioVisualImage
          src={passwordMonitor}
          alt="Регистрация в сервисе для просмотра фильмов"
        />
      );
    case 'device':
      return (
        <ScenarioVisualImage
          src={avitoApps}
          alt="Приложения на смартфоне, который продают на Авито"
        />
      );
    case 'purchase':
      return (
        <ScenarioVisualImage
          src={purchasePhone}
          alt="Реклама смартфона со скидкой 70% на незнакомом сайте"
        />
      );
    default:
      return null;
  }
}

export default function ScenarioScreen({ scenario, total, onSelectOption, onHome }: ScenarioScreenProps) {
  return (
    <PhoneScreen>
      <GameMasthead onHome={onHome} />
      <TopBar current={scenario.id} total={total} onHome={onHome} />

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
