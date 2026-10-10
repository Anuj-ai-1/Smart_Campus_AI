from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import List, Optional, Dict, Any
import json


class PillarsSchema(BaseModel):
    academic: float = 0.0
    attendance: float = 0.0
    placement: float = 0.0
    lms: float = 0.0
    engagement: float = 0.0
    extracurricular: float = 0.0  # Alias for frontend

    model_config = ConfigDict(populate_by_name=True)


class ExplainabilitySchema(BaseModel):
    top_strengths: List[str] = Field(default_factory=list)
    top_risks: List[str] = Field(default_factory=list)
    topStrengths: List[str] = Field(default_factory=list)
    topRisks: List[str] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class ProjectItem(BaseModel):
    title: str
    description: Optional[str] = ""
    tech_stack: Optional[str] = ""
    techStack: Optional[str] = ""
    link: Optional[str] = ""

    model_config = ConfigDict(populate_by_name=True)


class CertItem(BaseModel):
    name: str
    issuer: Optional[str] = ""
    year: Optional[str] = ""
    link: Optional[str] = ""

    model_config = ConfigDict(populate_by_name=True)


class SemesterHistoryPoint(BaseModel):
    semester: int
    cgpa: float
    attendance: float
    success_score: float
    successScore: float
    coding_score: float
    codingScore: float

    model_config = ConfigDict(populate_by_name=True)


class PeerMetricBenchmark(BaseModel):
    student_value: float
    dept_average: float
    dept_top_10: float
    percentile: float
    rank: int
    total_cohort: int

    model_config = ConfigDict(populate_by_name=True)


class BadgeItem(BaseModel):
    id: str
    name: str
    category: str
    icon: str
    description: str
    criteria: str
    unlocked: bool
    progress: float
    unlocked_at: Optional[str] = None
    level: str

    model_config = ConfigDict(populate_by_name=True)


class BenchmarkResponse(BaseModel):
    student_id: str
    studentId: str
    student_name: str
    studentName: str
    department: str
    semester: int
    cohort_name: str
    total_peers: int
    overall_rank: int
    overall_percentile: float
    metrics: Dict[str, PeerMetricBenchmark]
    badges: List[BadgeItem]
    badges_unlocked_count: int
    badges_total_count: int

    model_config = ConfigDict(populate_by_name=True)


