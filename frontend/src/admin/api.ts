import type { Category, VisualType } from '../types';
import { apiRequest, API_BASE_URL, ApiError } from '../api/client';

// ---------------------------------------------------------------------------
// Токен администратора — храним в localStorage
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
  imageUrl: string | null;
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

export function createScenario(token: string): Promise<AdminScenario> {
  return apiRequest('/api/admin/scenarios', { method: 'POST', body: {}, token });
}

export function deleteScenario(token: string, scenarioId: number): Promise<void> {
  return apiRequest(`/api/admin/scenarios/${scenarioId}`, { method: 'DELETE', token });
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

export async function uploadScenarioImage(
  token: string,
  scenarioId: number,
  file: File,
): Promise<AdminScenario> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/admin/scenarios/${scenarioId}/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const data = (await response.json()) as { detail?: string };
      if (data?.detail) detail = data.detail;
    } catch {
      // тело ответа не JSON — оставляем statusText как есть
    }
    throw new ApiError(response.status, detail);
  }

  return (await response.json()) as AdminScenario;
}

export function deleteScenarioImage(token: string, scenarioId: number): Promise<AdminScenario> {
  return apiRequest(`/api/admin/scenarios/${scenarioId}/image`, {
    method: 'DELETE',
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

export interface TierUpdatePayload {
  title?: string;
  body?: string;
  cta?: string;
  adminDescription?: string;
}

export function updateTier(
  token: string,
  tierKey: string,
  patch: TierUpdatePayload,
): Promise<AdminTier> {
  return apiRequest(`/api/admin/tiers/${tierKey}`, {
    method: 'PATCH',
    body: patch,
    token,
  });
}