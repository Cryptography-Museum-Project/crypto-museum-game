"""Вход в админ-панель и информация о текущем админе."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser
from app.schemas import (
    AdminLoginRequest,
    AdminMeResponse,
    AdminPasswordChangeRequest,
    TokenResponse,
)
from app.security import create_access_token, get_current_admin, hash_password, verify_password

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/login", response_model=TokenResponse)
def login(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    return TokenResponse(access_token=create_access_token(user.username))


@router.get("/me", response_model=AdminMeResponse)
def me(admin: AdminUser = Depends(get_current_admin)):
    return AdminMeResponse(id=admin.id, username=admin.username)


@router.post("/me/password")
def change_password(
    payload: AdminPasswordChangeRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    if not verify_password(payload.current_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Текущий пароль указан неверно")
    admin.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"status": "ok"}