def generate_default_semester_history(s: Any) -> List[Dict[str, Any]]:
    """
    Returns the student's historical progression by semester.
    If semester_history is present in DB and valid, it is normalized and returned.
    Otherwise, generates a realistic semester-over-semester progression curve up to the student's current semester.
    """
    raw_hist = getattr(s, "semester_history", None)
    if raw_hist:
        try:
            parsed = json.loads(raw_hist) if isinstance(raw_hist, str) else raw_hist
            if isinstance(parsed, list) and len(parsed) > 0:
                normalized = []
                for p in parsed:
                    sss = float(p.get("success_score", p.get("successScore", getattr(s, "success_score", 70.0))))
                    cod = float(p.get("coding_score", p.get("codingScore", getattr(s, "coding_score", 65.0))))
                    normalized.append({
                        "semester": int(p.get("semester", 1)),
                        "cgpa": round(float(p.get("cgpa", getattr(s, "cgpa", 7.5))), 2),
                        "attendance": round(float(p.get("attendance", getattr(s, "attendance", 80.0))), 1),
                        "success_score": round(sss, 1),
                        "successScore": round(sss, 1),
                        "coding_score": round(cod, 1),
                        "codingScore": round(cod, 1),
                        "academic_pillar": round(float(p.get("academic_pillar", getattr(s, "academic_pillar", 75.0))), 1),
                        "attendance_pillar": round(float(p.get("attendance_pillar", getattr(s, "attendance_pillar", 80.0))), 1),
                        "placement_pillar": round(float(p.get("placement_pillar", getattr(s, "placement_pillar", 70.0))), 1),
                        "lms_pillar": round(float(p.get("lms_pillar", getattr(s, "lms_pillar", 72.0))), 1),
                        "engagement_pillar": round(float(p.get("engagement_pillar", getattr(s, "engagement_pillar", 68.0))), 1),
                        "backlogs": int(p.get("backlogs", getattr(s, "backlogs", 0))),
                    })
                return normalized
        except Exception:
            pass

    cur_sem = max(1, min(8, int(getattr(s, "semester", 1) or 1)))
    sid_str = str(getattr(s, "student_id", "") or "STU")
    sid_hash = sum(ord(c) for c in sid_str)

    history = []
    current_cgpa = float(getattr(s, "cgpa", 7.5))
    current_att = float(getattr(s, "attendance", 80.0))
    current_sss = float(getattr(s, "success_score", 70.0))
    current_cod = float(getattr(s, "coding_score", 65.0))
    cur_acad = float(getattr(s, "academic_pillar", 75.0))
    cur_att_p = float(getattr(s, "attendance_pillar", 80.0))
    cur_place = float(getattr(s, "placement_pillar", 70.0))
    cur_lms = float(getattr(s, "lms_pillar", 72.0))
    cur_eng = float(getattr(s, "engagement_pillar", 68.0))
    cur_backlogs = int(getattr(s, "backlogs", 0))

    for sem_num in range(1, cur_sem + 1):
        if sem_num == cur_sem:
            cg = round(current_cgpa, 2)
            att = round(current_att, 1)
            sss = round(current_sss, 1)
            cod = round(current_cod, 1)
            acad_p = round(cur_acad, 1)
            att_p = round(cur_att_p, 1)
            place_p = round(cur_place, 1)
            lms_p = round(cur_lms, 1)
            eng_p = round(cur_eng, 1)
            bklg = cur_backlogs
        else:
            diff = cur_sem - sem_num
            cg_val = current_cgpa - (diff * 0.16) + (((sid_hash + sem_num) % 5 - 2) * 0.05)
            att_val = current_att - (diff * 1.5) + (((sid_hash + sem_num) % 7 - 3) * 0.8)
            sss_val = current_sss - (diff * 3.5) + (((sid_hash + sem_num) % 5 - 2) * 1.2)
            cod_val = current_cod - (diff * 4.0) + (((sid_hash + sem_num) % 7 - 3) * 1.5)
            acad_val = cur_acad - (diff * 2.5) + (((sid_hash + sem_num) % 5 - 2) * 0.9)
            att_p_val = cur_att_p - (diff * 1.5) + (((sid_hash + sem_num) % 7 - 3) * 0.8)
            place_val = cur_place - (diff * 3.8) + (((sid_hash + sem_num) % 5 - 2) * 1.3)
            lms_val = cur_lms - (diff * 2.0) + (((sid_hash + sem_num) % 7 - 3) * 1.0)
            eng_val = cur_eng - (diff * 2.2) + (((sid_hash + sem_num) % 5 - 2) * 1.1)
            bklg = max(0, cur_backlogs if sem_num > 1 else 0)

            cg = round(max(5.0, min(10.0, cg_val)), 2)
            att = round(max(50.0, min(100.0, att_val)), 1)
            sss = round(max(35.0, min(100.0, sss_val)), 1)
            cod = round(max(25.0, min(100.0, cod_val)), 1)
            acad_p = round(max(40.0, min(100.0, acad_val)), 1)
            att_p = round(max(40.0, min(100.0, att_p_val)), 1)
            place_p = round(max(30.0, min(100.0, place_val)), 1)
            lms_p = round(max(35.0, min(100.0, lms_val)), 1)
            eng_p = round(max(30.0, min(100.0, eng_val)), 1)

        history.append({
            "semester": sem_num,
            "cgpa": cg,
            "attendance": att,
            "success_score": sss,
            "successScore": sss,
            "coding_score": cod,
            "codingScore": cod,
            "academic_pillar": acad_p,
            "academicPillar": acad_p,
            "attendance_pillar": att_p,
            "attendancePillar": att_p,
            "placement_pillar": place_p,
            "placementPillar": place_p,
            "lms_pillar": lms_p,
            "lmsPillar": lms_p,
            "engagement_pillar": eng_p,
            "engagementPillar": eng_p,
            "backlogs": bklg,
        })
    return history


