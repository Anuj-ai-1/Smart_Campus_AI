from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_deps import require_faculty
from app.schemas.analytics import AnalyticsOverviewResponse
from app.services.student_service import StudentService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


import json
from app.models.user import User


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """
    Returns macro cohort analytics:
    - Admin: sees institution-wide data across all branches and cohorts.
    - Faculty: scoped strictly to assigned cohorts or owned students.
    """
    if current_user["role"] == "admin":
        return StudentService.get_analytics_overview(db=db, owner_id=None, cohort_filters=None)

    faculty_user = db.query(User).filter(User.id == current_user["user_id"]).first()
    cohorts = []
    if faculty_user and faculty_user.assigned_cohorts:
        try:
            cohorts = json.loads(faculty_user.assigned_cohorts)
        except Exception:
            cohorts = []

    return StudentService.get_analytics_overview(
        db=db,
        owner_id=current_user["user_id"] if not cohorts else None,
        cohort_filters=cohorts if cohorts else None,
    )

