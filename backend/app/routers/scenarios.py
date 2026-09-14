"""GET /api/scenarios — отдаёт список сценариев для игры."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Scenario
from app.schemas import ScenarioPublic

router = APIRouter(prefix="/api", tags=["scenarios"])


@router.get("/scenarios", response_model=list[ScenarioPublic])
def list_scenarios(db: Session = Depends(get_db)):
    """
    Возвращает только активные сценарии (is_active=True), в правильном
    порядке. "Резервные" сценарии сюда не попадают — их можно включить
    позже через админку.
    """
    return (
        db.query(Scenario)
        .filter(Scenario.is_active.is_(True))
        .order_by(Scenario.order_index)
        .all()
    )
