import { useState } from 'react';
import LandingScreen from './screens/LandingScreen';
import ScenarioScreen from './screens/ScenarioScreen';
import PhoneScreen from './components/PhoneScreen';
import { scenarios } from './data/scenarios';

// Простой "переключатель экранов" для черновой вёрстки.
// -1 = лендинг, 0..scenarios.length-1 = индекс сценария.
// Реальную игровую логику (подсчёт баллов, категории, финальный экран)
// подключит бэкенд-интеграция на следующем этапе.
function App() {
  const [step, setStep] = useState(-1);

  if (step === -1) {
    return <LandingScreen onStart={() => setStep(0)} />;
  }

  if (step >= scenarios.length) {
    return (
      <PhoneScreen>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <p className="text-brand text-xl font-bold">Черновик закончился</p>
          <p className="text-muted text-sm max-w-[220px]">
            Готовы сценарии 1–7. Сценарии 8–10 и финальный экран добавим,
            когда их пришлёт кибербез-специалист.
          </p>
          <button
            type="button"
            onClick={() => setStep(-1)}
            className="mt-2 text-brand text-sm font-semibold"
          >
            Начать сначала
          </button>
        </div>
      </PhoneScreen>
    );
  }

  return (
    <ScenarioScreen
      scenario={scenarios[step]}
      onSelectOption={() => setStep((s) => s + 1)}
    />
  );
}

export default App;
