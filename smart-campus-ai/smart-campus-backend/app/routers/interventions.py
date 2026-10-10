import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.auth_deps import require_auth, require_faculty
from app.models.intervention import Intervention
from app.models.student import Student
from app.schemas.intervention import InterventionCreate, InterventionUpdate, InterventionResponse

router = APIRouter(prefix="/interventions", tags=["Interventions"])


@router.get("", response_model=List[InterventionResponse])
def list_interventions(
    student_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth),
):
    """
    List interventions:
    - If faculty: can list all or filter by student_id
    - If student: can only view interventions assigned to them
    """
    query = db.query(Intervention)

    if current_user["role"] == "student":
        query = query.filter(Intervention.student_id == current_user["user_id"])
    else:
        # Faculty
        if student_id:
            query = query.filter(Intervention.student_id == student_id)
        else:
            query = query.filter(Intervention.faculty_id == current_user["user_id"])

    if status_filter and status_filter != "all":
        query = query.filter(Intervention.status == status_filter)

    query = query.order_by(Intervention.created_at.desc())
    return query.all()


@router.post("", response_model=InterventionResponse, status_code=status.HTTP_201_CREATED)
def create_intervention(
    data: InterventionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """
    Faculty assigns a mentoring action or remediation task to an enrolled student.
    """
    # Verify student exists
    student = db.query(Student).filter(Student.student_id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{data.student_id}' not found.")

    intervention_id = f"INT-{uuid.uuid4().hex[:8].upper()}"
    new_int = Intervention(
        id=intervention_id,
        student_id=data.student_id,
        faculty_id=current_user["user_id"],
        title=data.title.strip(),
        description=(data.description or "").strip(),
        category=data.category or "Academic",
        due_date=data.due_date or "",
        status="pending",
        student_notes="",
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat(),
    )
    db.add(new_int)
    db.commit()
    db.refresh(new_int)
    return new_int


@router.patch("/{intervention_id}", response_model=InterventionResponse)
def update_intervention(
    intervention_id: str,
    patch: InterventionUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth),
):
    """
    Update intervention:
    - Student can mark as 'completed' and add student_notes
    - Faculty can mark as 'verified', edit description, title, due_date
    """
    item = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Intervention not found.")

    # Authorization
    if current_user["role"] == "student" and item.student_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this task.")

    if patch.status is not None:
        item.status = patch.status
    if patch.student_notes is not None:
        item.student_notes = patch.student_notes
    if current_user["role"] == "faculty":
        if patch.title is not None:
            item.title = patch.title
        if patch.description is not None:
            item.description = patch.description
        if patch.due_date is not None:
            item.due_date = patch.due_date

    item.updated_at = datetime.utcnow().isoformat()
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{intervention_id}")
def delete_intervention(
    intervention_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """Faculty deletes an intervention task."""
    item = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Intervention not found.")
    db.delete(item)
    db.commit()
    return {"success": True, "message": "Intervention deleted successfully."}
