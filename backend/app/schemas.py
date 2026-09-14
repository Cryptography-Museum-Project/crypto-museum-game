"""
Схемы данных, которые "ходят" через API.

Модели в models.py — это то, как данные лежат в базе (snake_case,
питоновский стиль). Схемы здесь — это то, что видит снаружи фронтенд:
поля отдаются в camelCase (optionsHeading, totalScore и т.д.), потому
что именно так называются поля в frontend/src/types.ts. Так подключение
фронтенда к этому API в будущем не потребует переименовывать поля.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


def to_camel(snake: str) -> str:
    head, *tail = snake.split("_")
    return head + "".join(word.capitalize() for word in tail)


class CamelModel(BaseModel):
    """Базовая схема: принимает и snake_case, и camelCase, отдаёт camelCase."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


Category = Literal["Пароли", "Фишинг", "Wi-Fi", "Приватность", "Устройства", "Финансы"]

# ---------------------------------------------------------------------------
# Сценарии (публичная часть — то, что видит посетитель)
# ---------------------------------------------------------------------------


class OptionPublic(CamelModel):
    id: int
    code: str
    label: str
    points: int
    explanation: str


class ScenarioPublic(CamelModel):
    id: int
    code: str
    category: Category
    description: str
    visual: str
    options_heading: str
    options: list[OptionPublic]


# ---------------------------------------------------------------------------
# Игровая сессия
# ---------------------------------------------------------------------------


class SessionStartResponse(CamelModel):
    id: str


class AnswerIn(CamelModel):
    scenario_id: int
    option_id: int


class AnswerAck(CamelModel):
    """Что возвращаем сразу после ответа на один сценарий."""

    scenario_id: int
    option_id: int
    points: int
    explanation: str


class TierOut(CamelModel):
    key: str
    level: str
    title: str
    body: str
    cta: str


class SessionFinishResponse(CamelModel):
    id: str
    total_score: int
    max_score: int
    tier: TierOut


# ---------------------------------------------------------------------------
# Админка: авторизация
# ---------------------------------------------------------------------------


class AdminLoginRequest(CamelModel):
    username: str
    password: str


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"


class AdminMeResponse(CamelModel):
    id: int
    username: str


class AdminPasswordChangeRequest(CamelModel):
    current_password: str
    new_password: str = Field(min_length=6)


# ---------------------------------------------------------------------------
# Админка: редактирование контента
# ---------------------------------------------------------------------------


class OptionUpdate(CamelModel):
    id: Optional[int] = None  # если не передан — создаётся новый вариант
    code: str
    label: str
    points: int = Field(ge=0, le=10)
    explanation: str
    order_index: int = 0


class ScenarioUpdate(CamelModel):
    code: str
    category: Category
    description: str
    visual: str
    options_heading: str = "Ваши действия?"
    is_active: bool = True
    options: list[OptionUpdate]


class ScenarioAdmin(ScenarioPublic):
    is_active: bool


class TierUpdate(CamelModel):
    level: Optional[str] = None
    title: Optional[str] = None
    body: Optional[str] = None
    cta: Optional[str] = None
    admin_description: Optional[str] = None


class TierAdmin(CamelModel):
    key: str
    level: str
    min_percent: int
    max_percent: int
    title: str
    body: str
    cta: str
    admin_description: str


# ---------------------------------------------------------------------------
# Админка: статистика
# ---------------------------------------------------------------------------

Period = Literal["today", "7d", "30d", "all"]


class MetricWithDeltaPct(CamelModel):
    value: float
    delta_pct: float


class AverageIndexMetric(CamelModel):
    value: float
    out_of: int = 10
    delta: float


class AverageTimeMetric(CamelModel):
    value: float
    delta: float


class Timeline(CamelModel):
    labels: list[str]
    values: list[int]


class OverviewStats(CamelModel):
    playthroughs: MetricWithDeltaPct
    average_index: AverageIndexMetric
    completion_rate: MetricWithDeltaPct
    average_time_min: AverageTimeMetric
    timeline: Timeline


class OptionStat(CamelModel):
    id: int
    code: str
    label: str
    points: int
    picked_percent: float


class ScenarioStat(CamelModel):
    scenario_id: int
    code: str
    category: Category
    description: str
    total_answers: int
    error_rate: float  # % ответивших НЕ лучшим (points=10) вариантом
    options: list[OptionStat]


class ProfileDistributionItem(CamelModel):
    key: str
    label: str
    percent: float


class CommonMistake(CamelModel):
    scenario_id: int
    scenario_code: str
    category: Category
    option_label: str
    picked_percent: float
