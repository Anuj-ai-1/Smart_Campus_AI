import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional

from app.core.database import get_db
from app.core.auth_deps import require_auth, require_faculty
from app.models.notice import Notice
from app.models.user import User
from app.models.student import Student
from app.schemas.notice import NoticeCreate, NoticeUpdate, NoticeResponse

router = APIRouter(prefix="/notices", tags=["Campus Notices"])


def seed_default_notices_if_empty(db: Session):
    count = db.query(Notice).count()
    if count > 0:
        return

    now = datetime.utcnow().isoformat()
    defaults = [
        Notice(
            id="NOT-001",
            title="TCS Digital & Cognizant 2026 Campus Recruitment Drive Announced",
            content="Registrations are officially open for TCS Digital and Cognizant Elevate on-campus recruitment drive. Students must have a minimum CGPA of 7.0 and 0 active backlogs. Mock technical interviews and aptitude screening tests will take place in the Central Computer Labs next Monday at 10:00 AM.",
            category="Placement",
            priority="Urgent",
            department="All",
            target_year="All",
            is_pinned=1,
            attachment_url="https://campus.placement.edu/drives/2026-tcs",
            author_id="fac-001",
            author_name="Prof. Rajesh K. Sharma",
            author_department="Training & Placement Cell",
            created_at=now,
            updated_at=now,
        ),
        Notice(
            id="NOT-002",
            title="Spring Semester 2026 Mid-Term Examination Schedule & Hall Tickets",
            content="The Mid-Semester theory examinations for all undergraduate departments commence from the 24th of this month. Detailed subject-wise time tables and seating plans have been published on the campus portal. Hall tickets can be downloaded after clearing all LMS assignment submissions.",
            category="Examination",
            priority="High",
            department="All",
            target_year="All",
            is_pinned=1,
            attachment_url="https://exam.campus.edu/spring-2026/schedule.pdf",
            author_id="fac-001",
            author_name="Dr. Anita Desai",
            author_department="Controller of Examinations",
            created_at=now,
            updated_at=now,
        ),
        Notice(
            id="NOT-003",
            title="Smart India Hackathon (SIH 2026) Campus Internal Round Nominations",
            content="Call for student teams for SIH 2026! Teams of 6 members (at least 1 female teammate mandatory) can submit their problem statement abstract by Friday. Shortlisted campus prototypes will receive college incubation funding of up to Rs. 25,000.",
            category="Event",
            priority="Normal",
            department="All",
            target_year="All",
            is_pinned=0,
            attachment_url="https://sih.gov.in",
            author_id="fac-002",
            author_name="Prof. Vikram Sethi",
            author_department="CSE & Innovation Council",
            created_at=now,
            updated_at=now,
        ),
        Notice(
            id="NOT-004",
            title="Mandatory 75% Attendance Compliance Notice & Remedial Classes",
            content="Students with cumulative classroom attendance below 75% are advised to report to their respective department faculty mentors. Mandatory Saturday remedial lab hours will begin this week to make up for attendance deficits prior to final exam eligibility sign-offs.",
            category="Academic",
            priority="High",
            department="All",
            target_year="All",
            is_pinned=0,
            attachment_url="",
            author_id="fac-001",
            author_name="Dean Academic Affairs",
            author_department="Dean Office",
            created_at=now,
            updated_at=now,
        ),
        Notice(
            id="NOT-005",
            title="Campus Holiday Notice: Upcoming National Observance & Lab Maintenance",
            content="The college campus, central library, and server rooms will remain closed on Friday for scheduled high-voltage electrical maintenance and national observance. Regular classes will resume on Monday as per timetable.",
            category="Holiday",
            priority="Normal",
            department="All",
            target_year="All",
            is_pinned=0,
            attachment_url="",
            author_id="fac-001",
            author_name="Campus Registrar",
            author_department="Administration",
            created_at=now,
            updated_at=now,
        ),
    ]
    db.add_all(defaults)
    db.commit()


@router.get("", response_model=List[NoticeResponse])
def get_notices(
    department: Optional[str] = Query(None),
    year: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth),
):
    """
    Fetches campus notices.
    - If user is student, automatically includes notices targeted to 'All' or their department/year.
    - Supports search and filtering by category, priority, and department.
    - Pinned notices are sorted to the top.
    """
    seed_default_notices_if_empty(db)

    query = db.query(Notice)

    # If student, default to audience matching unless specific filter requested
    if current_user["role"] == "student" and not department:
        st = db.query(Student).filter(Student.student_id == current_user["user_id"]).first()
        if st:
            dept_val = st.department
            year_val = str(st.year)
            query = query.filter(
                or_(Notice.department == "All", Notice.department == dept_val),
                or_(Notice.target_year == "All", Notice.target_year == year_val)
            )

    if department and department != "All":
        query = query.filter(or_(Notice.department == "All", Notice.department == department))

    if year and year != "All":
        query = query.filter(or_(Notice.target_year == "All", Notice.target_year == str(year)))

    if category and category != "All":
        query = query.filter(Notice.category == category)

    if priority and priority != "All":
        query = query.filter(Notice.priority == priority)

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Notice.title.ilike(term),
                Notice.content.ilike(term),
                Notice.author_name.ilike(term),
                Notice.category.ilike(term),
            )
        )

    # Sort pinned first, then newest
    notices = query.order_by(Notice.is_pinned.desc(), Notice.created_at.desc()).all()
    return [NoticeResponse.from_orm_notice(n) for n in notices]


@router.get("/{notice_id}", response_model=NoticeResponse)
def get_notice(
    notice_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth),
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found.")
    return NoticeResponse.from_orm_notice(notice)


@router.post("", response_model=NoticeResponse, status_code=status.HTTP_201_CREATED)
def create_notice(
    data: NoticeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """
    Faculty posts a new campus announcement.
    """
    user_record = db.query(User).filter(User.id == current_user["user_id"]).first()
    author_name = user_record.name if user_record else current_user.get("name", "Faculty Member")
    author_dept = user_record.title if user_record and user_record.title else "Academic Faculty"

    notice_id = f"NOT-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.utcnow().isoformat()

    notice = Notice(
        id=notice_id,
        title=data.title.strip(),
        content=data.content.strip(),
        category=data.category or "General",
        priority=data.priority or "Normal",
        department=data.department or "All",
        target_year=data.target_year or "All",
        is_pinned=data.is_pinned or 0,
        attachment_url=(data.attachment_url or "").strip(),
        author_id=current_user["user_id"],
        author_name=author_name,
        author_department=author_dept,
        created_at=now,
        updated_at=now,
        expires_at=data.expires_at or "",
    )

    db.add(notice)
    db.commit()
    db.refresh(notice)
    return NoticeResponse.from_orm_notice(notice)


@router.put("/{notice_id}", response_model=NoticeResponse)
@router.patch("/{notice_id}", response_model=NoticeResponse)
def update_notice(
    notice_id: str,
    patch: NoticeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found.")

    for field, value in patch.model_dump(exclude_unset=True).items():
        if value is not None and hasattr(notice, field):
            setattr(notice, field, value)

    notice.updated_at = datetime.utcnow().isoformat()
    db.commit()
    db.refresh(notice)
    return NoticeResponse.from_orm_notice(notice)


@router.delete("/{notice_id}")
def delete_notice(
    notice_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found.")

    db.delete(notice)
    db.commit()
    return {"success": True, "message": f"Notice {notice_id} deleted."}
