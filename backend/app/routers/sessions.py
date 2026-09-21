"""
Игровая сессия — три шага:

1. POST /api/sessions              — посетитель открыл игру, создаём сессию
2. POST /api/sessions/{id}/answers — посетитель ответил на один сценарий
                                      (вызывается 10 раз, по одному на сценарий)
3. POST /api/sessions/{id}/finish  — игра пройдена, считаем итоговый балл и уровень

Данные анонимны: никаких имён, телефонов или email мы не запрашиваем —
только сам факт прохождения и выбранные ответы (это и просит бриф).
"""

import threading
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GameSession, Scenario, ScenarioOption, SessionAnswer, Tier
from app.schemas import AnswerAck, AnswerIn, SessionFinishResponse, SessionStartResponse, TierOut

router = APIRouter(prefix="/api", tags=["sessions"])

# ---------------------------------------------------------------------------
# Блокировка по сессии
# ---------------------------------------------------------------------------

_session_locks: dict[str, threading.Lock] = {}
_session_locks_guard = threading.Lock()


def _get_session_lock(session_id: str) -> threading.Lock:
    with _session_locks_guard:
        lock = _session_locks.get(session_id)
        if lock is None:
            lock = threading.Lock()
            _session_locks[session_id] = lock
        return lock


@router.post("/sessions", response_model=SessionStartResponse, status_code=201)
def start_session(db: Session = Depends(get_db)):
    session = GameSession(id=str(uuid.uuid4()))
    db.add(session)
    db.commit()
    return SessionStartResponse(id=session.id)


def _get_session_or_404(db: Session, session_id: str) -> GameSession:
    session = db.query(GameSession).filter(GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена. Начните игру заново.")
    return session


@router.post("/sessions/{session_id}/answers", response_model=AnswerAck)
def submit_answer(session_id: str, answer: AnswerIn, db: Session = Depends(get_db)):
    """
    Сохраняет ответ на один сценарий. Можно вызывать по одному разу на
    каждый из 10 сценариев, в любом порядке. Повторный ответ на тот же
    сценарий в этой же сессии просто заменяет предыдущий (на случай,
    если пользователь вернулся назад).
    """
    with _get_session_lock(session_id):
        session = _get_session_or_404(db, session_id)
        if session.finished_at is not None:
            raise HTTPException(status_code=400, detail="Эта сессия уже завершена.")

        scenario = db.query(Scenario).filter(Scenario.id == answer.scenario_id).first()
        if not scenario or not scenario.is_active:
            raise HTTPException(
                status_code=400,
                detail="Этот сценарий сейчас не активен — ответ на него не принимается.",
            )

        option = (
            db.query(ScenarioOption)
            .filter(
                ScenarioOption.id == answer.option_id,
                ScenarioOption.scenario_id == answer.scenario_id,
            )
            .first()
        )
        if not option:
            raise HTTPException(status_code=404, detail="Такого варианта ответа не существует.")

        # если на этот сценарий в этой сессии уже был ответ — заменяем его
        db.query(SessionAnswer).filter(
            SessionAnswer.session_id == session_id,
            SessionAnswer.scenario_id == answer.scenario_id,
        ).delete()

        db.add(
            SessionAnswer(
                session_id=session_id,
                scenario_id=answer.scenario_id,
                option_id=option.id,
                points=option.points,
            )
        )
        db.commit()

        return AnswerAck(
            scenario_id=answer.scenario_id,
            option_id=option.id,
            points=option.points,
            explanation=option.explanation,
        )


@router.post("/sessions/{session_id}/finish", response_model=SessionFinishResponse)
def finish_session(session_id: str, db: Session = Depends(get_db)):
    """
    Считает итоговый балл (0..100) по всем сохранённым ответам сессии
    и определяет уровень (tier). Можно вызывать один раз, в конце игры.
    """
    with _get_session_lock(session_id):
        session = _get_session_or_404(db, session_id)
        if session.finished_at is not None:
            raise HTTPException(status_code=400, detail="Эта сессия уже завершена.")

        answers = db.query(SessionAnswer).filter(SessionAnswer.session_id == session_id).all()
        if not answers:
            raise HTTPException(
                status_code=400,
                detail="Нет ни одного сохранённого ответа — сначала пройдите сценарии.",
            )

        active_scenario_ids = {
            s.id for s in db.query(Scenario.id).filter(Scenario.is_active.is_(True)).all()
        }
        active_scenarios_count = len(active_scenario_ids)
        max_score = active_scenarios_count * 10
        total_score = sum(a.points for a in answers)

        percent = round(total_score / max_score * 100) if max_score else 0

        tier = (
            db.query(Tier)
            .filter(Tier.min_percent <= percent, Tier.max_percent >= percent)
            .order_by(Tier.order_index)
            .first()
        )

        session.finished_at = datetime.utcnow()
        session.total_score = total_score
        session.tier_id = tier.id if tier else None
        db.commit()

    if not tier:
        # подстраховка на случай, если границы уровней в базе не покрывают весь 0..100
        tier_out = TierOut(key="unknown", level="—", title="", body="", cta="")
    else:
        tier_out = TierOut.model_validate(tier)

    return SessionFinishResponse(
        id=session.id,
        total_score=total_score,
        max_score=max_score,
        tier=tier_out,
    )
