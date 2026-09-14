"""
Модели базы данных.

Каждый класс здесь = одна таблица в базе. Названия полей специально
подобраны так, чтобы совпадать с тем, что уже ожидает фронтенд
(см. frontend/src/types.ts, data/scenarios.ts, data/tiers.ts).
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Tier(Base):
    """Уровень результата: новичок / знаток / эксперт."""

    __tablename__ = "tiers"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(32), unique=True, index=True)  # novice / connoisseur / expert
    level: Mapped[str] = mapped_column(String(64))  # "новичок" — как видит пользователь
    min_percent: Mapped[int] = mapped_column(Integer)  # нижняя граница индекса (0..100)
    max_percent: Mapped[int] = mapped_column(Integer)  # верхняя граница индекса (0..100)
    title: Mapped[str] = mapped_column(String(255), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    cta: Mapped[str] = mapped_column(Text, default="")
    admin_description: Mapped[str] = mapped_column(Text, default="")
    order_index: Mapped[int] = mapped_column(Integer, default=0)


class Scenario(Base):
    """Один игровой сценарий (ситуация)."""

    __tablename__ = "scenarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64))  # "СМАРТФОН"
    category: Mapped[str] = mapped_column(String(32))  # Фишинг / Приватность / Wi-Fi / Финансы / Пароли / Устройства
    description: Mapped[str] = mapped_column(Text)
    visual: Mapped[str] = mapped_column(String(32))  # какой визуал показывать на фронте
    options_heading: Mapped[str] = mapped_column(String(255), default="Ваши действия?")
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    # is_active=False — "резервный" сценарий: хранится в базе, но не
    # попадает в список из 10 показываемых посетителю (см. GET /api/scenarios)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    options: Mapped[list["ScenarioOption"]] = relationship(
        back_populates="scenario",
        cascade="all, delete-orphan",
        order_by="ScenarioOption.order_index",
    )


class ScenarioOption(Base):
    """Один вариант ответа внутри сценария."""

    __tablename__ = "scenario_options"

    id: Mapped[int] = mapped_column(primary_key=True)
    # code — короткий видимый id варианта внутри сценария, напр. "01"
    code: Mapped[str] = mapped_column(String(8))
    scenario_id: Mapped[int] = mapped_column(ForeignKey("scenarios.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(Text)
    points: Mapped[int] = mapped_column(Integer)  # 0, 5 или 10
    explanation: Mapped[str] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    scenario: Mapped[Scenario] = relationship(back_populates="options")


class GameSession(Base):
    """Одно прохождение игры одним посетителем (без персональных данных)."""

    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID, генерируется на сервере
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    total_score: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 0..100, он же "процент"
    tier_id: Mapped[int | None] = mapped_column(ForeignKey("tiers.id"), nullable=True)

    answers: Mapped[list["SessionAnswer"]] = relationship(cascade="all, delete-orphan")
    tier: Mapped[Tier | None] = relationship()


class SessionAnswer(Base):
    """Один выбранный пользователем вариант ответа в рамках сессии."""

    __tablename__ = "session_answers"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    scenario_id: Mapped[int] = mapped_column(ForeignKey("scenarios.id"), index=True)
    option_id: Mapped[int] = mapped_column(ForeignKey("scenario_options.id"), index=True)
    points: Mapped[int] = mapped_column(Integer)  # баллы варианта, сохраняем на момент ответа
    answered_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class AdminUser(Base):
    """Учётная запись сотрудника музея для входа в /admin."""

    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