class StudentProfileSelfUpdate(BaseModel):
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    github_url: Optional[str] = None
    githubUrl: Optional[str] = None
    linkedin_url: Optional[str] = None
    linkedinUrl: Optional[str] = None
    leetcode_url: Optional[str] = None
    leetcodeUrl: Optional[str] = None
    resume_url: Optional[str] = None
    resumeUrl: Optional[str] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[ProjectItem]] = None
    certifications_list: Optional[List[CertItem]] = None
    certificationsList: Optional[List[CertItem]] = None
    target_roles: Optional[List[str]] = None
    targetRoles: Optional[List[str]] = None
    career_preference: Optional[str] = None
    careerPreference: Optional[str] = None
    location_preference: Optional[str] = None
    locationPreference: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class StudentBase(BaseModel):
    name: str
    email: Optional[str] = ""
    department: str = "CSE"
    year: int = 1
    semester: int = 1
    division: str = "A"
    avatar: Optional[str] = ""
    notes: Optional[str] = ""

    # Portfolio fields
    phone: Optional[str] = ""
    bio: Optional[str] = ""
    github_url: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    leetcode_url: Optional[str] = ""
    resume_url: Optional[str] = ""

    cgpa: float = Field(default=0.0, ge=0.0, le=10.0)
    backlogs: int = Field(default=0, ge=0)
    attendance: float = Field(default=0.0, ge=0.0, le=100.0)

    # Tolerant aliases for input
    lms_login_freq_weekly: int = Field(default=0, ge=0)
    lms_completion_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    aptitude_score: float = Field(default=0.0, ge=0.0, le=100.0)
    coding_score: float = Field(default=0.0, ge=0.0, le=100.0)
    mock_interview_score: float = Field(default=0.0, ge=0.0, le=100.0)
    certifications_count: int = Field(default=0, ge=0)
    hackathons_count: int = Field(default=0, ge=0)
    clubs_active: int = Field(default=0, ge=0)

    model_config = ConfigDict(populate_by_name=True)


class StudentCreate(StudentBase):
    id: Optional[str] = None
    student_id: Optional[str] = None
    default_password: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_input_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Password alias
            if "defaultPassword" in data and "default_password" not in data:
                data["default_password"] = data["defaultPassword"]
            # Student ID reconciliation
            sid = data.get("student_id") or data.get("studentId") or data.get("id")
            if sid:
                data["id"] = sid
                data["student_id"] = sid

            # Metric aliases
            if "weeklyLogins" in data and "lms_login_freq_weekly" not in data:
                data["lms_login_freq_weekly"] = data["weeklyLogins"]
            if "assignmentCompletion" in data and "lms_completion_rate" not in data:
                data["lms_completion_rate"] = data["assignmentCompletion"]
            if "aptitudeScore" in data and "aptitude_score" not in data:
                data["aptitude_score"] = data["aptitudeScore"]
            if "codingScore" in data and "coding_score" not in data:
                data["coding_score"] = data["codingScore"]
            if "internalMarks" in data and "mock_interview_score" not in data:
                data["mock_interview_score"] = data["internalMarks"]
            if "mockInterviewScore" in data and "mock_interview_score" not in data:
                data["mock_interview_score"] = data["mockInterviewScore"]
            if "certifications" in data and "certifications_count" not in data:
                data["certifications_count"] = data["certifications"]
            if "certificationsCount" in data and "certifications_count" not in data:
                data["certifications_count"] = data["certificationsCount"]
            if "hackathons" in data and "hackathons_count" not in data:
                data["hackathons_count"] = data["hackathons"]
            if "hackathonsCount" in data and "hackathons_count" not in data:
                data["hackathons_count"] = data["hackathonsCount"]
            if "clubsActive" in data and "clubs_active" not in data:
                data["clubs_active"] = data["clubsActive"]
        return data


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    division: Optional[str] = None
    avatar: Optional[str] = None
    notes: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    resume_url: Optional[str] = None
    cgpa: Optional[float] = None
    backlogs: Optional[int] = None
    attendance: Optional[float] = None
    lms_login_freq_weekly: Optional[int] = None
    lms_completion_rate: Optional[float] = None
    aptitude_score: Optional[float] = None
    coding_score: Optional[float] = None
    mock_interview_score: Optional[float] = None
    certifications_count: Optional[int] = None
    hackathons_count: Optional[int] = None
    clubs_active: Optional[int] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_update_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "weeklyLogins" in data and "lms_login_freq_weekly" not in data:
                data["lms_login_freq_weekly"] = data["weeklyLogins"]
            if "assignmentCompletion" in data and "lms_completion_rate" not in data:
                data["lms_completion_rate"] = data["assignmentCompletion"]
            if "aptitudeScore" in data and "aptitude_score" not in data:
                data["aptitude_score"] = data["aptitudeScore"]
            if "codingScore" in data and "coding_score" not in data:
                data["coding_score"] = data["codingScore"]
            if "internalMarks" in data and "mock_interview_score" not in data:
                data["mock_interview_score"] = data["internalMarks"]
            if "mockInterviewScore" in data and "mock_interview_score" not in data:
                data["mock_interview_score"] = data["mockInterviewScore"]
            if "certifications" in data and "certifications_count" not in data:
                data["certifications_count"] = data["certifications"]
            if "certificationsCount" in data and "certifications_count" not in data:
                data["certifications_count"] = data["certificationsCount"]
            if "hackathons" in data and "hackathons_count" not in data:
                data["hackathons_count"] = data["hackathons"]
            if "hackathonsCount" in data and "hackathons_count" not in data:
                data["hackathons_count"] = data["hackathonsCount"]
            if "clubsActive" in data and "clubs_active" not in data:
                data["clubs_active"] = data["clubsActive"]
        return data


