"""
Статистика для админ-панели.

Важное упрощение (можно улучшать в будущем): все расчёты периодов
("сегодня", "7 дней" и т.д.) идут по времени сервера в UTC. Если музею
понадобится точное время по Москве — нужно будет только поправить
функцию `period_bounds` ниже, остальной код трогать не придётся.
"""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, GameSession, Scenario, SessionAnswer, Tier
from app.schemas import (
    AverageIndexMetric,
    AverageTimeMetric,
    CommonMistake,
    MetricWithDeltaPct,
    OptionStat,
    OverviewStats,
    Period,
    ProfileDistributionItem,
    ScenarioStat,
    Timeline,
)
from app.security import get_current_admin

router = APIRouter(prefix="/api/admin/stats", tags=["admin-stats"])

RU_WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]
RU_MONTHS = [
    "янв.", "фев.", "март", "апр.", "май", "июнь",
    "июль", "авг.", "сен.", "окт.", "ноя.", "дек.",
]


# ---------------------------------------------------------------------------
# Вспомогательные функции
# ---------------------------------------------------------------------------


def period_bounds(period: Period, db: Session) -> tuple[datetime, datetime, datetime, datetime]:
    """Возвращает (начало периода, сейчас, начало предыдущего периода, конец предыдущего).

    Все datetime здесь — "наивные" (без часового пояса) и в UTC, потому
    что именно так SQLite хранит значения started_at/finished_at
    (через server_default=func.now()). Если бы мы сравнивали их с
    datetime, у которого указан часовой пояс, Python бы выдавал ошибку
    "can't compare offset-naive and offset-aware datetimes".
    """
    now = datetime.utcnow()

    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        prev_start = start - timedelta(days=1)
        return start, now, prev_start, start

    if period == "7d":
        start = now - timedelta(days=7)
        prev_start = now - timedelta(days=14)
        return start, now, prev_start, start

    if period == "30d":
        start = now - timedelta(days=30)
        prev_start = now - timedelta(days=60)
        return start, now, prev_start, start

    # "all" — от самой первой сессии в базе (если сессий ещё нет, берём "неделю назад",
    # чтобы не делить на пустой диапазон)
    earliest = db.query(func.min(GameSession.started_at)).scalar()
    start = earliest or (now - timedelta(days=7))
    return start, now, start, start  # для "all" delta не считаем


def sessions_started_up_to(db: Session, moment: datetime) -> int:
    return db.query(func.count(GameSession.id)).filter(GameSession.started_at <= moment).scalar() or 0


def build_timeline(db: Session, period: Period, start: datetime, end: datetime) -> Timeline:
    """Строит несколько контрольных точек внутри периода с накопительным
    количеством начатых прохождений (для простого графика на Обзоре)."""
    num_points = 6 if period != "7d" else 7
    if end <= start:
        return Timeline(labels=[], values=[])

    step = (end - start) / num_points
    checkpoints = [start + step * (i + 1) for i in range(num_points)]
    baseline = sessions_started_up_to(db, start)

    labels: list[str] = []
    for cp in checkpoints:
        if period == "today":
            labels.append(cp.strftime("%H:00"))
        elif period == "7d":
            labels.append(RU_WEEKDAYS[cp.weekday()])
        elif period == "30d":
            labels.append(f"{cp.day} {RU_MONTHS[cp.month - 1]}")
        else:
            labels.append(RU_MONTHS[cp.month - 1])

    values = [max(sessions_started_up_to(db, cp) - baseline, 0) for cp in checkpoints]
    return Timeline(labels=labels, values=values)


# ---------------------------------------------------------------------------
# GET /api/admin/stats/overview
# ---------------------------------------------------------------------------


