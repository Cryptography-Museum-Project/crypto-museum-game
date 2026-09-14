"""
Редактирование игрового контента из админ-панели:
- сценарии и их варианты ответов;
- тексты уровней (профилей) результата.

Все эндпоинты здесь защищены — работают только с валидным токеном
администратора (см. app/security.py::get_current_admin).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, Scenario, ScenarioOption, Tier
from app.schemas import ScenarioAdmin, ScenarioUpdate, TierAdmin, TierUpdate
from app.security import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin-content"])

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
