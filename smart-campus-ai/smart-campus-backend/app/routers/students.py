import csv
import io
import json
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth_deps import require_auth, require_faculty
from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentProfileSelfUpdate, BenchmarkResponse
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])


# ── Bulk Upload Schema ───────────────────────────────────────────────────────

class BulkUploadRequest(BaseModel):
    students: List[StudentCreate]


class PromoteRequest(BaseModel):
    department: Optional[str] = None
    year: Optional[int] = None


@router.get("", response_model=List[StudentResponse])
def get_students(
    department: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    semester: Optional[int] = Query(None),
    division: Optional[str] = Query(None),
    risk_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth),
):
    """
    Returns list of students.
    - Admin: sees all students across any branch, semester, division.
    - Faculty: sees only students in their assigned cohorts.
    - Student: sees only their own record.
    """
    if current_user["role"] == "admin":
        return StudentService.list_students(
            db=db,
            department=department,
            year=year,
            semester=semester,
            division=division,
            risk_status=risk_status,
            search=search,
        )
    elif current_user["role"] == "faculty":
        # Check faculty user assigned_cohorts
        faculty_user = db.query(User).filter(User.id == current_user["user_id"]).first()
        cohorts = []
        if faculty_user and faculty_user.assigned_cohorts:
            try:
                cohorts = json.loads(faculty_user.assigned_cohorts)
            except Exception:
                cohorts = []

        return StudentService.list_students(
            db=db,
            department=department,
            year=year,
            semester=semester,
            division=division,
            risk_status=risk_status,
            search=search,
            owner_id=current_user["user_id"] if not cohorts else None,
            cohort_filters=cohorts if cohorts else None,
        )
    else:
        # Student sees only their own record
        return StudentService.list_students(
            db=db,
            student_id_filter=current_user["user_id"],
        )