@router.get("/overview", response_model=OverviewStats)
def overview(
    period: Period = Query("today"),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    start, end, prev_start, prev_end = period_bounds(period, db)

    def counts_for(range_start: datetime | None, range_end: datetime | None):
        # range_start=None означает "без нижней границы" — используем это
        # для периода "all", чтобы не зависеть от точности сравнения
        # с самой первой записью в базе.
        started_q = db.query(func.count(GameSession.id))
        finished_q = db.query(GameSession).filter(GameSession.finished_at.isnot(None))
        avg_q = db.query(func.avg(GameSession.total_score)).filter(GameSession.finished_at.isnot(None))
        if range_start is not None:
            started_q = started_q.filter(
                GameSession.started_at >= range_start, GameSession.started_at <= range_end
            )
            finished_q = finished_q.filter(
                GameSession.finished_at >= range_start, GameSession.finished_at <= range_end
            )
            avg_q = avg_q.filter(
                GameSession.finished_at >= range_start, GameSession.finished_at <= range_end
            )

        started = started_q.scalar() or 0
        finished = finished_q.count()
        avg_score = avg_q.scalar()
        finished_sessions = finished_q.all()
        if finished_sessions:
            avg_minutes = sum(
                (s.finished_at - s.started_at).total_seconds() / 60 for s in finished_sessions
            ) / len(finished_sessions)
        else:
            avg_minutes = 0.0
        completion = (finished / started * 100) if started else 0.0
        return started, finished, completion, (avg_score or 0.0), avg_minutes

    is_all = period == "all"
    started, finished, completion, avg_score, avg_minutes = counts_for(
        None if is_all else start, end
    )
    p_started, p_finished, p_completion, p_avg_score, p_avg_minutes = (
        (0, 0, 0.0, 0.0, 0.0) if is_all else counts_for(prev_start, prev_end)
    )

    playthroughs_delta_pct = (
        0.0 if is_all or p_started == 0 else round((started - p_started) / p_started * 100, 1)
    )
    completion_delta_pct = 0.0 if is_all else round(completion - p_completion, 1)
    index_delta = 0.0 if is_all else round(avg_score / 10 - p_avg_score / 10, 1)
    time_delta = 0.0 if is_all else round(avg_minutes - p_avg_minutes, 1)

    return OverviewStats(
        playthroughs=MetricWithDeltaPct(value=started, delta_pct=playthroughs_delta_pct),
        average_index=AverageIndexMetric(value=round(avg_score / 10, 1), out_of=10, delta=index_delta),
        completion_rate=MetricWithDeltaPct(value=round(completion, 1), delta_pct=completion_delta_pct),
        average_time_min=AverageTimeMetric(value=round(avg_minutes, 2), delta=time_delta),
        timeline=build_timeline(db, period, start, end),
    )


# ---------------------------------------------------------------------------
# GET /api/admin/stats/scenarios
# ---------------------------------------------------------------------------


@router.get("/scenarios", response_model=list[ScenarioStat])
def scenario_stats(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    scenarios = db.query(Scenario).order_by(Scenario.order_index).all()
    result: list[ScenarioStat] = []

    for scenario in scenarios:
        total_answers = (
            db.query(func.count(SessionAnswer.id))
            .filter(SessionAnswer.scenario_id == scenario.id)
            .scalar()
            or 0
        )
        wrong_answers = (
            db.query(func.count(SessionAnswer.id))
            .filter(SessionAnswer.scenario_id == scenario.id, SessionAnswer.points < 10)
            .scalar()
            or 0
        )
        error_rate = round(wrong_answers / total_answers * 100, 1) if total_answers else 0.0

        options: list[OptionStat] = []
        for option in scenario.options:
            picked = (
                db.query(func.count(SessionAnswer.id))
                .filter(SessionAnswer.option_id == option.id)
                .scalar()
                or 0
            )
            picked_percent = round(picked / total_answers * 100, 1) if total_answers else 0.0
            options.append(
                OptionStat(
                    id=option.id,
                    code=option.code,
                    label=option.label,
                    points=option.points,
                    picked_percent=picked_percent,
                )
            )

        result.append(
            ScenarioStat(
                scenario_id=scenario.id,
                code=scenario.code,
                category=scenario.category,
                description=scenario.description,
                total_answers=total_answers,
                error_rate=error_rate,
                options=options,
            )
        )

    return result


# ---------------------------------------------------------------------------
# GET /api/admin/stats/profiles
# ---------------------------------------------------------------------------


@router.get("/profiles", response_model=list[ProfileDistributionItem])
def profile_distribution(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    total_finished = (
        db.query(func.count(GameSession.id)).filter(GameSession.finished_at.isnot(None)).scalar() or 0
    )

    tiers = db.query(Tier).order_by(Tier.order_index).all()
    result = []
    for tier in tiers:
        count = (
            db.query(func.count(GameSession.id))
            .filter(GameSession.tier_id == tier.id, GameSession.finished_at.isnot(None))
            .scalar()
            or 0
        )
        percent = round(count / total_finished * 100, 1) if total_finished else 0.0
        result.append(ProfileDistributionItem(key=tier.key, label=tier.level, percent=percent))
    return result


# ---------------------------------------------------------------------------
# GET /api/admin/stats/mistakes
# ---------------------------------------------------------------------------


@router.get("/mistakes", response_model=list[CommonMistake])
def common_mistakes(
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """Самые частые НЕ лучшие ответы по всем сценариям — чтобы понять,
    какие темы стоит объяснять на выставке подробнее."""
    candidates: list[CommonMistake] = []

    scenarios = db.query(Scenario).order_by(Scenario.order_index).all()
    for scenario in scenarios:
        total_answers = (
            db.query(func.count(SessionAnswer.id))
            .filter(SessionAnswer.scenario_id == scenario.id)
            .scalar()
            or 0
        )
        if not total_answers:
            continue
        for option in scenario.options:
            if option.points >= 10:
                continue
            picked = (
                db.query(func.count(SessionAnswer.id))
                .filter(SessionAnswer.option_id == option.id)
                .scalar()
                or 0
            )
            if not picked:
                continue
            candidates.append(
                CommonMistake(
                    scenario_id=scenario.id,
                    scenario_code=scenario.code,
                    category=scenario.category,
                    option_label=option.label,
                    picked_percent=round(picked / total_answers * 100, 1),
                )
            )

    candidates.sort(key=lambda c: c.picked_percent, reverse=True)
    return candidates[:limit]
