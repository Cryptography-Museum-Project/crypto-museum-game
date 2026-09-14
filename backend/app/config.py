"""
Все настраиваемые параметры проекта — в одном месте.

Значения по умолчанию рассчитаны на локальный запуск. Для "боевого"
сервера часть значений нужно переопределить через файл .env
(смотри .env.example) — в первую очередь JWT_SECRET и пароль админа.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- База данных ---
    # По умолчанию используется SQLite — это просто файл game.db рядом
    # с приложением, отдельно устанавливать ничего не нужно.
    database_url: str = "sqlite:///./game.db"

    # --- JWT (токен для входа в админку) ---
    jwt_secret: str = "change-me-please"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 240

    # --- Учётка администратора, которая создаётся при первом запуске ---
    admin_default_username: str = "admin"
    admin_default_password: str = "admin123"

    # --- CORS: с каких адресов разрешено обращаться к API ---
    # "*" — разрешить с любого адреса. Для продакшена лучше указать
    # конкретный домен фронтенда, например: "https://key-to-trust.ru"
    cors_allow_origins: str = "*"


settings = Settings()
