"""
Настройка подключения к базе данных.

Мы используем SQLAlchemy — библиотеку, которая позволяет работать
с базой данных через обычные Python-классы, не переходя на "сырой" SQL.
"""

from sqlalchemy import create_engine, inspect, text
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


def run_light_migrations() -> None:
    """
    Точечные "миграции" для баз, созданных до появления новой колонки.

    В проекте нет Alembic (пока это не настроено отдельно — см. заметки
    по хардненингу бэкенда), а Base.metadata.create_all() создаёт только
    ОТСУТСТВУЮЩИЕ таблицы целиком и не трогает уже существующие — то есть
    если у кого-то в команде уже есть локальный game.db, созданный до
    появления поля image_url в модели Scenario, само поле там не появится
    и запросы начнут падать ("no such column: scenarios.image_url").

    Здесь — самый простой возможный вариант миграции: смотрим, чего не
    хватает в реальной таблице по сравнению с моделью, и добавляем это
    через ALTER TABLE. Подходит для одной-двух колонок на маленьком
    учебном проекте; если/когда дойдут руки до Alembic — это можно
    полностью удалить.
    """
    inspector = inspect(engine)
    if "scenarios" not in inspector.get_table_names():
        return  # таблицы ещё нет — её создаст create_all(), колонка будет сразу

    existing_columns = {col["name"] for col in inspector.get_columns("scenarios")}
    if "image_url" not in existing_columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE scenarios ADD COLUMN image_url VARCHAR(255)"))