class StudentResponse(BaseModel):
    # IDs
    id: str
    student_id: str
    studentId: str

    # Profile
    name: str
    email: str
    department: str
    year: int
    semester: int
    division: str = "A"
    avatar: Optional[str] = ""
    notes: Optional[str] = ""

    # Portfolio & Social Details
    phone: str = ""
    bio: str = ""
    github_url: str = ""
    githubUrl: str = ""
    linkedin_url: str = ""
    linkedinUrl: str = ""
    leetcode_url: str = ""
    leetcodeUrl: str = ""
    resume_url: str = ""
    resumeUrl: str = ""
    skills: List[str] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    certifications_list: List[Dict[str, Any]] = Field(default_factory=list)
    certificationsList: List[Dict[str, Any]] = Field(default_factory=list)
    target_roles: List[str] = Field(default_factory=list)
    targetRoles: List[str] = Field(default_factory=list)
    career_preference: str = "Placements"
    careerPreference: str = "Placements"
    location_preference: str = ""
    locationPreference: str = ""

    # Semester-by-semester historical trajectory
    semester_history: List[SemesterHistoryPoint] = Field(default_factory=list)
    semesterHistory: List[SemesterHistoryPoint] = Field(default_factory=list)

    # Raw metrics
    cgpa: float
    backlogs: int
    attendance: float
    lms_login_freq_weekly: int
    weeklyLogins: int
    lms_completion_rate: float
    assignmentCompletion: float
    aptitude_score: float
    aptitudeScore: float
    coding_score: float
    codingScore: float
    mock_interview_score: float
    internalMarks: float
    certifications_count: int
    certifications: int
    hackathons_count: int
    hackathons: int
    clubs_active: int
    clubsActive: int

    # Calculated metrics
    success_score: float
    successScore: float
    score: float
    pillars: PillarsSchema
    risk_flags: List[str]
    riskFlags: List[str]
    risk: str  # "High" | "Moderate" | "Good"
    segment: str
    explainability: ExplainabilitySchema
    recommended_action: str
    recommendedAction: str

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    @classmethod
    def from_orm_student(cls, s: Any) -> "StudentResponse":
        # Parse JSON fields safely
        try:
            flags = json.loads(s.risk_flags) if isinstance(s.risk_flags, str) else (s.risk_flags or [])
        except Exception:
            flags = ["Safe"]

        try:
            strengths = json.loads(s.top_strengths) if isinstance(s.top_strengths, str) else (s.top_strengths or [])
        except Exception:
            strengths = []

        try:
            risks = json.loads(s.top_risks) if isinstance(s.top_risks, str) else (s.top_risks or [])
        except Exception:
            risks = []

        try:
            parsed_skills = json.loads(s.skills) if isinstance(s.skills, str) else (s.skills or [])
        except Exception:
            parsed_skills = []

        try:
            parsed_projects = json.loads(s.projects) if isinstance(s.projects, str) else (s.projects or [])
        except Exception:
            parsed_projects = []

        try:
            parsed_certs = (
                json.loads(s.certifications_list)
                if isinstance(s.certifications_list, str)
                else (s.certifications_list or [])
            )
        except Exception:
            parsed_certs = []

        try:
            parsed_roles = json.loads(s.target_roles) if isinstance(s.target_roles, str) else (s.target_roles or [])
        except Exception:
            parsed_roles = []

        # Determine frontend risk level category
        if "Academic Risk" in flags and "Placement Risk" in flags:
            frontend_risk = "High"
        elif s.success_score < 50.0:
            frontend_risk = "High"
        elif "Academic Risk" in flags or "Placement Risk" in flags or s.success_score < 70.0:
            frontend_risk = "Moderate"
        else:
            frontend_risk = "Good"

        pillars_obj = PillarsSchema(
            academic=s.academic_pillar,
            attendance=s.attendance_pillar,
            placement=s.placement_pillar,
            lms=s.lms_pillar,
            engagement=s.engagement_pillar,
            extracurricular=s.engagement_pillar,
        )

        explain_obj = ExplainabilitySchema(
            top_strengths=strengths,
            top_risks=risks,
            topStrengths=strengths,
            topRisks=risks,
        )

        gh = s.github_url or ""
        li = s.linkedin_url or ""
        lc = s.leetcode_url or ""
        resume = s.resume_url or ""
        career_pref = s.career_preference or "Placements"
        loc_pref = s.location_preference or ""
        history_list = generate_default_semester_history(s)

        return cls(
            id=s.student_id,
            student_id=s.student_id,
            studentId=s.student_id,
            name=s.name,
            email=s.email or "",
            department=s.department,
            year=s.year,
            semester=s.semester,
            division=getattr(s, "division", "A") or "A",
            avatar=s.avatar or "",
            notes=s.notes or "",
            phone=s.phone or "",
            bio=s.bio or "",
            github_url=gh,
            githubUrl=gh,
            linkedin_url=li,
            linkedinUrl=li,
            leetcode_url=lc,
            leetcodeUrl=lc,
            resume_url=resume,
            resumeUrl=resume,
            skills=parsed_skills,
            projects=parsed_projects,
            certifications_list=parsed_certs,
            certificationsList=parsed_certs,
            target_roles=parsed_roles,
            targetRoles=parsed_roles,
            career_preference=career_pref,
            careerPreference=career_pref,
            location_preference=loc_pref,
            locationPreference=loc_pref,
            semester_history=history_list,
            semesterHistory=history_list,
            cgpa=s.cgpa,
            backlogs=s.backlogs,
            attendance=s.attendance,
            lms_login_freq_weekly=s.lms_login_freq_weekly,
            weeklyLogins=s.lms_login_freq_weekly,
            lms_completion_rate=s.lms_completion_rate,
            assignmentCompletion=s.lms_completion_rate,
            aptitude_score=s.aptitude_score,
            aptitudeScore=s.aptitude_score,
            coding_score=s.coding_score,
            codingScore=s.coding_score,
            mock_interview_score=s.mock_interview_score,
            internalMarks=s.mock_interview_score,
            certifications_count=s.certifications_count,
            certifications=s.certifications_count,
            hackathons_count=s.hackathons_count,
            hackathons=s.hackathons_count,
            clubs_active=s.clubs_active,
            clubsActive=s.clubs_active,
            success_score=s.success_score,
            successScore=s.success_score,
            score=s.success_score,
            pillars=pillars_obj,
            risk_flags=flags,
            riskFlags=flags,
            risk=frontend_risk,
            segment=s.segment,
            explainability=explain_obj,
            recommended_action=s.recommended_action or "",
            recommendedAction=s.recommended_action or "",
        )
