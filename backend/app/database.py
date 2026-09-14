"""
Настройка подключения к базе данных.

Мы используем SQLAlchemy — библиотеку, которая позволяет работать
с базой данных через обычные Python-классы, не переходя на "сырой" SQL.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# connect_args нужен только для SQLite: он разрешает использовать одно
# соединение из разных потоков (FastAPI обрабатывает запросы асинхронно).
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Базовый класс, от которого наследуются все модели (таблицы)."""

    pass


def get_db():
    """
    "Зависимость" FastAPI: открывает сессию с базой на время одного
    запроса и гарантированно закрывает её после, даже если была ошибка.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