@router.get("/template-csv")
def download_template_csv(current_user: dict = Depends(require_faculty)):
    """
    Downloads a ready-to-use CSV template for bulk student enrollment.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "student_id", "name", "email", "department", "year", "semester", "division",
        "cgpa", "backlogs", "attendance", "weeklyLogins", "assignmentCompletion",
        "aptitudeScore", "codingScore", "internalMarks", "certifications",
        "hackathons", "clubsActive", "defaultPassword", "notes"
    ])
    # Sample row
    writer.writerow([
        "STU2001", "Aarav Gupta", "aarav.gupta@campus.edu", "CSE", "2", "3", "A",
        "8.4", "0", "88.5", "5", "90.0",
        "75.0", "82.0", "78.0", "2",
        "1", "1", "Student@123", "Strong in Python and web development."
    ])
    writer.writerow([
        "STU2002", "Neha Verma", "neha.verma@campus.edu", "IT", "3", "5", "B",
        "6.5", "2", "68.0", "3", "65.0",
        "55.0", "45.0", "60.0", "0",
        "0", "0", "Student@123", "Needs academic mentoring for theory subjects."
    ])
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=smart_campus_student_template.csv"}
    )


@router.post("/bulk-upload")
def bulk_upload_students(
    payload: BulkUploadRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """
    Enrolls multiple students in bulk from CSV, sets default passwords,
    and returns provisioning credentials summary.
    """
    created_list = []
    errors = []

    for idx, stu_data in enumerate(payload.students):
        try:
            created = StudentService.create_student(
                db=db,
                data=stu_data,
                owner_id=current_user["user_id"]
            )
            created_list.append({
                "student_id": created.student_id,
                "name": created.name,
                "email": created.email,
                "department": created.department,
                "semester": created.semester,
                "default_password": stu_data.default_password or "Student@123",
                "success_score": created.success_score,
                "risk": created.risk
            })
        except Exception as e:
            errors.append({
                "index": idx + 1,
                "student_id": stu_data.student_id or stu_data.id or f"Row {idx+1}",
                "name": stu_data.name,
                "error": str(e)
            })

    return {
        "success": True,
        "total_submitted": len(payload.students),
        "enrolled_count": len(created_list),
        "failed_count": len(errors),
        "enrolled": created_list,
        "errors": errors
    }


@router.post("/batch-promote")
def batch_promote_students(
    req: PromoteRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """
    Promotes students of a cohort/year/department to the next semester & year.
    """
    query = db.query(Student).filter(Student.owner_id == current_user["user_id"])
    if req.department and req.department != "all":
        query = query.filter(Student.department == req.department)
    if req.year and str(req.year) != "all":
        query = query.filter(Student.year == int(req.year))

    students = query.all()
    promoted_count = 0

    for s in students:
        if s.semester < 8:
            # Snapshot current semester performance into history before incrementing
            try:
                hist = json.loads(s.semester_history) if s.semester_history else []
            except Exception:
                hist = []
            if not any(isinstance(h, dict) and h.get("semester") == s.semester for h in hist):
                hist.append({
                    "semester": s.semester,
                    "cgpa": round(s.cgpa, 2),
                    "attendance": round(s.attendance, 1),
                    "success_score": round(s.success_score, 1),
                    "coding_score": round(s.coding_score, 1),
                })
                s.semester_history = json.dumps(hist)

            s.semester += 1
            s.year = (s.semester + 1) // 2
            # Update corresponding User title
            u = db.query(User).filter(User.student_id == s.student_id).first()
            if u:
                u.title = f"{s.department} · Semester {s.semester}"
            promoted_count += 1

    db.commit()
    return {
        "success": True,
        "promoted_count": promoted_count,
        "message": f"Successfully promoted {promoted_count} students to next semester."
    }


@router.post("/{student_id}/promote", response_model=StudentResponse)
def promote_single_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """
    Promote an individual student to next semester.
    """
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
    if student.owner_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized.")

    if student.semester < 8:
        # Snapshot current semester performance into history before incrementing
        try:
            hist = json.loads(student.semester_history) if student.semester_history else []
        except Exception:
            hist = []
        if not any(isinstance(h, dict) and h.get("semester") == student.semester for h in hist):
            hist.append({
                "semester": student.semester,
                "cgpa": round(student.cgpa, 2),
                "attendance": round(student.attendance, 1),
                "success_score": round(student.success_score, 1),
                "coding_score": round(student.coding_score, 1),
            })
            student.semester_history = json.dumps(hist)

        student.semester += 1
        student.year = (student.semester + 1) // 2
        # Sync User title
        u = db.query(User).filter(User.student_id == student.student_id).first()
        if u:
            u.title = f"{student.department} · Semester {student.semester}"
        db.commit()
        db.refresh(student)

    return StudentResponse.from_orm_student(student)


@router.patch("/me/profile", response_model=StudentResponse)
def update_my_student_profile(
    patch: StudentProfileSelfUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth),
):
    """
    Authenticated student updates their personal profile, portfolio, GitHub, LinkedIn,
    LeetCode handles, skills, projects, and certifications.
    """
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can self-update their profile.")

    student = db.query(Student).filter(Student.student_id == current_user["user_id"]).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found.")

    if patch.phone is not None:
        student.phone = patch.phone.strip()
    if patch.bio is not None:
        student.bio = patch.bio.strip()
    if patch.avatar is not None:
        student.avatar = patch.avatar.strip()
    if patch.github_url is not None or patch.githubUrl is not None:
        student.github_url = (patch.github_url or patch.githubUrl or "").strip()
    if patch.linkedin_url is not None or patch.linkedinUrl is not None:
        student.linkedin_url = (patch.linkedin_url or patch.linkedinUrl or "").strip()
    if patch.leetcode_url is not None or patch.leetcodeUrl is not None:
        student.leetcode_url = (patch.leetcode_url or patch.leetcodeUrl or "").strip()
    if patch.resume_url is not None or patch.resumeUrl is not None:
        student.resume_url = (patch.resume_url or patch.resumeUrl or "").strip()
    if patch.skills is not None:
        student.skills = json.dumps(patch.skills)
    if patch.projects is not None:
        student.projects = json.dumps([p.model_dump() for p in patch.projects])
    if patch.certifications_list is not None or patch.certificationsList is not None:
        certs = patch.certifications_list or patch.certificationsList or []
        student.certifications_list = json.dumps([c.model_dump() for c in certs])
        student.certifications_count = len(certs)
    if patch.target_roles is not None or patch.targetRoles is not None:
        roles = patch.target_roles or patch.targetRoles or []
        student.target_roles = json.dumps(roles)
    if patch.career_preference is not None or patch.careerPreference is not None:
        student.career_preference = (patch.career_preference or patch.careerPreference or "Placements").strip()
    if patch.location_preference is not None or patch.locationPreference is not None:
        student.location_preference = (patch.location_preference or patch.locationPreference or "").strip()

    # Recalculate 5 pillars and SSS score so certifications boost their live score
    StudentService._recalculate_student_metrics(student)
    db.commit()
    db.refresh(student)

    return StudentResponse.from_orm_student(student)


def calculate_benchmarks_and_badges(student: Student, db: Session) -> Dict[str, Any]:
    # 1. Fetch cohort peers (same department, or if <= 2, whole institution)
    cohort_query = db.query(Student).filter(Student.department == student.department)
    peers = cohort_query.all()
    if len(peers) < 3:
        peers = db.query(Student).all()

    total_peers = max(1, len(peers))

    # Metric arrays
    sss_list = sorted([p.success_score for p in peers])
    cgpa_list = sorted([p.cgpa for p in peers])
    coding_list = sorted([p.coding_score for p in peers])
    att_list = sorted([p.attendance for p in peers])
    lms_list = sorted([p.lms_completion_rate for p in peers])

    def calc_metric_benchmark(val: float, sorted_vals: List[float]) -> Dict[str, Any]:
        count = len(sorted_vals)
        if count == 0:
            return {
                "student_value": round(val, 2),
                "dept_average": round(val, 2),
                "dept_top_10": round(val, 2),
                "percentile": 50.0,
                "rank": 1,
                "total_cohort": 1,
            }
        avg_val = sum(sorted_vals) / count
        top_10_idx = int(0.9 * count)
        top_10_idx = min(top_10_idx, count - 1)
        top_10_val = sorted_vals[top_10_idx]

        less_count = sum(1 for x in sorted_vals if x < val)
        equal_count = sum(1 for x in sorted_vals if x == val)
        percentile = round(((less_count + 0.5 * equal_count) / count) * 100.0, 1)

        greater_count = sum(1 for x in sorted_vals if x > val)
        rank = 1 + greater_count

        return {
            "student_value": round(val, 2),
            "dept_average": round(avg_val, 2),
            "dept_top_10": round(top_10_val, 2),
            "percentile": min(99.9, max(1.0, percentile)),
            "rank": rank,
            "total_cohort": count,
        }

    sss_bench = calc_metric_benchmark(student.success_score, sss_list)
    cgpa_bench = calc_metric_benchmark(student.cgpa, cgpa_list)
    coding_bench = calc_metric_benchmark(student.coding_score, coding_list)
    att_bench = calc_metric_benchmark(student.attendance, att_list)
    lms_bench = calc_metric_benchmark(student.lms_completion_rate, lms_list)

    # 2. Gamified Badges Engine
    parsed_certs = []
    try:
        if student.certifications_list:
            parsed_certs = json.loads(student.certifications_list) if isinstance(student.certifications_list, str) else student.certifications_list
    except Exception:
        pass

    parsed_projects = []
    try:
        if student.projects:
            parsed_projects = json.loads(student.projects) if isinstance(student.projects, str) else student.projects
    except Exception:
        pass

    badges_data = [
        {
            "id": "algorithm_ace",
            "name": "Algorithm Ace",
            "category": "Coding",
            "icon": "Code2",
            "description": "Demonstrates strong competitive programming and technical problem-solving ability.",
            "criteria": "Coding Assessment >= 80% or linked LeetCode profile",
            "unlocked": student.coding_score >= 80.0 or bool(student.leetcode_url),
            "progress": 100.0 if (student.coding_score >= 80.0 or bool(student.leetcode_url)) else round(min(99.0, (student.coding_score / 80.0) * 100.0), 1),
            "level": "Gold" if student.coding_score >= 90.0 else "Silver",
        },
        {
            "id": "zero_backlog_defender",
            "name": "Zero Backlog Defender",
            "category": "Academic",
            "icon": "ShieldCheck",
            "description": "Maintains a pristine academic record with zero active semester backlogs.",
            "criteria": "0 active semester backlogs",
            "unlocked": student.backlogs == 0,
            "progress": 100.0 if student.backlogs == 0 else round(max(0.0, (1.0 - student.backlogs / 4.0) * 100.0), 1),
            "level": "Gold",
        },
        {
            "id": "hackathon_hustler",
            "name": "Hackathon Hustler",
            "category": "Innovation",
            "icon": "Trophy",
            "description": "Competed in fast-paced software hackathons building prototype applications.",
            "criteria": "Participated in 1 or more hackathons",
            "unlocked": student.hackathons_count >= 1,
            "progress": 100.0 if student.hackathons_count >= 1 else 0.0,
            "level": "Diamond" if student.hackathons_count >= 3 else ("Gold" if student.hackathons_count >= 2 else "Silver"),
        },
        {
            "id": "elite_attendance",
            "name": "Elite Attendance",
            "category": "Consistency",
            "icon": "Clock",
            "description": "Demonstrates unwavering discipline and classroom attendance punctuality.",
            "criteria": "Classroom attendance >= 85%",
            "unlocked": student.attendance >= 85.0,
            "progress": 100.0 if student.attendance >= 85.0 else round((student.attendance / 85.0) * 100.0, 1),
            "level": "Diamond" if student.attendance >= 95.0 else ("Gold" if student.attendance >= 90.0 else "Silver"),
        },
        {
            "id": "certified_specialist",
            "name": "Certified Specialist",
            "category": "Career",
            "icon": "Award",
            "description": "Holds verified industry credentials from AWS, Google, Microsoft, or IBM.",
            "criteria": "1+ verified professional industry certifications",
            "unlocked": student.certifications_count >= 1 or len(parsed_certs) >= 1,
            "progress": 100.0 if (student.certifications_count >= 1 or len(parsed_certs) >= 1) else 0.0,
            "level": "Gold" if (student.certifications_count >= 2 or len(parsed_certs) >= 2) else "Silver",
        },
        {
            "id": "academic_honors",
            "name": "Academic Honors",
            "category": "Academic",
            "icon": "GraduationCap",
            "description": "Consistently performs in the highest percentile of academic coursework.",
            "criteria": "Cumulative CGPA >= 8.5",
            "unlocked": student.cgpa >= 8.5,
            "progress": 100.0 if student.cgpa >= 8.5 else round((student.cgpa / 8.5) * 100.0, 1),
            "level": "Diamond" if student.cgpa >= 9.2 else "Gold",
        },
        {
            "id": "open_source_builder",
            "name": "Open Source Builder",
            "category": "Coding",
            "icon": "GitBranch",
            "description": "Showcases authentic public open-source software projects on GitHub.",
            "criteria": "Linked GitHub profile with 1+ projects",
            "unlocked": bool(student.github_url) and len(parsed_projects) >= 1,
            "progress": 100.0 if (bool(student.github_url) and len(parsed_projects) >= 1) else (50.0 if (bool(student.github_url) or len(parsed_projects) >= 1) else 0.0),
            "level": "Gold",
        },
        {
            "id": "all_round_achiever",
            "name": "All-Round Achiever",
            "category": "Consistency",
            "icon": "Sparkles",
            "description": "Balanced high performance across academics, attendance, coding, LMS, and engagement.",
            "criteria": "Smart Success Score (SSS) >= 75.0",
            "unlocked": student.success_score >= 75.0,
            "progress": 100.0 if student.success_score >= 75.0 else round((student.success_score / 75.0) * 100.0, 1),
            "level": "Diamond" if student.success_score >= 85.0 else "Gold",
        },
        {
            "id": "lms_pioneer",
            "name": "LMS Pioneer",
            "category": "Engagement",
            "icon": "Flame",
            "description": "Demonstrates regular digital study habits and timely assignment submissions.",
            "criteria": "Course completion >= 80% & weekly logins >= 4",
            "unlocked": student.lms_completion_rate >= 80.0 and student.lms_login_freq_weekly >= 4,
            "progress": round(min(100.0, (student.lms_completion_rate / 80.0 * 50.0) + (min(student.lms_login_freq_weekly, 4) / 4.0 * 50.0)), 1),
            "level": "Silver",
        },
    ]

    unlocked_count = sum(1 for b in badges_data if b["unlocked"])

    return {
        "student_id": student.student_id,
        "studentId": student.student_id,
        "student_name": student.name,
        "studentName": student.name,
        "department": student.department,
        "semester": student.semester,
        "cohort_name": f"{student.department} · Semester {student.semester}",
        "total_peers": total_peers,
        "overall_rank": sss_bench["rank"],
        "overall_percentile": sss_bench["percentile"],
        "metrics": {
            "sss_score": sss_bench,
            "cgpa": cgpa_bench,
            "coding_score": coding_bench,
            "attendance": att_bench,
            "lms_completion": lms_bench,
        },
        "badges": badges_data,
        "badges_unlocked_count": unlocked_count,
        "badges_total_count": len(badges_data),
    }


@router.get("/{student_id}/benchmarks", response_model=BenchmarkResponse)
def get_student_benchmarks(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth),
):
    """
    Returns peer benchmarking percentiles, department averages, cohort rank,
    and gamified badge achievements for a student.
    - Student: can only view their own benchmarks.
    - Faculty: can view benchmarks for their assigned students.
    """
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")

    if current_user["role"] == "student" and current_user["user_id"] != student_id:
        raise HTTPException(status_code=403, detail="Students can only view their own benchmarks.")

    if current_user["role"] == "faculty":
        # Check if faculty owns student or belongs to assigned cohorts
        faculty_user = db.query(User).filter(User.id == current_user["user_id"]).first()
        cohorts = []
        if faculty_user and faculty_user.assigned_cohorts:
            try:
                cohorts = json.loads(faculty_user.assigned_cohorts)
            except Exception:
                cohorts = []
        if cohorts:
            matched = any(
                c.get("department") == student.department
                and int(c.get("semester", 0)) == student.semester
                and c.get("division", "A").upper() == (student.division or "A").upper()
                for c in cohorts
            )
            if not matched and student.owner_id != current_user["user_id"]:
                raise HTTPException(status_code=403, detail="This student is not in your assigned cohort.")
        elif student.owner_id != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="This student does not belong to your account.")

    return calculate_benchmarks_and_badges(student, db)


@router.get("/{student_id}", response_model=StudentResponse)
def get_student_by_id(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth),
):
    """Returns 360 profile for a student. Students can only view their own profile."""
    student = StudentService.get_student(db=db, student_id=student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")

    if current_user["role"] == "student" and current_user["user_id"] != student_id:
        raise HTTPException(status_code=403, detail="Students can only view their own profile.")

    if current_user["role"] == "faculty":
        raw = StudentService.get_student_raw(db=db, student_id=student_id)
        if raw:
            faculty_user = db.query(User).filter(User.id == current_user["user_id"]).first()
            cohorts = []
            if faculty_user and faculty_user.assigned_cohorts:
                try:
                    cohorts = json.loads(faculty_user.assigned_cohorts)
                except Exception:
                    cohorts = []
            if cohorts:
                matched = any(
                    c.get("department") == raw.department
                    and int(c.get("semester", 0)) == raw.semester
                    and c.get("division", "A").upper() == (raw.division or "A").upper()
                    for c in cohorts
                )
                if not matched and raw.owner_id != current_user["user_id"]:
                    raise HTTPException(status_code=403, detail="This student is not in your assigned cohort.")
            elif raw.owner_id != current_user["user_id"]:
                raise HTTPException(status_code=403, detail="This student does not belong to your account.")

    return student


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """
    Faculty creates a new student. The student is owned by the logged-in faculty.
    """
    try:
        return StudentService.create_student(db=db, data=data, owner_id=current_user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not create student: {str(e)}")


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    patch: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """Update student. Faculty can only update their own students."""
    raw = StudentService.get_student_raw(db=db, student_id=student_id)
    if not raw:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")
    if raw.owner_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="You can only update your own students.")
    return StudentService.update_student(db=db, student_id=student_id, patch=patch)


@router.patch("/{student_id}", response_model=StudentResponse)
def patch_student(
    student_id: str,
    patch: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """Partial update. Faculty can only update their own students."""
    raw = StudentService.get_student_raw(db=db, student_id=student_id)
    if not raw:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")
    if raw.owner_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="You can only update your own students.")
    return StudentService.update_student(db=db, student_id=student_id, patch=patch)


@router.delete("/{student_id}")
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_faculty),
):
    """Delete student. Faculty can only delete their own students."""
    raw = StudentService.get_student_raw(db=db, student_id=student_id)
    if not raw:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")
    if raw.owner_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own students.")
    StudentService.delete_student(db=db, student_id=student_id)
    return {"success": True, "message": f"Student {student_id} deleted."}
