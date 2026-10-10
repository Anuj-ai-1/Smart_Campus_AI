import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.student import Student
from app.models.user import User
from app.core.security import hash_password
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.schemas.analytics import AnalyticsOverviewResponse, DepartmentStat, QuadrantPoint
from app.services.scoring import (
    calculate_pillars,
    calculate_success_score,
    determine_risk_flags,
    generate_explainability,
    generate_recommended_action,
)
from app.services.ml_service import ml_service


class StudentService:
    @staticmethod
    def _recalculate_student_metrics(student: Student):
        """Runs the calculation engine + ML clustering on a student ORM object (in-place)."""
        pillars = calculate_pillars(
            cgpa=student.cgpa,
            backlogs=student.backlogs,
            attendance=student.attendance,
            lms_login_freq_weekly=student.lms_login_freq_weekly,
            lms_completion_rate=student.lms_completion_rate,
            aptitude_score=student.aptitude_score,
            coding_score=student.coding_score,
            mock_interview_score=student.mock_interview_score,
            certifications_count=student.certifications_count,
            hackathons_count=student.hackathons_count,
        )
        success_score = calculate_success_score(pillars)
        risk_flags = determine_risk_flags(
            cgpa=student.cgpa,
            backlogs=student.backlogs,
            attendance=student.attendance,
            placement_pillar=pillars["placement"],
        )
        strengths, risks = generate_explainability(
            cgpa=student.cgpa,
            backlogs=student.backlogs,
            attendance=student.attendance,
            lms_login_freq_weekly=student.lms_login_freq_weekly,
            lms_completion_rate=student.lms_completion_rate,
            aptitude_score=student.aptitude_score,
            coding_score=student.coding_score,
            mock_interview_score=student.mock_interview_score,
            certifications_count=student.certifications_count,
            hackathons_count=student.hackathons_count,
        )
        action = generate_recommended_action(
            cgpa=student.cgpa,
            backlogs=student.backlogs,
            attendance=student.attendance,
            coding_score=student.coding_score,
            aptitude_score=student.aptitude_score,
            lms_completion_rate=student.lms_completion_rate,
            certifications_count=student.certifications_count,
            hackathons_count=student.hackathons_count,
            risk_flags=risk_flags,
        )
        segment = ml_service.predict_segment(pillars)

        student.academic_pillar = pillars["academic"]
        student.attendance_pillar = pillars["attendance"]
        student.placement_pillar = pillars["placement"]
        student.lms_pillar = pillars["lms"]
        student.engagement_pillar = pillars["engagement"]
        student.success_score = success_score
        student.risk_flags = json.dumps(risk_flags)
        student.segment = segment
        student.top_strengths = json.dumps(strengths)
        student.top_risks = json.dumps(risks)
        student.recommended_action = action

    # ── Raw ORM getter (for ownership checks) ───────────────────────────────
    @classmethod
    def get_student_raw(cls, db: Session, student_id: str) -> Optional[Student]:
        return db.query(Student).filter(Student.student_id == student_id).first()

    # ── CRUD ─────────────────────────────────────────────────────────────────

    @classmethod
    def create_student(cls, db: Session, data: StudentCreate, owner_id: str) -> StudentResponse:
        """Creates and persists a new student owned by `owner_id` (faculty user ID) and provisions student credentials."""
        sid = (data.student_id or data.id or "").strip().upper()
        if not sid:
            count = db.query(Student).count()
            sid = f"STU{1000 + count + 1}"

        student_email = (data.email or "").strip().lower()
        if not student_email:
            raise ValueError("Student campus email is required so the student can log in.")

        existing_sid = db.query(Student).filter(Student.student_id == sid).first()
        if existing_sid:
            raise ValueError(f"A student with ID '{sid}' already exists.")

        existing_stu_email = db.query(Student).filter(Student.email == student_email).first()
        if existing_stu_email:
            raise ValueError(f"A student with email '{student_email}' already exists.")

        existing_user_email = db.query(User).filter(User.email == student_email).first()
        if existing_user_email:
            raise ValueError(f"A user account with email '{student_email}' already exists.")

        student = Student(
            student_id=sid,
            name=data.name.strip(),
            email=student_email,
            department=data.department,
            year=data.year,
            semester=data.semester,
            division=getattr(data, "division", "A") or "A",
            avatar=data.avatar or "",
            notes=data.notes or "",
            cgpa=data.cgpa,
            backlogs=data.backlogs,
            attendance=data.attendance,
            lms_login_freq_weekly=data.lms_login_freq_weekly,
            lms_completion_rate=data.lms_completion_rate,
            aptitude_score=data.aptitude_score,
            coding_score=data.coding_score,
            mock_interview_score=data.mock_interview_score,
            certifications_count=data.certifications_count,
            hackathons_count=data.hackathons_count,
            clubs_active=data.clubs_active,
            owner_id=owner_id,  # ← tie to faculty
        )
        cls._recalculate_student_metrics(student)
        db.add(student)

        # Provision student login account with default password set by faculty
        default_pwd = (data.default_password or "").strip() or "Student@123"
        salt, pw_hash = hash_password(default_pwd)
        user_account = User(
            id=sid,
            name=data.name.strip(),
            email=student_email,
            password_hash=pw_hash,
            salt=salt,
            role="student",
            title=f"{data.department} · Semester {data.semester}",
            student_id=sid,
            must_change_password=True,
        )
        db.add(user_account)

        db.commit()
        db.refresh(student)
        return StudentResponse.from_orm_student(student)

    @classmethod
    def update_student(cls, db: Session, student_id: str, patch: StudentUpdate) -> Optional[StudentResponse]:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return None
        for field, value in patch.model_dump(exclude_unset=True).items():
            if value is not None and hasattr(student, field):
                setattr(student, field, value)
        cls._recalculate_student_metrics(student)
        
        # If student's name or email was updated, sync to User table as well
        user_record = db.query(User).filter(User.student_id == student_id).first()
        if user_record:
            if patch.name:
                user_record.name = patch.name.strip()
            if patch.email:
                user_record.email = patch.email.strip().lower()
            if patch.department or patch.semester:
                dept = patch.department or student.department
                sem = patch.semester or student.semester
                user_record.title = f"{dept} · Semester {sem}"

        db.commit()
        db.refresh(student)
        return StudentResponse.from_orm_student(student)

    @classmethod
    def get_student(cls, db: Session, student_id: str) -> Optional[StudentResponse]:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return None
        return StudentResponse.from_orm_student(student)

    @classmethod
    def delete_student(cls, db: Session, student_id: str) -> bool:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return False
        # Also clean up student's login user account
        db.query(User).filter(User.student_id == student_id).delete()
        db.delete(student)
        db.commit()
        return True

    @classmethod
    def list_students(
        cls,
        db: Session,
        department: Optional[str] = None,
        year: Optional[int] = None,
        semester: Optional[int] = None,
        division: Optional[str] = None,
        risk_status: Optional[str] = None,
        search: Optional[str] = None,
        owner_id: Optional[str] = None,         # faculty owner fallback
        student_id_filter: Optional[str] = None, # student: only their own record
        cohort_filters: Optional[List[Dict[str, Any]]] = None, # faculty assigned cohorts: [{"department": "CSE", "semester": 4, "division": "A"}]
    ) -> List[StudentResponse]:
        query = db.query(Student)

        # ── Per-user / Cohort isolation ─────────────────────────────────────
        if student_id_filter is not None:
            query = query.filter(Student.student_id == student_id_filter)
        elif cohort_filters is not None and len(cohort_filters) > 0:
            # Build OR conditions for each assigned cohort
            cohort_clauses = []
            for c in cohort_filters:
                c_dept = c.get("department")
                c_sem = c.get("semester")
                c_div = c.get("division")
                conditions = []
                if c_dept and c_dept != "All":
                    conditions.append(Student.department == c_dept)
                if c_sem and str(c_sem) != "All":
                    conditions.append(Student.semester == int(c_sem))
                if c_div and c_div != "All":
                    conditions.append(Student.division == c_div)
                if conditions:
                    from sqlalchemy import and_
                    cohort_clauses.append(and_(*conditions))
            if cohort_clauses:
                query = query.filter(or_(*cohort_clauses))
        elif owner_id is not None:
            query = query.filter(Student.owner_id == owner_id)

        # ── Column filters ──────────────────────────────────────────────────
        if department and department != "all":
            query = query.filter(Student.department == department)
        if year and str(year) != "all":
            query = query.filter(Student.year == int(year))
        if semester and str(semester) != "all":
            query = query.filter(Student.semester == int(semester))
        if division and division != "all":
            query = query.filter(Student.division == division)
        if search and search.strip():
            s = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(Student.name.ilike(s), Student.student_id.ilike(s), Student.email.ilike(s))
            )

        students = query.all()
        responses = [StudentResponse.from_orm_student(s) for s in students]

        # Post-filter by risk status
        if risk_status and risk_status != "all":
            target = risk_status.strip()
            responses = [r for r in responses if target in r.risk_flags or r.risk == target]

        return responses

    @classmethod
    def get_analytics_overview(
        cls,
        db: Session,
        owner_id: Optional[str] = None,
        cohort_filters: Optional[List[Dict[str, Any]]] = None,
    ) -> AnalyticsOverviewResponse:
        """Returns macro cohort KPIs scoped to assigned cohorts or owner_id."""
        query = db.query(Student)
        if cohort_filters is not None and len(cohort_filters) > 0:
            cohort_clauses = []
            for c in cohort_filters:
                c_dept = c.get("department")
                c_sem = c.get("semester")
                c_div = c.get("division")
                conditions = []
                if c_dept and c_dept != "All":
                    conditions.append(Student.department == c_dept)
                if c_sem and str(c_sem) != "All":
                    conditions.append(Student.semester == int(c_sem))
                if c_div and c_div != "All":
                    conditions.append(Student.division == c_div)
                if conditions:
                    from sqlalchemy import and_
                    cohort_clauses.append(and_(*conditions))
            if cohort_clauses:
                query = query.filter(or_(*cohort_clauses))
        elif owner_id:
            query = query.filter(Student.owner_id == owner_id)
        students = query.all()
        responses = [StudentResponse.from_orm_student(s) for s in students]
        total = len(responses)

        if total == 0:
            return AnalyticsOverviewResponse(
                total_students=0, totalStudents=0,
                average_success_score=0.0, averageSuccessScore=0.0,
                academic_risk_count=0, academicRiskCount=0,
                placement_risk_count=0, placementRiskCount=0,
                department_breakdown=[], departmentBreakdown=[],
                quadrant_data=[], quadrantData=[]
            )

        avg_score = round(sum(r.success_score for r in responses) / total, 1)
        academic_risks = sum(1 for r in responses if "Academic Risk" in r.risk_flags)
        placement_risks = sum(1 for r in responses if "Placement Risk" in r.risk_flags)

        dept_groups: Dict[str, List[StudentResponse]] = {}
        for r in responses:
            dept_groups.setdefault(r.department, []).append(r)

        dept_stats = []
        for dept_name, group in dept_groups.items():
            g_total = len(group)
            g_avg = round(sum(s.success_score for s in group) / g_total, 1) if g_total else 0.0
            dept_stats.append(DepartmentStat(
                department=dept_name, dept=dept_name,
                total_students=g_total, average_score=g_avg,
                high_risk=sum(1 for s in group if s.risk == "High"),
                moderate_risk=sum(1 for s in group if s.risk == "Moderate"),
                good=sum(1 for s in group if s.risk == "Good"),
            ))

        quadrant_points = [
            QuadrantPoint(
                id=r.student_id, student_id=r.student_id, name=r.name,
                x=r.pillars.academic, y=r.pillars.placement,
                z=r.success_score, score=r.success_score,
                department=r.department, risk=r.risk,
            )
            for r in responses
        ]

        return AnalyticsOverviewResponse(
            total_students=total, totalStudents=total,
            average_success_score=avg_score, averageSuccessScore=avg_score,
            academic_risk_count=academic_risks, academicRiskCount=academic_risks,
            placement_risk_count=placement_risks, placementRiskCount=placement_risks,
            department_breakdown=dept_stats, departmentBreakdown=dept_stats,
            quadrant_data=quadrant_points, quadrantData=quadrant_points,
        )
