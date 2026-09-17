"""
Редактирование игрового контента из админ-панели:
- сценарии и их варианты ответов;
- тексты уровней (профилей) результата;
- фото сценариев (загрузка файла поверх встроенной иллюстрации).

Все эндпоинты здесь защищены — работают только с валидным токеном
администратора (см. app/security.py::get_current_admin).
"""

import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AdminUser, Scenario, ScenarioOption, Tier
from app.schemas import ScenarioAdmin, ScenarioUpdate, TierAdmin, TierUpdate
from app.security import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin-content"])

# ---------------------------------------------------------------------------
# Фото сценариев — общие настройки для загрузки
# ---------------------------------------------------------------------------

# Ограничиваем и тип, и размер: во-первых, отдаём эти файлы напрямую как
# статику (см. app/main.py), поэтому пускать что попало (например .svg
# с встроенным script) небезопасно; во-вторых, это фото для маленькой
# карточки в игре, 5 МБ более чем достаточно даже с большим запасом.
ALLOWED_IMAGE_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 МБ

SCENARIOS_UPLOAD_DIR = os.path.join(settings.upload_dir, "scenarios")


def _delete_scenario_image_file(image_url: str | None) -> None:
    """Удаляет файл предыдущего фото с диска, если он был.

    Best-effort: если файла уже нет (например, кто-то удалил его руками)
    — просто игнорируем, это не повод возвращать ошибку админу.
    """
    if not image_url:
        return
    filename = os.path.basename(image_url)
    try:
        os.remove(os.path.join(SCENARIOS_UPLOAD_DIR, filename))
    except FileNotFoundError:
        pass


# ---------------------------------------------------------------------------
# Сценарии
# ---------------------------------------------------------------------------


@router.get("/scenarios", response_model=list[ScenarioAdmin])
def list_scenarios_admin(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """В отличие от публичного /api/scenarios — отдаёт ВСЕ сценарии,
    включая отключённые (is_active=False), чтобы их можно было включить."""
    return db.query(Scenario).order_by(Scenario.order_index).all()


@router.get("/scenarios/{scenario_id}", response_model=ScenarioAdmin)
def get_scenario_admin(
    scenario_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Сценарий не найден")
    return scenario


@router.patch("/scenarios/{scenario_id}", response_model=ScenarioAdmin)
def update_scenario(
    scenario_id: int,
    payload: ScenarioUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """
    Полностью обновляет сценарий и его варианты ответов.
    Фронтенд присылает весь список options разом — старые варианты,
    которых нет в присланном списке, удаляются; новые (без id) создаются.
    """
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Сценарий не найден")

    scenario.code = payload.code
    scenario.category = payload.category
    scenario.description = payload.description
    scenario.visual = payload.visual
    scenario.options_heading = payload.options_heading
    scenario.is_active = payload.is_active

    incoming_ids = {o.id for o in payload.options if o.id is not None}
    stale_query = db.query(ScenarioOption).filter(ScenarioOption.scenario_id == scenario_id)
    if incoming_ids:
        stale_query = stale_query.filter(~ScenarioOption.id.in_(incoming_ids))
    stale_query.delete(synchronize_session=False)

    for o in payload.options:
        if o.id is not None:
            existing = db.query(ScenarioOption).filter(ScenarioOption.id == o.id).first()
            if existing:
                existing.code = o.code
                existing.label = o.label
                existing.points = o.points
                existing.explanation = o.explanation
                existing.order_index = o.order_index
                continue
        db.add(
            ScenarioOption(
                scenario_id=scenario_id,
                code=o.code,
                label=o.label,
                points=o.points,
                explanation=o.explanation,
                order_index=o.order_index,
            )
        )

    db.commit()
    db.refresh(scenario)
    return scenario


@router.post("/scenarios/{scenario_id}/image", response_model=ScenarioAdmin)
async def upload_scenario_image(
    scenario_id: int,
    file: UploadFile,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """
    Загружает кастомное фото для сценария — если оно задано, игра
    показывает его вместо встроенной иллюстрации (см. ScenarioScreen на
    фронтенде). Заменяет предыдущее фото этого сценария, если оно было.
    """
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Сценарий не найден")

    extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Поддерживаются только изображения: PNG, JPEG или WebP.",
        )

    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Файл слишком большой (максимум 5 МБ).")
    if not contents:
        raise HTTPException(status_code=400, detail="Файл пустой.")

    os.makedirs(SCENARIOS_UPLOAD_DIR, exist_ok=True)

    # Уникальное имя файла на каждую загрузку (а не просто scenario-{id})
    # — иначе браузер посетителя может закешировать старую картинку под
    # тем же именем и не подхватить замену.
    filename = f"scenario-{scenario_id}-{uuid.uuid4().hex}{extension}"
    with open(os.path.join(SCENARIOS_UPLOAD_DIR, filename), "wb") as f:
        f.write(contents)

    _delete_scenario_image_file(scenario.image_url)
    scenario.image_url = f"/uploads/scenarios/{filename}"
    db.commit()
    db.refresh(scenario)
    return scenario


@router.delete("/scenarios/{scenario_id}/image", response_model=ScenarioAdmin)
def delete_scenario_image(
    scenario_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """Убирает кастомное фото — сценарий возвращается к встроенной
    иллюстрации (полю visual)."""
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Сценарий не найден")

    _delete_scenario_image_file(scenario.image_url)
    scenario.image_url = None
    db.commit()
    db.refresh(scenario)
    return scenario


# ---------------------------------------------------------------------------
# Уровни результата (профили)
# ---------------------------------------------------------------------------


@router.get("/tiers", response_model=list[TierAdmin])
def list_tiers(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return db.query(Tier).order_by(Tier.order_index).all()


@router.patch("/tiers/{tier_key}", response_model=TierAdmin)
def update_tier(
    tier_key: str,
    payload: TierUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """Обновляет только переданные поля (например, только текст описания)."""
    tier = db.query(Tier).filter(Tier.key == tier_key).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Уровень не найден")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(tier, field, value)

    db.commit()
    db.refresh(tier)
    return tier
