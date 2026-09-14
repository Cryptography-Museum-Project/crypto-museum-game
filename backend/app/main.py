"""
Точка входа. Здесь:
- создаётся приложение FastAPI;
- при старте создаются таблицы в базе и загружаются стартовые данные;
- подключаются все роутеры (файлы с эндпоинтами).

Запуск для разработки:  uvicorn app.main:app --reload
Документация API (Swagger) появится сама на:  http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import admin_auth, admin_content, admin_stats, scenarios, sessions
from app.seed_data import seed_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Создать таблицы, если их ещё нет (на самом первом запуске)
    Base.metadata.create_all(bind=engine)
    # 2. Заполнить базу стартовыми сценариями/уровнями/админом, если она пустая
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Ключ к доверию — API",
    description="Бэкенд игры для выставки Музея криптографии «Ключ к доверию».",
    version="1.0.0",
    lifespan=lifespan,
)

origins = ["*"] if settings.cors_allow_origins == "*" else settings.cors_allow_origins.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenarios.router)
app.include_router(sessions.router)
app.include_router(admin_auth.router)
app.include_router(admin_content.router)
app.include_router(admin_stats.router)


@app.get("/health", tags=["system"])
def health():
    """Простой эндпоинт, чтобы проверить, что сервер вообще жив."""
    return {"status": "ok"}
