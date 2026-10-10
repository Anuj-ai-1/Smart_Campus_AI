import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth_deps import require_admin
from app.models.user import User
from app.models.student import Student

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


# ── Schemas ─────────────────────────────────────────────────────────────────

class CohortAssignmentItem(BaseModel):
    department: str  # "CSE", "IT", "ECE", "ME", "EEE", or "All"
    semester: int    # 1 to 8, or 0 for All
    division: str    # "A", "B", "C", "D", or "All"


class AssignCohortsRequest(BaseModel):
    cohorts: List[CohortAssignmentItem]


class FacultyWithCohortsResponse(BaseModel):
    id: str
    name: str
    email: str
    title: str
    role: str
    assigned_cohorts: List[Dict[str, Any]]
    total_assigned_students: int


class CohortSummaryItem(BaseModel):
    department: str
    semester: int
    division: str
    student_count: int
    avg_cgpa: float
    avg_success_score: float


# ── Admin Endpoints ──────────────────────────────────────────────────────────

@router.get("/faculty", response_model=List[FacultyWithCohortsResponse])
def get_all_faculty_with_cohorts(
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    """
    Returns all faculty accounts with their currently assigned cohorts and student load count.
    """
    faculty_list = db.query(User).filter(User.role == "faculty").all()
    results = []

    for fac in faculty_list:
        cohorts = []
        if fac.assigned_cohorts:
            try:
                cohorts = json.loads(fac.assigned_cohorts)
            except Exception:
                cohorts = []

        # Calculate student count covered by these cohorts
        count = 0
        if cohorts:
            for c in cohorts:
                q = db.query(Student)
                d = c.get("department")
                s = c.get("semester")
                div = c.get("division")
                if d and d != "All":
                    q = q.filter(Student.department == d)
                if s and str(s) != "All" and int(s) > 0:
                    q = q.filter(Student.semester == int(s))
                if div and div != "All":
                    q = q.filter(Student.division == div)
                count += q.count()
        else:
            # Fallback to owned students
            count = db.query(Student).filter(Student.owner_id == fac.id).count()

        results.append(FacultyWithCohortsResponse(
            id=fac.id,
            name=fac.name,
            email=fac.email,
            title=fac.title or "Faculty Member",
            role=fac.role,
            assigned_cohorts=cohorts,
            total_assigned_students=count,
        ))

    return results


@router.post("/faculty/{faculty_id}/assign-cohorts")
def assign_cohorts_to_faculty(
    faculty_id: str,
    payload: AssignCohortsRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    """
    Admin assigns or updates the branches, semesters, and divisions a faculty member is authorized to manage.
    """
    faculty = db.query(User).filter(User.id == faculty_id, User.role == "faculty").first()
    if not faculty:
        raise HTTPException(status_code=404, detail=f"Faculty account '{faculty_id}' not found.")

    cohorts_data = [c.model_dump() for c in payload.cohorts]
    faculty.assigned_cohorts = json.dumps(cohorts_data)
    db.commit()
    db.refresh(faculty)

    return {
        "success": True,
        "message": f"Successfully updated cohort permissions for {faculty.name}.",
        "assigned_cohorts": cohorts_data,
    }


@router.get("/cohorts-summary", response_model=List[CohortSummaryItem])
def get_institutional_cohorts_summary(
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    """
    Returns high-level institution-wide breakdown grouped by Branch, Semester, and Division.
    """
    # Group students by department, semester, division
    groups = (
        db.query(
            Student.department,
            Student.semester,
            Student.division,
            func.count(Student.student_id).label("student_count"),
            func.avg(Student.cgpa).label("avg_cgpa"),
            func.avg(Student.success_score).label("avg_success_score"),
        )
        .group_by(Student.department, Student.semester, Student.division)
        .order_by(Student.department, Student.semester, Student.division)
        .all()
    )

    results = []
    for g in groups:
        results.append(CohortSummaryItem(
            department=g.department,
            semester=g.semester,
            division=g.division or "A",
            student_count=g.student_count,
            avg_cgpa=round(float(g.avg_cgpa or 0.0), 2),
            avg_success_score=round(float(g.avg_success_score or 0.0), 1),
        ))

    return results
