import type { Scenario, ScenarioOption } from '../types';
import { apiRequest } from './client';

// --- Как backend отдаёт данные (см. backend/app/schemas.py) ---------------

interface ApiOption {
  id: number; // настоящий id варианта в базе — нужен только чтобы отправить ответ
  code: string; // "01" / "02" / "03" — то же самое, что раньше было ScenarioOption.id
  label: string;
  points: 0 | 5 | 10;
  explanation: string;
}

interface ApiScenario {
  id: number;
  code: string;
  category: Scenario['category'];
  description: string;
  visual: Scenario['visual'];
  imageUrl: string | null;
  optionsHeading: string;
  options: ApiOption[];
}

export interface FinishResponse {
  id: string;
  totalScore: number;
  maxScore: number;
  tier: {
    key: string;
    level: string;
    title: string;
    body: string;
    cta: string;
  };
}

// --- То, чем реально пользуется остальной фронтенд -------------------------
//
// PlayableOption/PlayableScenario — это Scenario/ScenarioOption из types.ts
// (тот же формат, что раньше жил в data/scenarios.ts) плюс один скрытый
// технический id варианта в базе данных (dbOptionId), который нужен только
// чтобы отправить ответ на backend. Экраны игры (ScenarioScreen, AnswerScreen
// и т.д.) ничего не знают про dbOptionId и продолжают работать как раньше.

export interface PlayableOption extends ScenarioOption {
  dbOptionId: number;
}

export interface PlayableScenario extends Scenario {
  options: PlayableOption[];
}

function toPlayableScenario(scenario: ApiScenario): PlayableScenario {
  return {
    id: scenario.id,
    code: scenario.code,
    category: scenario.category,
    description: scenario.description,
    visual: scenario.visual,
    imageUrl: scenario.imageUrl,
    optionsHeading: scenario.optionsHeading,
    options: scenario.options.map((option) => ({
      id: option.code,
      label: option.label,
      points: option.points,
      explanation: option.explanation,
      dbOptionId: option.id,
    })),
  };
}

export async function fetchScenarios(): Promise<PlayableScenario[]> {
  const data = await apiRequest<ApiScenario[]>('/api/scenarios');
  return data.map(toPlayableScenario);
}

export async function startSession(): Promise<string> {
  const data = await apiRequest<{ id: string }>('/api/sessions', { method: 'POST' });
  return data.id;
}

export async function submitAnswer(
  sessionId: string,
  scenarioId: number,
  dbOptionId: number,
): Promise<void> {
  await apiRequest(`/api/sessions/${sessionId}/answers`, {
    method: 'POST',
    body: { scenarioId, optionId: dbOptionId },
  });
}

export async function finishSession(sessionId: string): Promise<FinishResponse> {
  return apiRequest<FinishResponse>(`/api/sessions/${sessionId}/finish`, { method: 'POST' });
}
