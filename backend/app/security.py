"""
Всё, что связано с безопасностью админ-панели:
- хранение пароля в виде хеша (никогда не в открытом виде);
- выдача и проверка JWT-токена после входа.

Как это работает "для новичка":
1. Админ вводит логин/пароль на /api/admin/login.
2. Если верно — сервер выдаёт токен (длинную строку).
3. Дальше фронтенд отправляет этот токен в заголовке
   Authorization: Bearer <токен> при каждом запросе к /api/admin/...
4. Сервер проверяет токен и понимает, что запрос от настоящего админа.
"""

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AdminUser

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login", auto_error=True)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:
    """
    "Охранник" перед админскими эндпоинтами: без валидного токена
    сюда просто не пустит (вернёт ошибку 401).
    """
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Неверный или истёкший токен",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        username: str | None = payload.get("sub")
    except JWTError:
        raise unauthorized
    if not username:
        raise unauthorized

    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user:
        raise unauthorized
    return user
