import type { Category, VisualType } from '../types';
import { apiRequest } from '../api/client';

// ---------------------------------------------------------------------------
// Токен администратора — храним в localStorage, чтобы вход не слетал при
// обновлении страницы. Ключ и функции собраны в одном месте специально,
// чтобы формат хранения можно было поменять, не трогая остальные экраны.
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Авторизация
// ---------------------------------------------------------------------------

export async function login(username: string, password: string): Promise<string> {
  const data = await apiRequest<{ accessToken: string }>('/api/admin/login', {
    method: 'POST',
    body: { username, password },
  });
  setStoredToken(data.accessToken);
  return data.accessToken;
}

export async function whoAmI(token: string): Promise<{ id: number; username: string }> {
  return apiRequest('/api/admin/me', { token });
}

// ---------------------------------------------------------------------------
// Статистика
// ---------------------------------------------------------------------------

export type Period = 'today' | '7d' | '30d' | 'all';

export interface OverviewStats {
  playthroughs: { value: number; deltaPct: number };
  averageIndex: { value: number; outOf: number; delta: number };
  completionRate: { value: number; deltaPct: number };
  averageTimeMin: { value: number; delta: number };
  timeline: { labels: string[]; values: number[] };
}

export function fetchOverview(token: string, period: Period): Promise<OverviewStats> {
  return apiRequest(`/api/admin/stats/overview?period=${period}`, { token });
}

export interface ScenarioOptionStat {
  id: number;
  code: string;
  label: string;
  points: number;
  pickedPercent: number;
}

export interface ScenarioStat {
  scenarioId: number;
  code: string;
  category: Category;
  description: string;
  totalAnswers: number;
  errorRate: number;
  options: ScenarioOptionStat[];
}

export function fetchScenarioStats(token: string): Promise<ScenarioStat[]> {
  return apiRequest('/api/admin/stats/scenarios', { token });
}

export interface ProfileDistributionItem {
  key: string;
  label: string;
  percent: number;
}

export function fetchProfileDistribution(token: string): Promise<ProfileDistributionItem[]> {
  return apiRequest('/api/admin/stats/profiles', { token });
}

export interface CommonMistake {
  scenarioId: number;
  scenarioCode: string;
  category: Category;
  optionLabel: string;
  pickedPercent: number;
}

export function fetchMistakes(token: string, limit = 3): Promise<CommonMistake[]> {
  return apiRequest(`/api/admin/stats/mistakes?limit=${limit}`, { token });
}

// ---------------------------------------------------------------------------
// Редактирование сценариев
// ---------------------------------------------------------------------------

export interface AdminOption {
  id: number;
  code: string;
  label: string;
  points: 0 | 5 | 10;
  explanation: string;
}

export interface AdminScenario {
  id: number;
  code: string;
  category: Category;
  description: string;
  visual: VisualType;
  optionsHeading: string;
  isActive: boolean;
  options: AdminOption[];
}

export function fetchAdminScenarios(token: string): Promise<AdminScenario[]> {
  return apiRequest('/api/admin/scenarios', { token });
}

export function fetchAdminScenario(token: string, scenarioId: number): Promise<AdminScenario> {
  return apiRequest(`/api/admin/scenarios/${scenarioId}`, { token });
}

export interface ScenarioUpdatePayload {
  code: string;
  category: Category;
  description: string;
  visual: VisualType;
  optionsHeading: string;
  isActive: boolean;
  options: {
    id?: number;
    code: string;
    label: string;
    points: number;
    explanation: string;
    orderIndex: number;
  }[];
}

export function updateScenario(
  token: string,
  scenarioId: number,
  payload: ScenarioUpdatePayload,
): Promise<AdminScenario> {
  return apiRequest(`/api/admin/scenarios/${scenarioId}`, {
    method: 'PATCH',
    body: payload,
    token,
  });
}

// ---------------------------------------------------------------------------
// Редактирование уровней (профилей)
// ---------------------------------------------------------------------------

export interface AdminTier {
  key: string;
  level: string;
  minPercent: number;
  maxPercent: number;
  title: string;
  body: string;
  cta: string;
  adminDescription: string;
}

export function fetchTiers(token: string): Promise<AdminTier[]> {
  return apiRequest('/api/admin/tiers', { token });
}

export function updateTierDescription(
  token: string,
  tierKey: string,
  adminDescription: string,
): Promise<AdminTier> {
  return apiRequest(`/api/admin/tiers/${tierKey}`, {
    method: 'PATCH',
    body: { adminDescription },
    token,
  });
}
