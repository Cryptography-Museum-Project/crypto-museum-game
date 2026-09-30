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


def percentages_of(counts: list[int]) -> list[float]:
    """Считает проценты (с точностью до 0.1) так, чтобы они гарантированно
    суммировались ровно в 100.0 — там, где сумма counts > 0.

    Если просто округлять каждую долю по отдельности (round(count/total*100, 1)),
    сумма почти никогда не даёт ровно 100: например 1/3, 1/3, 1/3 даёт
    33.3+33.3+33.3 = 99.9, а не 100.0. На маленьких выборках (типично для
    админки на старте выставки, когда прохождений мало) это особенно
    заметно и выглядит как "неправильный процент" при проверке вручную.

    Используем метод наибольшего остатка: округляем все доли вниз до
    0.1, а оставшиеся "хвосты" (по 0.1) раздаём долям с наибольшим
    дробным остатком — так сумма всегда равна 100.0 (или 0, если счёт
    пустой), а каждое отдельное значение отличается от "честной" доли
    не больше чем на 0.1.
    """
    total = sum(counts)
    if total <= 0:
        return [0.0 for _ in counts]

    # Работаем в десятых долях процента (0..1000), чтобы не гонять float
    # ошибки округления — переводим обратно в проценты только в конце.
    raw = [count / total * 1000 for count in counts]
    floored = [int(r) for r in raw]  # округление вниз, в десятых
    remainder = 1000 - sum(floored)  # сколько десятых долей ещё "не роздано"

    # Раздаём недостающие десятые доли по одной тем, у кого больше всего
    # дробный остаток (наибольший остаток => этот вариант "заслуживает"
    # округление вверх сильнее остальных).
    order = sorted(range(len(counts)), key=lambda i: raw[i] - floored[i], reverse=True)
    for i in order[:remainder]:
        floored[i] += 1

    return [value / 10 for value in floored]


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


def period_range(period: Period, db: Session) -> tuple[datetime | None, datetime | None]:
    """Границы выбранного периода для разделов «Ошибки по сценариям»,
    «Частые ошибки» и «Профили». Для "all" — (None, None), то есть без
    фильтра по времени. Так все блоки страницы «Обзор» считаются за один
    и тот же период, что выбран в фильтре."""
    if period == "all":
        return None, None
    start, end, _, _ = period_bounds(period, db)
    return start, end


def answers_in_period(query, start: datetime | None, end: datetime | None):
    """Оставляет в запросе только ответы, данные в выбранный период."""
    if start is None:
        return query
    return query.filter(SessionAnswer.answered_at >= start, SessionAnswer.answered_at <= end)


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
    period: Period = Query("all"),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    start, end = period_range(period, db)
    scenarios = db.query(Scenario).order_by(Scenario.order_index).all()
    result: list[ScenarioStat] = []

    for scenario in scenarios:
        total_answers = (
            answers_in_period(
                db.query(func.count(SessionAnswer.id)).filter(
                    SessionAnswer.scenario_id == scenario.id
                ),
                start,
                end,
            ).scalar()
            or 0
        )
        wrong_answers = (
            answers_in_period(
                db.query(func.count(SessionAnswer.id)).filter(
                    SessionAnswer.scenario_id == scenario.id, SessionAnswer.points < 10
                ),
                start,
                end,
            ).scalar()
            or 0
        )
        error_rate = round(wrong_answers / total_answers * 100, 1) if total_answers else 0.0

        # Считаем "сколько раз выбрали" по каждому варианту сразу списком —
        # проценты нужно раздавать все вместе (см. percentages_of), а не
        # по одному, иначе они не будут гарантированно суммироваться в 100.
        picked_counts = [
            answers_in_period(
                db.query(func.count(SessionAnswer.id)).filter(SessionAnswer.option_id == option.id),
                start,
                end,
            ).scalar()
            or 0
            for option in scenario.options
        ]
        picked_percents = percentages_of(picked_counts)

        options: list[OptionStat] = [
            OptionStat(
                id=option.id,
                code=option.code,
                label=option.label,
                points=option.points,
                picked_percent=picked_percent,
            )
            for option, picked_percent in zip(scenario.options, picked_percents)
        ]

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
    period: Period = Query("all"),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    start, end = period_range(period, db)
    tiers = db.query(Tier).order_by(Tier.order_index).all()
    # Как и с процентами по вариантам ответа: считаем счётчики по всем
    # уровням сразу и раздаём проценты одним пакетом (percentages_of), чтобы
    # круговая диаграмма и подписи под ней всегда суммировались в 100%,
    # а не в 99.9%/100.1% из-за независимого округления каждой доли.
    def finished_count(tier_id: int) -> int:
        query = db.query(func.count(GameSession.id)).filter(
            GameSession.tier_id == tier_id, GameSession.finished_at.isnot(None)
        )
        if start is not None:
            query = query.filter(GameSession.finished_at >= start, GameSession.finished_at <= end)
        return query.scalar() or 0

    counts = [finished_count(tier.id) for tier in tiers]
    percents = percentages_of(counts)
    return [
        ProfileDistributionItem(key=tier.key, label=tier.level, percent=percent, count=count)
        for tier, percent, count in zip(tiers, percents, counts)
    ]


# ---------------------------------------------------------------------------
# GET /api/admin/stats/mistakes
# ---------------------------------------------------------------------------


@router.get("/mistakes", response_model=list[CommonMistake])
def common_mistakes(
    limit: int = Query(3, ge=1, le=10),
    period: Period = Query("all"),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """Самые частые НЕ лучшие ответы по всем сценариям — чтобы понять,
    какие темы стоит объяснять на выставке подробнее."""
    start, end = period_range(period, db)
    candidates: list[CommonMistake] = []

    scenarios = db.query(Scenario).order_by(Scenario.order_index).all()
    for scenario in scenarios:
        total_answers = (
            answers_in_period(
                db.query(func.count(SessionAnswer.id)).filter(
                    SessionAnswer.scenario_id == scenario.id
                ),
                start,
                end,
            ).scalar()
            or 0
        )
        if not total_answers:
            continue
        for option in scenario.options:
            if option.points >= 10:
                continue
            picked = (
                answers_in_period(
                    db.query(func.count(SessionAnswer.id)).filter(
                        SessionAnswer.option_id == option.id
                    ),
                    start,
                    end,
                ).scalar()
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